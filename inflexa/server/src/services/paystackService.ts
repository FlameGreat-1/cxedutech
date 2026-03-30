import { paystackRequest, verifyWebhookSignature, PaystackInitData, PaystackVerifyData } from '../config/paystack';
import { env } from '../config/env';
import * as paymentModel from '../models/paymentModel';
import { validateOrderForPayment, handlePaymentSuccess } from './paymentService';
import { IPayment } from '../types/payment.types';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * Paystack-supported currencies.
 * Paystack processes amounts in the smallest currency unit (kobo for NGN,
 * pesewas for GHS, cents for USD/ZAR).
 */
const PAYSTACK_SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'USD', 'ZAR', 'KES'] as const;

function isSupportedCurrency(currency: string): boolean {
  return (PAYSTACK_SUPPORTED_CURRENCIES as readonly string[]).includes(currency.toUpperCase());
}

/**
 * Initializes a Paystack transaction for the given order.
 *
 * Flow:
 * 1. Validates order ownership and status (shared logic)
 * 2. Checks for existing pending Paystack payment (idempotency)
 * 3. Validates currency is Paystack-supported
 * 4. Calls Paystack Initialize Transaction API
 * 5. Stores payment record with paystack_reference
 * 6. Returns authorization_url for frontend redirect
 */
export async function initializeTransaction(
  orderId: number,
  userId: number | null
): Promise<{ authorization_url: string; reference: string; payment: IPayment }> {
  const order = await validateOrderForPayment(orderId, userId);

  if (!isSupportedCurrency(order.currency)) {
    throw Object.assign(
      new Error(
        `Paystack does not support ${order.currency}. ` +
        `Supported currencies: ${PAYSTACK_SUPPORTED_CURRENCIES.join(', ')}.`
      ),
      { statusCode: 400 }
    );
  }

  // Reuse existing pending Paystack payment for this order
  const existingPayment = await paymentModel.findByOrderId(orderId);
  if (
    existingPayment &&
    existingPayment.provider === 'paystack' &&
    existingPayment.status === 'pending' &&
    existingPayment.paystack_reference
  ) {
    // Verify the transaction is still valid on Paystack's side
    try {
      const verification = await paystackRequest<PaystackVerifyData>({
        method: 'GET',
        path: `/transaction/verify/${encodeURIComponent(existingPayment.paystack_reference)}`,
      });

      if (verification.data.status === 'abandoned' || verification.data.status === 'failed') {
        // Previous attempt failed/abandoned; mark it and create a new one below
        await paymentModel.updateStatus(existingPayment.id, 'failed');
      } else {
        // Still pending or already successful on Paystack's side
        // Re-initialize to get a fresh authorization_url
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
      // If verification fails (e.g. reference not found), create a new transaction
      await paymentModel.updateStatus(existingPayment.id, 'failed');
    }
  }

  const amountInMinorUnit = Math.round(Number(order.total_amount) * 100);

  // Generate a unique reference: prefix + order ID + random bytes
  const reference = `inflexa_${order.id}_${crypto.randomBytes(12).toString('hex')}`;

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
}

/**
 * Server-side verification of a Paystack transaction.
 * Called after the user is redirected back from Paystack's checkout page.
 *
 * This is a defense-in-depth measure: even though the webhook also
 * processes the payment, the callback verification ensures the frontend
 * gets an immediate confirmation without waiting for the webhook.
 */
export async function verifyTransaction(
  reference: string
): Promise<{ verified: boolean; payment: IPayment }> {
  const payment = await paymentModel.findByPaystackReference(reference);
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 });
  }

  if (payment.status === 'completed') {
    return { verified: true, payment };
  }

  const response = await paystackRequest<PaystackVerifyData>({
    method: 'GET',
    path: `/transaction/verify/${encodeURIComponent(reference)}`,
  });

  if (response.data.status === 'success') {
    await handlePaymentSuccess(payment, payment.order_id);

    const updated = await paymentModel.findById(payment.id);
    return { verified: true, payment: updated! };
  }

  if (response.data.status === 'failed') {
    await paymentModel.updateStatus(payment.id, 'failed');
  }

  const updated = await paymentModel.findById(payment.id);
  return { verified: false, payment: updated! };
}

/**
 * Handles Paystack webhook events.
 *
 * Paystack sends a `charge.success` event when a payment succeeds.
 * The raw body and signature are verified before this function is called.
 */
export async function handleWebhookEvent(
  event: { event: string; data: Record<string, unknown> }
): Promise<void> {
  if (event.event !== 'charge.success') {
    return;
  }

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
