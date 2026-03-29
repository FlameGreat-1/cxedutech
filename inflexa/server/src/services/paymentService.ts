import stripe from '../config/stripe';
import * as paymentModel from '../models/paymentModel';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { sendOrderConfirmation } from './emailService';
import { createShipmentForOrder } from './shippingService';
import { IPayment } from '../types/payment.types';
import { logger } from '../utils/logger';

export async function createPaymentIntent(
  orderId: number,
  userId: number
): Promise<{ clientSecret: string; payment: IPayment }> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  if (order.user_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  if (order.order_status !== 'Pending') {
    throw Object.assign(
      new Error(`Order is already ${order.order_status.toLowerCase()}.`),
      { statusCode: 400 }
    );
  }

  const amountInPence = Math.round(Number(order.total_amount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPence,
    currency: order.currency.toLowerCase(),
    metadata: {
      order_id: String(order.id),
      user_id: String(userId),
    },
  });

  const payment = await paymentModel.create({
    order_id: order.id,
    stripe_payment_intent_id: paymentIntent.id,
    amount: Number(order.total_amount),
    currency: order.currency,
    payment_method: 'card',
    status: 'pending',
  });

  return { clientSecret: paymentIntent.client_secret!, payment };
}

export async function handleWebhookEvent(
  event: { type: string; data: { object: Record<string, unknown> } }
): Promise<void> {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const stripeId = paymentIntent.id as string;
    const metadata = paymentIntent.metadata as Record<string, string>;
    const orderId = parseInt(metadata.order_id, 10);

    const payment = await paymentModel.findByStripeId(stripeId);
    if (payment) {
      await paymentModel.updateStatus(payment.id, 'completed');
    }

    const order = await orderModel.updateStatus(orderId, 'Paid');

    if (order) {
      const items = await orderItemModel.findByOrderId(orderId);

      sendOrderConfirmation(order, items).catch((err) =>
        logger.error('Failed to send order confirmation email', err)
      );

      createShipmentForOrder(order).catch((err) =>
        logger.error('Failed to create shipment', err)
      );
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const stripeId = paymentIntent.id as string;

    const payment = await paymentModel.findByStripeId(stripeId);
    if (payment) {
      await paymentModel.updateStatus(payment.id, 'failed');
    }
  }
}

export async function getPaymentByOrderId(
  orderId: number
): Promise<IPayment | null> {
  return paymentModel.findByOrderId(orderId);
}

export async function getPaymentById(
  paymentId: number
): Promise<IPayment> {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 });
  }
  return payment;
}
