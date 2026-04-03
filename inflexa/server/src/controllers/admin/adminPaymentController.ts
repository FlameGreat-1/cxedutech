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

export async function getPaymentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paymentId = parseInt(req.params.id as string, 10);

    const { rows } = await pool.query(
      `SELECT p.*,
              o.shipping_name,
              o.shipping_email,
              o.order_status
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: 'Payment not found.' });
      return;
    }

    sendSuccess(res, rows[0]);
  } catch (error: unknown) {
    next(error);
  }
}
