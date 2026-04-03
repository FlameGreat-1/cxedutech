import crypto from 'crypto';
import https from 'https';
import { env } from './env';
import { logger } from '../utils/logger';
import * as paymentGatewayConfigModel from '../models/paymentGatewayConfigModel';

const PAYSTACK_HOSTNAME = 'api.paystack.co';

interface PaystackRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
}

export interface PaystackResponse<T = Record<string, unknown>> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackInitData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyData {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string | null;
  metadata: Record<string, string>;
}

/**
 * Returns the Paystack secret key from DB dashboard settings.
 * Falls back to .env PAYSTACK_SECRET_KEY only if DB has no key.
 */
export async function getPaystackSecretKey(): Promise<string> {
  try {
    const config = await paymentGatewayConfigModel.findByProvider('paystack');
    if (config && config.secret_key.length > 0) {
      return config.secret_key;
    }
  } catch (err) {
    logger.warn(`Failed to read Paystack config from DB, falling back to .env: ${(err as Error).message}`);
  }
  return env.paystack.secretKey;
}

/**
 * Returns the Paystack webhook secret from DB, falls back to .env.
 */
export async function getPaystackWebhookSecret(): Promise<string> {
  try {
    const config = await paymentGatewayConfigModel.findByProvider('paystack');
    if (config && config.webhook_secret.length > 0) {
      return config.webhook_secret;
    }
  } catch (err) {
    logger.warn(`Failed to read Paystack webhook secret from DB: ${(err as Error).message}`);
  }
  return env.paystack.webhookSecret;
}

/**
 * Checks if Paystack is enabled via the DB toggle.
 * Falls back to true if .env key exists (backward compat).
 */
export async function isPaystackEnabled(): Promise<boolean> {
  try {
    const config = await paymentGatewayConfigModel.findByProvider('paystack');
    if (config) return config.is_enabled;
  } catch {
    // DB unreachable
  }
  return env.paystack.secretKey.length > 0;
}

/**
 * Makes an authenticated HTTPS request to the Paystack API.
 * Reads the secret key from DB dashboard settings.
 */
export async function paystackRequest<T = Record<string, unknown>>(
  options: PaystackRequestOptions
): Promise<PaystackResponse<T>> {
  const secretKey = await getPaystackSecretKey();

  if (!secretKey) {
    throw Object.assign(
      new Error('Paystack is not configured. Please set up the Paystack secret key in admin Settings.'),
      { statusCode: 503 }
    );
  }

  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;

    const reqOptions: https.RequestOptions = {
      hostname: PAYSTACK_HOSTNAME,
      port: 443,
      path: options.path,
      method: options.method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (chunk: Buffer) => chunks.push(chunk));

      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');

        let parsed: PaystackResponse<T>;
        try {
          parsed = JSON.parse(raw) as PaystackResponse<T>;
        } catch {
          reject(
            Object.assign(
              new Error(`Paystack returned invalid JSON: ${raw.slice(0, 200)}`),
              { statusCode: 502 }
            )
          );
          return;
        }

        if (!parsed.status) {
          logger.error(`Paystack API error: ${parsed.message}`, {
            path: options.path,
            statusCode: res.statusCode,
          });

          reject(
            Object.assign(
              new Error('Payment service request failed. Please try again.'),
              { statusCode: res.statusCode || 502 }
            )
          );
          return;
        }

        resolve(parsed);
      });
    });

    req.on('error', (err) => {
      reject(
        Object.assign(
          new Error(`Paystack network error: ${err.message}`),
          { statusCode: 502 }
        )
      );
    });

    req.setTimeout(15_000, () => {
      req.destroy();
      reject(
        Object.assign(
          new Error('Paystack API request timed out.'),
          { statusCode: 504 }
        )
      );
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

/**
 * Verifies a Paystack webhook signature using HMAC-SHA512.
 * Reads the webhook secret from DB dashboard settings.
 */
export async function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string
): Promise<boolean> {
  const webhookSecret = await getPaystackWebhookSecret();

  if (!webhookSecret) {
    logger.error('Paystack webhook secret not configured. Cannot verify signature.');
    return false;
  }

  const expected = crypto
    .createHmac('sha512', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
