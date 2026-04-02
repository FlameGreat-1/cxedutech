import pool from '../config/database';
import * as orderItemModel from '../models/orderItemModel';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';

/** How long a Pending order can exist before being auto-cancelled (in hours). */
const PENDING_ORDER_MAX_AGE_HOURS = 24;

/** How often the cleanup job runs (in milliseconds). */
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Restores reserved inventory for a given order's items.
 * Called when an order is cancelled (either manually or by auto-expiry).
 */
export async function restoreOrderInventory(orderId: number): Promise<void> {
  const items = await orderItemModel.findByOrderId(orderId);

  for (const item of items) {
    await pool.query(
      'UPDATE products SET inventory_count = inventory_count + $1 WHERE id = $2',
      [item.quantity, item.product_id]
    );
  }

  if (items.length > 0) {
    logger.info(
      `Restored inventory for order #${orderId}: ` +
      items.map((i) => `product #${i.product_id} +${i.quantity}`).join(', ')
    );
  }
}

/**
 * Finds all Pending orders older than PENDING_ORDER_MAX_AGE_HOURS,
 * cancels them, and restores their reserved inventory.
 */
export async function cancelStalePendingOrders(): Promise<number> {
  try {
    // Find stale Pending orders
    const { rows: staleOrders } = await pool.query<IOrder>(
      `SELECT * FROM orders
       WHERE order_status = 'Pending'
         AND created_at < NOW() - INTERVAL '${PENDING_ORDER_MAX_AGE_HOURS} hours'
       ORDER BY created_at ASC`
    );

    if (staleOrders.length === 0) {
      return 0;
    }

    logger.info(`Found ${staleOrders.length} stale Pending order(s) to auto-cancel.`);

    let cancelledCount = 0;

    for (const order of staleOrders) {
      try {
        // Restore inventory first
        await restoreOrderInventory(order.id);

        // Cancel the order and clear its idempotency key so it doesn't block future orders
        await pool.query(
          `UPDATE orders
           SET order_status = 'Cancelled', idempotency_key = NULL, updated_at = NOW()
           WHERE id = $1 AND order_status = 'Pending'`,
          [order.id]
        );

        cancelledCount++;
        logger.info(
          `Auto-cancelled stale Pending order #${order.id} ` +
          `(created ${order.created_at.toISOString()}).`
        );
      } catch (err) {
        // Log but don't stop - continue with other orders
        logger.error(
          `Failed to auto-cancel order #${order.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    logger.info(`Auto-cancel complete: ${cancelledCount}/${staleOrders.length} orders cancelled.`);
    return cancelledCount;
  } catch (err) {
    logger.error(
      `Order cleanup job failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return 0;
  }
}

/**
 * Starts the periodic cleanup scheduler.
 * Runs once immediately on startup, then every CLEANUP_INTERVAL_MS.
 */
export function startOrderCleanupScheduler(): void {
  // Run once on startup (with a short delay to let the server finish initializing)
  setTimeout(() => {
    cancelStalePendingOrders();
  }, 5000);

  // Then run periodically
  cleanupTimer = setInterval(() => {
    cancelStalePendingOrders();
  }, CLEANUP_INTERVAL_MS);

  logger.info(
    `Order cleanup scheduler started: auto-cancelling Pending orders older than ${PENDING_ORDER_MAX_AGE_HOURS}h, ` +
    `checking every ${CLEANUP_INTERVAL_MS / 60000} minutes.`
  );
}

/**
 * Stops the periodic cleanup scheduler (for graceful shutdown).
 */
export function stopOrderCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info('Order cleanup scheduler stopped.');
  }
}
