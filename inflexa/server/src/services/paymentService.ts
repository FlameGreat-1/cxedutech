import { getStripeClient, isStripeEnabled, getStripeWebhookSecret } from '../config/stripe';
import * as paymentModel from '../models/paymentModel';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { sendOrderConfirmation } from './emailService';
import { shipOrder } from './shippingService';
import { notifyPaymentCompleted, notifyShippingFailed } from './notificationService';
import { formatPrice } from '../utils/currency';
import { IPayment } from '../types/payment.types';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';

export async function validateOrderForPayment(
  orderId: number,
  userId: number | null
): Promise<IOrder> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  if (userId !== null && order.user_id !== null && order.user_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  if (userId === null && order.user_id !== null) {
    throw Object.assign(new Error('This order requires authentication.'), { statusCode: 401 });
  }

  if (userId !== null && order.user_id === null) {
    throw Object.assign(new Error('Access denied. This is a guest order.'), { statusCode: 403 });
  }

  if (order.order_status !== 'Pending') {
    throw Object.assign(
      new Error(`Order is already ${order.order_status.toLowerCase()}.`),
      { statusCode: 400 }
    );
  }

  return order;
}

export async function handlePaymentSuccess(
  payment: IPayment,
  orderId: number
): Promise<void> {
  if (payment.status === 'completed') {
    logger.info(`Payment ${payment.id} already completed, skipping.`);
    return;
  }

  await paymentModel.updateStatus(payment.id, 'completed');

  const order = await orderModel.findById(orderId);
  if (!order) {
    logger.error(`Order ${orderId} not found during payment success processing.`);
    return;
  }

  if (order.order_status !== 'Pending') {
    logger.info(`Order ${orderId} status is ${order.order_status}, skipping update.`);
    return;
  }

  await orderModel.updateStatus(orderId, 'Paid');

  notifyPaymentCompleted(orderId, payment.provider, formatPrice(Number(order.total_amount), order.currency));

  const items = await orderItemModel.findByOrderId(orderId);

  sendOrderConfirmation(order, items).catch((err) =>
    logger.error('Failed to send order confirmation email', err)
  );

  shipOrder(orderId).catch((err) => {
    const reason = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Auto-shipping failed for order #${orderId}`, err);
    notifyShippingFailed(orderId, reason);
  });
}

/**
 * Converts a Stripe SDK error into a safe, user-facing error.
 * Raw Stripe errors (including API keys, internal IDs) are logged server-side only.
 */
function handleStripeError(err: unknown): never {
  const error = err as Error & { type?: string };
  logger.error(`Stripe API error: ${error.message}`, { type: error.type });

  if (error.type === 'StripeAuthenticationError') {
    throw Object.assign(
      new Error('Card payment is temporarily unavailable. Please try another payment method or try again later.'),
      { statusCode: 502 }
    );
  }

  if (error.type === 'StripeConnectionError') {
    throw Object.assign(
      new Error('Unable to connect to the payment service. Please try again in a few minutes.'),
      { statusCode: 502 }
    );
  }

  if (error.type === 'StripeRateLimitError') {
    throw Object.assign(
      new Error('Payment service is busy. Please try again in a moment.'),
      { statusCode: 429 }
    );
  }

  throw Object.assign(
    new Error('Payment processing failed. Please try again or use a different payment method.'),
    { statusCode: 502 }
  );
}

export async function createStripePaymentIntent(
  orderId: number,
  userId: number | null
): Promise<{ clientSecret: string; payment: IPayment }> {
  // Check if Stripe is enabled in dashboard settings
  const enabled = await isStripeEnabled();
  if (!enabled) {
    throw Object.assign(
      new Error('Stripe payments are currently disabled. Please use another payment method.'),
      { statusCode: 503 }
    );
  }

  const stripe = await getStripeClient();
  const order = await validateOrderForPayment(orderId, userId);

  // Reuse existing pending Stripe payment for this order
  const existingPayment = await paymentModel.findByOrderId(orderId);
  if (
    existingPayment &&
    existingPayment.provider === 'stripe' &&
    existingPayment.status === 'pending' &&
    existingPayment.stripe_payment_intent_id
  ) {
    try {
      const existingIntent = await stripe.paymentIntents.retrieve(
        existingPayment.stripe_payment_intent_id
      );
      if (existingIntent.client_secret) {
        return { clientSecret: existingIntent.client_secret, payment: existingPayment };
      }
    } catch (err) {
      logger.warn(`Failed to retrieve existing Stripe intent: ${(err as Error).message}`);
      // Fall through to create a new one
    }
  }

  try {
    const amountInMinorUnit = Math.round(Number(order.total_amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInMinorUnit,
      currency: order.currency.toLowerCase(),
      metadata: {
        order_id: String(order.id),
        user_id: userId !== null ? String(userId) : 'guest',
      },
    });

    const payment = await paymentModel.create({
      order_id: order.id,
      provider: 'stripe',
      stripe_payment_intent_id: paymentIntent.id,
      paystack_reference: null,
      amount: Number(order.total_amount),
      currency: order.currency,
      payment_method: 'card',
      status: 'pending',
    });

    return { clientSecret: paymentIntent.client_secret!, payment };
  } catch (err) {
    handleStripeError(err);
  }
}

export async function handleStripeWebhookEvent(
  event: { type: string; data: { object: Record<string, unknown> } }
): Promise<void> {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const stripeId = paymentIntent.id as string;
    const metadata = paymentIntent.metadata as Record<string, string>;
    const orderId = parseInt(metadata.order_id, 10);

    const payment = await paymentModel.findByStripeId(stripeId);
    if (!payment) {
      logger.warn(`No payment record found for Stripe ID: ${stripeId}`);
      return;
    }

    await handlePaymentSuccess(payment, orderId);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const stripeId = paymentIntent.id as string;

    const payment = await paymentModel.findByStripeId(stripeId);
    if (payment && payment.status !== 'failed') {
      await paymentModel.updateStatus(payment.id, 'failed');
    }
  }
}

export async function getPaymentByOrderId(
  orderId: number
): Promise<IPayment | null> {
  return paymentModel.findByOrderId(orderId);
}

export async function getPaymentByIdForUser(
  paymentId: number,
  userId: number
): Promise<IPayment> {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 });
  }

  const order = await orderModel.findById(payment.order_id);
  if (!order) {
    throw Object.assign(new Error('Associated order not found.'), { statusCode: 404 });
  }

  if (order.user_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  return payment;
}

/**
 * Returns the full order (with items) associated with a payment.
 * Used by the post-payment confirmation flow to get authoritative
 * order data (subtotal, shipping_cost, tax_amount, etc.) in a single
 * request without requiring user authentication.
 */
export async function getOrderByPaymentId(
  paymentId: number
): Promise<IOrder> {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 });
  }

  const order = await orderModel.findById(payment.order_id);
  if (!order) {
    throw Object.assign(new Error('Associated order not found.'), { statusCode: 404 });
  }

  const items = await orderItemModel.findByOrderId(order.id);
  return { ...order, items };
}

export { getStripeWebhookSecret };
