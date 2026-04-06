import { paystackRequest, verifyWebhookSignature, isPaystackEnabled, PaystackInitData, PaystackVerifyData } from '../config/paystack';
import { env } from '../config/env';
import * as paymentModel from '../models/paymentModel';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { validateOrderForPayment, handlePaymentSuccess } from './paymentService';
import { notifyPaymentFailed } from './notificationService';
import { IPayment } from '../types/payment.types';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * Initializes a Paystack transaction for the given order.
 * Checks if Paystack is enabled in dashboard settings before proceeding.
 */
export async function initializeTransaction(
  orderId: number,
  userId: number | null
): Promise<{ authorization_url: string; reference: string; payment: IPayment }> {
  // Check if Paystack is enabled in dashboard settings
  const enabled = await isPaystackEnabled();
  if (!enabled) {
    throw Object.assign(
      new Error('Paystack payments are currently disabled. Please use another payment method.'),
      { statusCode: 503 }
    );
  }

  const order = await validateOrderForPayment(orderId, userId);

  // Reuse existing pending Paystack payment for this order
  const existingPayment = await paymentModel.findByOrderId(orderId);
  if (
    existingPayment &&
    existingPayment.provider === 'paystack' &&
    existingPayment.status === 'pending' &&
    existingPayment.paystack_reference
  ) {
    try {
      const verification = await paystackRequest<PaystackVerifyData>({
        method: 'GET',
        path: `/transaction/verify/${encodeURIComponent(existingPayment.paystack_reference)}`,
      });

      if (verification.data.status === 'abandoned' || verification.data.status === 'failed') {
        await paymentModel.updateStatus(existingPayment.id, 'failed');
      } else {
        const reInit = await paystackRequest<PaystackInitData>({
          method: 'POST',
          path: '/transaction/initialize',
          body: {
            email: order.shipping_email,
            amount: Math.round(Number(order.total_amount) * 100),
            currency: order.currency.toUpperCase(),
            reference: existingPayment.paystack_reference,
            callback_url: `${env.clientUrl}/checkout/paystack/callback`,
            metadata: {
              order_id: String(order.id),
              user_id: userId !== null ? String(userId) : 'guest',
            },
          },
        });

        return {
          authorization_url: reInit.data.authorization_url,
          reference: existingPayment.paystack_reference,
          payment: existingPayment,
        };
      }
    } catch {
      await paymentModel.updateStatus(existingPayment.id, 'failed');
    }
  }

  const amountInMinorUnit = Math.round(Number(order.total_amount) * 100);
  const reference = `inflexa_${order.id}_${crypto.randomBytes(12).toString('hex')}`;

  try {
    const response = await paystackRequest<PaystackInitData>({
      method: 'POST',
      path: '/transaction/initialize',
      body: {
        email: order.shipping_email,
        amount: amountInMinorUnit,
        currency: order.currency.toUpperCase(),
        reference,
        callback_url: `${env.clientUrl}/checkout/paystack/callback`,
        metadata: {
          order_id: String(order.id),
          user_id: userId !== null ? String(userId) : 'guest',
        },
      },
    });

    const payment = await paymentModel.create({
      order_id: order.id,
      provider: 'paystack',
      stripe_payment_intent_id: null,
      paystack_reference: reference,
      amount: Number(order.total_amount),
      currency: order.currency,
      payment_method: 'card',
      status: 'pending',
    });

    return {
      authorization_url: response.data.authorization_url,
      reference,
      payment,
    };
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    logger.error(`Paystack initialization failed: ${error.message}`, {
      orderId,
      currency: order.currency,
    });

    throw Object.assign(
      new Error('Paystack payment could not be initialized. Please try again or use a different payment method.'),
      { statusCode: error.statusCode || 502 }
    );
  }
}

export async function verifyTransaction(
  reference: string
): Promise<{ verified: boolean; payment: IPayment; order: IOrder | null }> {
  const payment = await paymentModel.findByPaystackReference(reference);
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 });
  }

  if (payment.status === 'completed') {
    const order = await loadFullOrder(payment.order_id);
    return { verified: true, payment, order };
  }

  const response = await paystackRequest<PaystackVerifyData>({
    method: 'GET',
    path: `/transaction/verify/${encodeURIComponent(reference)}`,
  });

  if (response.data.status === 'success') {
    await handlePaymentSuccess(payment, payment.order_id);
    const updated = await paymentModel.findById(payment.id);
    const order = await loadFullOrder(payment.order_id);
    return { verified: true, payment: updated!, order };
  }

  if (response.data.status === 'failed') {
    await paymentModel.updateStatus(payment.id, 'failed');
    notifyPaymentFailed(payment.order_id, 'paystack');
  }

  const updated = await paymentModel.findById(payment.id);
  return { verified: false, payment: updated!, order: null };
}

/**
 * Loads the full order with items for inclusion in payment responses.
 * Returns null instead of throwing so payment verification is never blocked.
 */
async function loadFullOrder(orderId: number): Promise<IOrder | null> {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return null;
    const items = await orderItemModel.findByOrderId(orderId);
    return { ...order, items };
  } catch (err) {
    logger.error(`Failed to load order #${orderId} for payment response: ${(err as Error).message}`);
    return null;
  }
}

export async function handleWebhookEvent(
  event: { event: string; data: Record<string, unknown> }
): Promise<void> {
  if (event.event !== 'charge.success') return;

  const reference = event.data.reference as string;
  if (!reference) {
    logger.warn('Paystack webhook charge.success missing reference.');
    return;
  }

  const payment = await paymentModel.findByPaystackReference(reference);
  if (!payment) {
    logger.warn(`No payment record found for Paystack reference: ${reference}`);
    return;
  }

  const metadata = event.data.metadata as Record<string, string> | undefined;
  const orderId = metadata?.order_id
    ? parseInt(metadata.order_id, 10)
    : payment.order_id;

  await handlePaymentSuccess(payment, orderId);
}

export { verifyWebhookSignature };
