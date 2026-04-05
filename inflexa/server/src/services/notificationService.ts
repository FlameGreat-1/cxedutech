import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification.types';
import { logger } from '../utils/logger';

/**
 * Creates an admin notification. This is fire-and-forget:
 * failures are logged but never block the calling flow.
 */
async function notify(
  type: NotificationType,
  title: string,
  message: string,
  orderId?: number | null
): Promise<void> {
  try {
    await notificationModel.create({ type, title, message, order_id: orderId });
  } catch (err) {
    logger.error(`Failed to create admin notification (${type}): ${(err as Error).message}`);
  }
}

export function notifyNewOrder(orderId: number, customerName: string, total: string): void {
  notify(
    'new_order',
    'New Order Received',
    `Order #${orderId} placed by ${customerName} for ${total}.`,
    orderId
  ).catch(() => {});
}

export function notifyPaymentCompleted(orderId: number, provider: string, amount: string): void {
  notify(
    'payment_completed',
    'Payment Completed',
    `Payment for order #${orderId} completed via ${provider} (${amount}).`,
    orderId
  ).catch(() => {});
}

export function notifyPaymentFailed(orderId: number, provider: string): void {
  notify(
    'payment_failed',
    'Payment Failed',
    `Payment for order #${orderId} failed via ${provider}. Customer may retry.`,
    orderId
  ).catch(() => {});
}

export function notifyOrderShipped(orderId: number, trackingCode: string, provider: string): void {
  notify(
    'order_shipped',
    'Order Shipped',
    `Order #${orderId} shipped via ${provider}. Tracking: ${trackingCode || 'N/A'}.`,
    orderId
  ).catch(() => {});
}

export function notifyShippingFailed(orderId: number, reason: string): void {
  notify(
    'shipping_failed',
    'Auto-Shipping Failed',
    `Auto-shipping failed for order #${orderId}: ${reason}. Manual shipping required.`,
    orderId
  ).catch(() => {});
}

export function notifyOrderCancelled(orderId: number): void {
  notify(
    'order_cancelled',
    'Order Cancelled',
    `Order #${orderId} has been cancelled.`,
    orderId
  ).catch(() => {});
}

export function notifyOrderDelivered(orderId: number): void {
  notify(
    'order_delivered',
    'Order Delivered',
    `Order #${orderId} has been marked as delivered.`,
    orderId
  ).catch(() => {});
}

export function notifyLowStock(productTitle: string, remaining: number): void {
  notify(
    'low_stock',
    'Low Stock Alert',
    `"${productTitle}" is running low with only ${remaining} unit${remaining === 1 ? '' : 's'} remaining.`
  ).catch(() => {});
}
