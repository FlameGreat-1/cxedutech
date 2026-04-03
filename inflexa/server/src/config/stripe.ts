import Stripe from 'stripe';
import { env } from './env';
import * as paymentGatewayConfigModel from '../models/paymentGatewayConfigModel';
import { logger } from '../utils/logger';

let cachedClient: Stripe | null = null;
let cachedKey: string = '';

/**
 * Returns a Stripe client using the secret key from the DB dashboard settings.
 * Falls back to .env STRIPE_SECRET_KEY only if the DB has no key configured.
 * Caches the client and re-creates it only when the key changes.
 */
export async function getStripeClient(): Promise<Stripe> {
  let secretKey = '';

  try {
    const config = await paymentGatewayConfigModel.findByProvider('stripe');
    if (config && config.secret_key.length > 0) {
      secretKey = config.secret_key;
    }
  } catch (err) {
    logger.warn(`Failed to read Stripe config from DB, falling back to .env: ${(err as Error).message}`);
  }

  // Fallback to .env if DB has no key
  if (!secretKey) {
    secretKey = env.stripe.secretKey;
  }

  if (!secretKey) {
    throw Object.assign(
      new Error('Stripe is not configured. Please set up the Stripe secret key in admin Settings.'),
      { statusCode: 503 }
    );
  }

  if (cachedClient && cachedKey === secretKey) {
    return cachedClient;
  }

  cachedClient = new Stripe(secretKey, {
    apiVersion: env.stripe.apiVersion as Stripe.LatestApiVersion,
    typescript: true,
  });
  cachedKey = secretKey;

  return cachedClient;
}

/**
 * Returns the Stripe webhook secret from DB, falls back to .env.
 */
export async function getStripeWebhookSecret(): Promise<string> {
  try {
    const config = await paymentGatewayConfigModel.findByProvider('stripe');
    if (config && config.webhook_secret.length > 0) {
      return config.webhook_secret;
    }
  } catch (err) {
    logger.warn(`Failed to read Stripe webhook secret from DB: ${(err as Error).message}`);
  }
  return env.stripe.webhookSecret;
}

/**
 * Checks if Stripe is enabled via the DB toggle.
 * Falls back to true if .env key exists (backward compat).
 */
export async function isStripeEnabled(): Promise<boolean> {
  try {
    const config = await paymentGatewayConfigModel.findByProvider('stripe');
    if (config) return config.is_enabled;
  } catch {
    // DB unreachable
  }
  return env.stripe.secretKey.length > 0;
}
