import pool from '../config/database';
import { IPayment, PaymentStatus, CreatePaymentRecord } from '../types/payment.types';

export async function create(data: CreatePaymentRecord): Promise<IPayment> {
  const { rows } = await pool.query<IPayment>(
    `INSERT INTO payments
       (order_id, provider, stripe_payment_intent_id, paystack_reference,
        amount, currency, payment_method, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.order_id,
      data.provider,
      data.stripe_payment_intent_id,
      data.paystack_reference,
      data.amount,
      data.currency,
      data.payment_method,
      data.status,
    ]
  );
  return rows[0];
}

export async function findByOrderId(orderId: number): Promise<IPayment | null> {
  const { rows } = await pool.query<IPayment>(
    'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
    [orderId]
  );
  return rows[0] || null;
}

export async function findByStripeId(
  stripePaymentIntentId: string
): Promise<IPayment | null> {
  const { rows } = await pool.query<IPayment>(
    'SELECT * FROM payments WHERE stripe_payment_intent_id = $1',
    [stripePaymentIntentId]
  );
  return rows[0] || null;
}

export async function findByPaystackReference(
  reference: string
): Promise<IPayment | null> {
  const { rows } = await pool.query<IPayment>(
    'SELECT * FROM payments WHERE paystack_reference = $1',
    [reference]
  );
  return rows[0] || null;
}

export async function updateStatus(
  id: number,
  status: PaymentStatus
): Promise<IPayment | null> {
  const { rows } = await pool.query<IPayment>(
    'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
}

export async function findById(id: number): Promise<IPayment | null> {
  const { rows } = await pool.query<IPayment>(
    'SELECT * FROM payments WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}
