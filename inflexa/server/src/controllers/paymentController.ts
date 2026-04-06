import { Request, Response, NextFunction } from 'express';
import { getStripeClient, getStripeWebhookSecret } from '../config/stripe';
import { verifyWebhookSignature } from '../config/paystack';
import * as paymentService from '../services/paymentService';
import * as paystackService from '../services/paystackService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

// ── Stripe ───────────────────────────────────────────────────────────

export async function createStripeIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { order_id } = req.body;
    const result = await paymentService.createStripePaymentIntent(order_id, userId);
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function createGuestStripeIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { order_id } = req.body;
    const result = await paymentService.createStripePaymentIntent(order_id, null);
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function stripeWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    sendError(res, 'Missing Stripe signature.', 400);
    return;
  }

  try {
    const stripe = await getStripeClient();
    const webhookSecret = await getStripeWebhookSecret();

    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured.');
      sendError(res, 'Webhook not configured.', 503);
      return;
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    await paymentService.handleStripeWebhookEvent(event as unknown as {
      type: string;
      data: { object: Record<string, unknown> };
    });

    res.status(200).json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Stripe webhook error: ${message}`);
    sendError(res, `Webhook error: ${message}`, 400);
  }
}

// ── Paystack ─────────────────────────────────────────────────────────

export async function initializePaystackTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { order_id } = req.body;
    const result = await paystackService.initializeTransaction(order_id, userId);
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function initializeGuestPaystackTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { order_id } = req.body;
    const result = await paystackService.initializeTransaction(order_id, null);
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function verifyPaystackTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reference = req.params.reference as string;
    if (!reference || reference.trim().length === 0) {
      sendError(res, 'Transaction reference is required.', 400);
      return;
    }

    const result = await paystackService.verifyTransaction(reference);
    sendSuccess(res, result);
  } catch (error: unknown) {
    next(error);
  }
}

export async function paystackWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const signature = req.headers['x-paystack-signature'] as string;

  if (!signature) {
    sendError(res, 'Missing Paystack signature.', 400);
    return;
  }

  const rawBody = req.body as Buffer;

  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    logger.error('Paystack webhook signature verification failed.');
    sendError(res, 'Invalid signature.', 401);
    return;
  }

  try {
    const event = JSON.parse(rawBody.toString('utf-8')) as {
      event: string;
      data: Record<string, unknown>;
    };

    await paystackService.handleWebhookEvent(event);

    res.status(200).json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Paystack webhook error: ${message}`);
    sendError(res, `Webhook error: ${message}`, 400);
  }
}

// ── Gateway & Config Status (public) ──────────────────────────────────

export async function getGatewayStatus(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { isStripeEnabled } = await import('../config/stripe');
    const { isPaystackEnabled } = await import('../config/paystack');
    const { isShippingEnabled, getEnabledProviders } = await import('../services/shippingService');
    const { getTaxStatus } = await import('../services/taxService');

    const paymentGatewayConfigModel = await import('../models/paymentGatewayConfigModel');

    const [stripeEnabled, paystackEnabled, shippingEnabled, enabledShippingProviders, taxStatus, stripeConfig, paystackConfig] = await Promise.all([
      isStripeEnabled(),
      isPaystackEnabled(),
      isShippingEnabled(),
      getEnabledProviders(),
      getTaxStatus(),
      paymentGatewayConfigModel.findByProvider('stripe'),
      paymentGatewayConfigModel.findByProvider('paystack'),
    ]);

    sendSuccess(res, {
      stripe: { enabled: stripeEnabled, publicKey: stripeConfig?.public_key || '' },
      paystack: { enabled: paystackEnabled, publicKey: paystackConfig?.public_key || '' },
      shipping: { enabled: shippingEnabled, providers: enabledShippingProviders },
      tax: taxStatus,
    });
  } catch (error: unknown) {
    next(error);
  }
}

// ── Shared ───────────────────────────────────────────────────────────

export async function getPaymentDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const paymentId = parseInt(req.params.paymentId as string, 10);
    const payment = await paymentService.getPaymentByIdForUser(paymentId, userId);
    sendSuccess(res, payment);
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Returns the full order (with items) for a given payment ID.
 * Used by the post-payment confirmation flow. No auth required because
 * the caller must already know the payment ID (obtained from the payment
 * creation or verification step which IS authenticated/scoped).
 */
export async function getOrderByPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = parseInt(req.params.paymentId as string, 10);
    if (isNaN(paymentId)) {
      sendError(res, 'Invalid payment ID.', 400);
      return;
    }
    const order = await paymentService.getOrderByPaymentId(paymentId);
    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}
