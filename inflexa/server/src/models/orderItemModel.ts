import { PoolClient } from 'pg';
import pool from '../config/database';
import { IOrderItem } from '../types/order.types';

export async function createMany(
  client: PoolClient,
  orderId: number,
  items: { product_id: number; quantity: number; unit_price: number; currency: string }[]
): Promise<IOrderItem[]> {
  if (items.length === 0) return [];

  const valueClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const item of items) {
    valueClauses.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(orderId, item.product_id, item.quantity, item.unit_price, item.currency);
  }

  const sql = `INSERT INTO order_items (order_id, product_id, quantity, unit_price, currency)
     VALUES ${valueClauses.join(', ')}
     RETURNING *`;

  const { rows } = await client.query<IOrderItem>(sql, values);
  return rows;
}

export async function findByOrderId(orderId: number): Promise<IOrderItem[]> {
  const { rows } = await pool.query<IOrderItem>(
    `SELECT oi.*, p.title AS product_title, p.image_url AS product_image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId]
  );
  return rows;
}

export async function findByOrderIds(orderIds: number[]): Promise<IOrderItem[]> {
  if (orderIds.length === 0) return [];

  const { rows } = await pool.query<IOrderItem>(
    `SELECT oi.*, p.title AS product_title, p.image_url AS product_image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ANY($1)
     ORDER BY oi.order_id, oi.id`,
    [orderIds]
  );
  return rows;
}
