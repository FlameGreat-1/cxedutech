import crypto from 'crypto';
import https from 'https';
import { env } from './env';

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
 * Makes an authenticated HTTPS request to the Paystack API.
 *
 * Uses Node's built-in https module (zero dependencies) with the
 * secret key from environment configuration.
 */
export function paystackRequest<T = Record<string, unknown>>(
  options: PaystackRequestOptions
): Promise<PaystackResponse<T>> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;

    const reqOptions: https.RequestOptions = {
      hostname: PAYSTACK_HOSTNAME,
      port: 443,
      path: options.path,
      method: options.method,
      headers: {
        Authorization: `Bearer ${env.paystack.secretKey}`,
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
          reject(
            Object.assign(
              new Error(parsed.message || 'Paystack API request failed.'),
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

    // 15-second timeout to prevent hanging connections
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
 *
 * Paystack signs every webhook payload with your secret key and sends
 * the hex-encoded hash in the `x-paystack-signature` header.
 *
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha512', env.paystack.secretKey)
    .update(rawBody)
    .digest('hex');

  // Both must be the same length for timingSafeEqual
  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
