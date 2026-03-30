import pool from '../config/database';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { checkAndReserveStock } from './inventoryService';
import { sendDeliveryConfirmation } from './emailService';
import { CreateOrderDTO, IOrder, OrderStatus, VALID_STATUS_TRANSITIONS } from '../types/order.types';
import { logger } from '../utils/logger';

export async function createOrder(
  userId: number | null,
  data: CreateOrderDTO,
  idempotencyKey: string | null = null
): Promise<IOrder> {
  if (idempotencyKey) {
    const existing = await orderModel.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      const items = await orderItemModel.findByOrderId(existing.id);
      return { ...existing, items };
    }
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
  } catch (error) {
    await client.query('ROLLBACK');
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

  const updated = await orderModel.updateStatus(orderId, newStatus);
  if (!updated) {
    throw Object.assign(new Error('Failed to update order status.'), { statusCode: 500 });
  }

  if (newStatus === 'Delivered') {
    sendDeliveryConfirmation(updated).catch((err) =>
      logger.error(`Failed to send delivery confirmation for order #${orderId}`, err)
    );
  }

  return updated;
}
