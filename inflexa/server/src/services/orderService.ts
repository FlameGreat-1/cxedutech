import pool from '../config/database';
import crypto from 'crypto';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import * as shippingConfigModel from '../models/shippingConfigModel';
import { checkAndReserveStock } from './inventoryService';
import { getShippingRates, isShippingEnabled } from './shippingService';
import { calculateTax } from './taxService';
import { sendDeliveryConfirmation, sendShippingConfirmation } from './emailService';
import { notifyNewOrder, notifyOrderCancelled, notifyOrderDelivered } from './notificationService';
import { formatPrice } from '../utils/currency';
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

/**
 * Resolves the shipping cost for an order.
 *
 * If shipping is disabled in admin settings, returns zero.
 * If shipping is enabled and a shipping_rate_id is provided, fetches rates
 * from the active provider and finds the matching rate.
 * If no rate ID is provided but shipping is enabled, uses the cheapest rate.
 * If shipping is enabled but no rates are returned, applies the admin-configured
 * fallback flat rate so the customer still pays for shipping.
 */
async function resolveShippingCost(
  data: CreateOrderDTO
): Promise<{ shipping_cost: number; shipping_carrier: string | null; shipping_service: string | null; shipping_provider: string | null }> {
  const enabled = await isShippingEnabled();

  if (!enabled) {
    return { shipping_cost: 0, shipping_carrier: null, shipping_service: null, shipping_provider: null };
  }

  // Fetch rates from the active shipping provider
  const ratesResult = await getShippingRates(data.shipping, data.items);

  if (!ratesResult.shipping_enabled || ratesResult.rates.length === 0) {
    // Shipping enabled but no rates available (e.g. sandbox, address issue, API error).
    // Apply the admin-configured fallback flat rate instead of defaulting to zero.
    const configs = await shippingConfigModel.findAll();
    const activeConfig = configs.find((c) => c.is_enabled && c.api_key.length > 0);
    const fallbackRate = activeConfig ? Number(activeConfig.fallback_rate) : 0;

    if (fallbackRate > 0) {
      logger.warn(`Shipping enabled but no rates returned. Applying fallback flat rate: ${fallbackRate}.`);
      return {
        shipping_cost: Math.round(fallbackRate * 100) / 100,
        shipping_carrier: 'Flat Rate (Fallback)',
        shipping_service: 'Standard Shipping',
        shipping_provider: ratesResult.provider || null,
      };
    }

    logger.warn('Shipping enabled but no rates returned and fallback rate is 0. Defaulting to zero.');
    return { shipping_cost: 0, shipping_carrier: null, shipping_service: null, shipping_provider: ratesResult.provider || null };
  }

  // If a specific rate was selected by the user, find it
  if (data.shipping_rate_id) {
    const selectedRate = ratesResult.rates.find((r) => r.id === data.shipping_rate_id);
    if (selectedRate) {
      return {
        shipping_cost: Math.round(parseFloat(selectedRate.rate) * 100) / 100,
        shipping_carrier: selectedRate.carrier,
        shipping_service: selectedRate.service,
        shipping_provider: ratesResult.provider || null,
      };
    }
    logger.warn(`Selected shipping rate ID ${data.shipping_rate_id} not found. Using cheapest rate.`);
  }

  // Default to cheapest rate (rates are already sorted by price ascending)
  const cheapest = ratesResult.rates[0];
  return {
    shipping_cost: Math.round(parseFloat(cheapest.rate) * 100) / 100,
    shipping_carrier: cheapest.carrier,
    shipping_service: cheapest.service,
    shipping_provider: ratesResult.provider || null,
  };
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

    // Calculate subtotal (product prices only)
    let subtotal = 0;
    const itemsWithPrice = stockResults.map((sr) => {
      const lineTotal = Number(sr.product.price) * sr.requested;
      subtotal += lineTotal;
      return {
        product_id: sr.product.id,
        quantity: sr.requested,
        unit_price: Number(sr.product.price),
        currency,
      };
    });
    subtotal = Math.round(subtotal * 100) / 100;

    // Resolve shipping cost (0 if disabled, dynamic from active provider if enabled)
    const shippingResult = await resolveShippingCost(data);

    // Calculate tax (0 if disabled, configured rate if enabled)
    const taxResult = await calculateTax(subtotal);

    // Final total = subtotal + shipping + tax
    const totalAmount = Math.round(
      (subtotal + shippingResult.shipping_cost + taxResult.tax_amount) * 100
    ) / 100;

    const order = await orderModel.create(client, {
      user_id: userId,
      subtotal,
      shipping_cost: shippingResult.shipping_cost,
      shipping_carrier: shippingResult.shipping_carrier,
      shipping_service: shippingResult.shipping_service,
      shipping_provider: shippingResult.shipping_provider,
      tax_amount: taxResult.tax_amount,
      tax_rate: taxResult.tax_rate,
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

    logger.info(
      `Order #${order.id} created: subtotal=${subtotal} shipping=${shippingResult.shipping_cost} ` +
      `tax=${taxResult.tax_amount} total=${totalAmount} provider=${shippingResult.shipping_provider || 'none'}`
    );

    notifyNewOrder(order.id, data.shipping.shipping_name, formatPrice(totalAmount, currency));

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

  if (newStatus === 'Cancelled') {
    notifyOrderCancelled(orderId);
  }

  if (newStatus === 'Shipped') {
    sendShippingConfirmation(updated).catch((err) =>
      logger.error(`Failed to send shipping confirmation for order #${orderId}`, err)
    );
  }

  if (newStatus === 'Delivered') {
    notifyOrderDelivered(orderId);
    sendDeliveryConfirmation(updated).catch((err) =>
      logger.error(`Failed to send delivery confirmation for order #${orderId}`, err)
    );
  }

  return updated;
}
