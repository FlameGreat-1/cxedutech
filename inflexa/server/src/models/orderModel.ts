import { PoolClient } from 'pg';
import pool from '../config/database';
import { IOrder, OrderStatus } from '../types/order.types';

export async function create(
  client: PoolClient,
  data: {
    user_id: number | null;
    subtotal: number;
    shipping_cost: number;
    shipping_carrier: string | null;
    shipping_service: string | null;
    tax_amount: number;
    tax_rate: number;
    total_amount: number;
    currency: string;
    shipping_name: string;
    shipping_email: string;
    shipping_phone: string | null;
    shipping_address_line1: string;
    shipping_address_line2: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    idempotency_key: string | null;
  }
): Promise<IOrder> {
  const { rows } = await client.query<IOrder>(
    `INSERT INTO orders
       (user_id, subtotal, shipping_cost, shipping_carrier, shipping_service,
        tax_amount, tax_rate, total_amount, currency,
        shipping_name, shipping_email, shipping_phone,
        shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country,
        idempotency_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING *`,
    [
      data.user_id,
      data.subtotal, data.shipping_cost, data.shipping_carrier, data.shipping_service,
      data.tax_amount, data.tax_rate, data.total_amount, data.currency,
      data.shipping_name, data.shipping_email, data.shipping_phone,
      data.shipping_address_line1, data.shipping_address_line2,
      data.shipping_city, data.shipping_state,
      data.shipping_postal_code, data.shipping_country,
      data.idempotency_key,
    ]
  );
  return rows[0];
}

export async function findByIdempotencyKey(key: string): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    'SELECT * FROM orders WHERE idempotency_key = $1',
    [key]
  );
  return rows[0] || null;
}

export async function findById(id: number): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `SELECT o.*,
       COALESCE(u.username, 'guest') AS username,
       COALESCE(u.email, o.shipping_email) AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function findByUserId(
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ orders: IOrder[]; total: number }> {
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM orders WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const { rows } = await pool.query<IOrder>(
    `SELECT * FROM orders WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return { orders: rows, total };
}

export async function findAll(
  page: number = 1,
  limit: number = 20
): Promise<{ orders: IOrder[]; total: number }> {
  const countResult = await pool.query('SELECT COUNT(*) FROM orders');
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const { rows } = await pool.query<IOrder>(
    `SELECT o.*,
       COALESCE(u.username, 'guest') AS username,
       COALESCE(u.email, o.shipping_email) AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { orders: rows, total };
}

export async function updateStatus(
  id: number,
  status: OrderStatus
): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
}

export async function updateTrackingCode(
  id: number,
  trackingCode: string
): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `UPDATE orders SET tracking_code = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [trackingCode, id]
  );
  return rows[0] || null;
}

export async function updateShipping(
  id: number,
  shipmentId: string,
  trackingCode: string,
  provider: string
): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `UPDATE orders
     SET shipment_id = $1, tracking_code = $2, shipping_provider = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [shipmentId, trackingCode, provider, id]
  );
  return rows[0] || null;
}

export async function findAllForExport(
  limit: number,
  offset: number
): Promise<Record<string, unknown>[]> {
  const { rows } = await pool.query(
    `SELECT
       o.id AS order_id,
       COALESCE(u.username, 'guest') AS username,
       COALESCE(u.email, o.shipping_email) AS user_email,
       o.subtotal,
       o.shipping_cost,
       o.shipping_carrier,
       o.shipping_service,
       o.shipping_provider,
       o.tax_amount,
       o.tax_rate,
       o.total_amount,
       o.currency,
       o.order_status,
       o.shipping_name,
       o.shipping_email,
       o.shipping_address_line1,
       o.shipping_address_line2,
       o.shipping_city,
       o.shipping_state,
       o.shipping_postal_code,
       o.shipping_country,
       o.tracking_code,
       o.created_at
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function countAll(): Promise<number> {
  const { rows } = await pool.query('SELECT COUNT(*) FROM orders');
  return parseInt(rows[0].count, 10);
}

export async function findPaidUnshipped(): Promise<IOrder[]> {
  const { rows } = await pool.query<IOrder>(
    `SELECT o.*,
       COALESCE(u.username, 'guest') AS username,
       COALESCE(u.email, o.shipping_email) AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.order_status = 'Paid'
       AND o.shipment_id IS NULL
     ORDER BY o.created_at ASC`
  );
  return rows;
}

export async function findShipped(): Promise<IOrder[]> {
  const { rows } = await pool.query<IOrder>(
    `SELECT o.*,
       COALESCE(u.username, 'guest') AS username,
       COALESCE(u.email, o.shipping_email) AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.order_status IN ('Shipped', 'Delivered')
     ORDER BY o.created_at DESC`
  );
  return rows;
}
