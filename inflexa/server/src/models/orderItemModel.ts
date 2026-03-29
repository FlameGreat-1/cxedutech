import { PoolClient } from 'pg';
import pool from '../config/database';
import { IOrderItem } from '../types/order.types';

export async function createMany(
  client: PoolClient,
  orderId: number,
  items: { product_id: number; quantity: number; unit_price: number; currency: string }[]
): Promise<IOrderItem[]> {
  const allItems: IOrderItem[] = [];

  for (const item of items) {
    const { rows } = await client.query<IOrderItem>(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, item.product_id, item.quantity, item.unit_price, item.currency]
    );
    allItems.push(rows[0]);
  }

  return allItems;
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
