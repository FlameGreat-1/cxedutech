import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { IPayment } from '../../types/payment.types';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';

export async function getAllPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM payments');
    const total = parseInt(countResult.rows[0].count, 10);

    const { rows } = await pool.query<IPayment>(
      `SELECT p.*,
              o.shipping_name,
              o.shipping_email,
              o.order_status
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    sendPaginated(res, rows, total, page, limit);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getPaymentByOrderId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = parseInt(req.params.orderId as string, 10);

    const { rows } = await pool.query<IPayment>(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: 'No payment found for this order.' });
      return;
    }

    sendSuccess(res, rows[0]);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getPaymentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = parseInt(req.params.id as string, 10);

    // Get payment with full order details
    const { rows } = await pool.query(
      `SELECT p.*,
              o.order_status,
              o.total_amount   AS order_total_amount,
              o.currency       AS order_currency,
              o.shipping_name,
              o.shipping_email,
              o.shipping_phone,
              o.shipping_address_line1,
              o.shipping_address_line2,
              o.shipping_city,
              o.shipping_state,
              o.shipping_postal_code,
              o.shipping_country,
              o.tracking_code,
              o.easypost_shipment_id,
              o.created_at     AS order_created_at,
              o.user_id,
              COALESCE(u.username, 'guest') AS username,
              COALESCE(u.email, o.shipping_email) AS user_email
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN users u ON u.id = o.user_id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: 'Payment not found.' });
      return;
    }

    const payment = rows[0];

    // Get order items
    const { rows: items } = await pool.query(
      `SELECT oi.*,
              pr.title AS product_title,
              (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = oi.product_id
                ORDER BY pi.is_primary DESC, pi.id ASC
                LIMIT 1
              ) AS product_image_url
       FROM order_items oi
       LEFT JOIN products pr ON pr.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [payment.order_id]
    );

    sendSuccess(res, { ...payment, order_items: items });
  } catch (error: unknown) {
    next(error);
  }
}
