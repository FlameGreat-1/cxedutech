import pool from '../config/database';
import crypto from 'crypto';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { checkAndReserveStock } from './inventoryService';
import { sendDeliveryConfirmation, sendShippingConfirmation } from './emailService';
import { CreateOrderDTO, IOrder, OrderStatus, VALID_STATUS_TRANSITIONS } from '../types/order.types';
import { logger } from '../utils/logger';

/**
 * Finds an existing Pending order for the same user/guest with the same items.
 * This is the server-side safety net against duplicate orders, independent of
 * the client-side idempotency key (which resets on page refresh).
 */
async function findExistingPendingOrder(
  userId: number | null,
  items: { product_id: number; quantity: number }[],
  shippingEmail: string
): Promise<IOrder | null> {
  let pendingOrders: IOrder[];

  if (userId !== null) {
    const result = await pool.query<IOrder>(
      `SELECT * FROM orders
       WHERE user_id = $1 AND order_status = 'Pending'
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );
    pendingOrders = result.rows;
  } else {
    const result = await pool.query<IOrder>(
      `SELECT * FROM orders
       WHERE user_id IS NULL AND LOWER(shipping_email) = LOWER($1) AND order_status = 'Pending'
       ORDER BY created_at DESC LIMIT 5`,
      [shippingEmail]
    );
    pendingOrders = result.rows;
  }

  if (pendingOrders.length === 0) return null;

  // Check if any of these orders have the exact same items
  const sortedRequestedItems = items
    .map((i) => `${i.product_id}:${i.quantity}`)
    .sort()
    .join(',');

  for (const order of pendingOrders) {
    const existingItems = await orderItemModel.findByOrderId(order.id);
    const sortedExistingItems = existingItems
      .map((i) => `${i.product_id}:${i.quantity}`)
      .sort()
      .join(',');

    if (sortedRequestedItems === sortedExistingItems) {
      logger.info(
        `Reusing existing Pending order #${order.id} for ` +
        `${userId !== null ? `user ${userId}` : `guest ${shippingEmail}`}`
      );
      return { ...order, items: existingItems };
    }
  }

  return null;
}

export async function createOrder(
  userId: number | null,
  data: CreateOrderDTO,
  idempotencyKey: string | null = null
): Promise<IOrder> {
  // Layer 1: Idempotency key check
  if (idempotencyKey) {
    const existing = await orderModel.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      if (existing.order_status === 'Pending') {
        const items = await orderItemModel.findByOrderId(existing.id);
        return { ...existing, items };
      }
      if (existing.order_status === 'Cancelled') {
        // Free up the key so a new order can use it
        await pool.query(
          'UPDATE orders SET idempotency_key = NULL, updated_at = NOW() WHERE id = $1',
          [existing.id]
        );
        logger.info(`Cleared idempotency key from cancelled order #${existing.id}`);
      } else {
        // Paid, Shipped, Delivered - already processed, return as-is
        const items = await orderItemModel.findByOrderId(existing.id);
        return { ...existing, items };
      }
    }
  }

  // Layer 2: Server-side duplicate check (same user + same items + still Pending)
  const existingOrder = await findExistingPendingOrder(
    userId,
    data.items,
    data.shipping.shipping_email
  );
  if (existingOrder) {
    return existingOrder;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const stockResults = await checkAndReserveStock(client, data.items);

    const currency = data.currency || 'GBP';

    let totalAmount = 0;
    const itemsWithPrice = stockResults.map((sr) => {
      const lineTotal = Number(sr.product.price) * sr.requested;
      totalAmount += lineTotal;
      return {
        product_id: sr.product.id,
        quantity: sr.requested,
        unit_price: Number(sr.product.price),
        currency,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    const order = await orderModel.create(client, {
      user_id: userId,
      total_amount: totalAmount,
      currency,
      shipping_name: data.shipping.shipping_name,
      shipping_email: data.shipping.shipping_email,
      shipping_phone: data.shipping.shipping_phone || null,
      shipping_address_line1: data.shipping.shipping_address_line1,
      shipping_address_line2: data.shipping.shipping_address_line2 || null,
      shipping_city: data.shipping.shipping_city,
      shipping_state: data.shipping.shipping_state,
      shipping_postal_code: data.shipping.shipping_postal_code,
      shipping_country: data.shipping.shipping_country || 'GB',
      idempotency_key: idempotencyKey,
    });

    const items = await orderItemModel.createMany(client, order.id, itemsWithPrice);

    await client.query('COMMIT');

    return { ...order, items };
  } catch (error: unknown) {
    await client.query('ROLLBACK');

    // Handle race condition: two requests with same idempotency key
    // pass the lookup simultaneously, one succeeds, the other hits
    // the unique constraint. Return the existing order.
    const pgError = error as { code?: string };
    if (pgError.code === '23505' && idempotencyKey) {
      const existing = await orderModel.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const existingItems = await orderItemModel.findByOrderId(existing.id);
        return { ...existing, items: existingItems };
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): Promise<IOrder> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  const currentStatus = order.order_status;
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw Object.assign(
      new Error(
        `Cannot transition order from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions from '${currentStatus}': ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}.`
      ),
      { statusCode: 400 }
    );
  }

  if (newStatus === 'Cancelled' && (currentStatus === 'Pending' || currentStatus === 'Paid')) {
    const { restoreOrderInventory } = await import('./orderCleanupService');
    await restoreOrderInventory(orderId);
    logger.info(`Inventory restored for cancelled order #${orderId} (was ${currentStatus}).`);
  }

  if (newStatus === 'Shipped' && !order.tracking_code) {
    const customCode = `INF-TRK-${order.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await orderModel.updateTrackingCode(order.id, customCode);
    logger.info(`Generated manual tracking code ${customCode} for order #${order.id}`);
  }

  const updated = await orderModel.updateStatus(orderId, newStatus);
  if (!updated) {
    throw Object.assign(new Error('Failed to update order status.'), { statusCode: 500 });
  }

  if (newStatus === 'Shipped') {
    sendShippingConfirmation(updated).catch((err) =>
      logger.error(`Failed to send shipping confirmation for order #${orderId}`, err)
    );
  }

  if (newStatus === 'Delivered') {
    sendDeliveryConfirmation(updated).catch((err) =>
      logger.error(`Failed to send delivery confirmation for order #${orderId}`, err)
    );
  }

  return updated;
}
