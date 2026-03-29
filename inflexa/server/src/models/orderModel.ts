import { PoolClient } from 'pg';
import pool from '../config/database';
import { IOrder, OrderStatus } from '../types/order.types';

export async function create(
  client: PoolClient,
  data: {
    user_id: number;
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
  }
): Promise<IOrder> {
  const { rows } = await client.query<IOrder>(
    `INSERT INTO orders
       (user_id, total_amount, currency, shipping_name, shipping_email,
        shipping_phone, shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.user_id, data.total_amount, data.currency,
      data.shipping_name, data.shipping_email, data.shipping_phone,
      data.shipping_address_line1, data.shipping_address_line2,
      data.shipping_city, data.shipping_state,
      data.shipping_postal_code, data.shipping_country,
    ]
  );
  return rows[0];
}

export async function findById(id: number): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `SELECT o.*, u.username, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
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
    `SELECT o.*, u.username, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
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
    `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
}

export async function updateShipping(
  id: number,
  shipmentId: string,
  trackingCode: string
): Promise<IOrder | null> {
  const { rows } = await pool.query<IOrder>(
    `UPDATE orders
     SET easypost_shipment_id = $1, tracking_code = $2
     WHERE id = $3 RETURNING *`,
    [shipmentId, trackingCode, id]
  );
  return rows[0] || null;
}

export async function findAllForExport(): Promise<Record<string, unknown>[]> {
  const { rows } = await pool.query(
    `SELECT
       o.id AS order_id,
       u.username,
       u.email AS user_email,
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
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return rows;
}
