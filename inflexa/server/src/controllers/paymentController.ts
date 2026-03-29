import { Request, Response, NextFunction } from 'express';
import stripe from '../config/stripe';
import { env } from '../config/env';
import * as paymentService from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export async function createPaymentIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { order_id } = req.body;
    const result = await paymentService.createPaymentIntent(order_id, userId);
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
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.stripe.webhookSecret
    );

    await paymentService.handleWebhookEvent(event as {
      type: string;
      data: { object: Record<string, unknown> };
    });

    res.status(200).json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Webhook error: ${message}`);
    sendError(res, `Webhook error: ${message}`, 400);
  }
}

export async function getPaymentDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = parseInt(req.params.paymentId, 10);
    const payment = await paymentService.getPaymentById(paymentId);
    sendSuccess(res, payment);
  } catch (error: unknown) {
    next(error);
  }
}
