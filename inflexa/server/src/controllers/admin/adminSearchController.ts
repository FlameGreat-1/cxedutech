import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { sendSuccess } from '../../utils/apiResponse';

export async function search(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = (req.query.q as string || '').trim();

    if (!q || q.length < 1) {
      sendSuccess(res, { orders: [], products: [], payments: [] });
      return;
    }

    const isNumeric = /^\d+$/.test(q);
    const likeTerm = `%${q}%`;

    // Search orders: by ID (exact) or by shipping_name / shipping_email (ILIKE)
    const ordersPromise = isNumeric
      ? pool.query(
          `SELECT id, order_status, total_amount, currency, shipping_name, shipping_email, created_at
           FROM orders WHERE id = $1 LIMIT 5`,
          [parseInt(q, 10)]
        )
      : pool.query(
          `SELECT id, order_status, total_amount, currency, shipping_name, shipping_email, created_at
           FROM orders
           WHERE shipping_name ILIKE $1 OR shipping_email ILIKE $1
           ORDER BY created_at DESC LIMIT 5`,
          [likeTerm]
        );

    // Search products: by title, subject, or focus_area (ILIKE)
    const productsPromise = pool.query(
      `SELECT id, title, price, currency, subject, format, inventory_count,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = products.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) AS image_url
       FROM products
       WHERE title ILIKE $1 OR subject ILIKE $1 OR focus_area ILIKE $1
       ORDER BY created_at DESC LIMIT 5`,
      [likeTerm]
    );

    // Search payments: by ID (exact) or by paystack_reference / stripe_payment_intent_id (ILIKE)
    const paymentsPromise = isNumeric
      ? pool.query(
          `SELECT p.id, p.order_id, p.provider, p.amount, p.currency, p.status, p.created_at,
                  o.shipping_name
           FROM payments p
           LEFT JOIN orders o ON o.id = p.order_id
           WHERE p.id = $1 LIMIT 5`,
          [parseInt(q, 10)]
        )
      : pool.query(
          `SELECT p.id, p.order_id, p.provider, p.amount, p.currency, p.status, p.created_at,
                  o.shipping_name
           FROM payments p
           LEFT JOIN orders o ON o.id = p.order_id
           WHERE p.paystack_reference ILIKE $1
              OR p.stripe_payment_intent_id ILIKE $1
              OR o.shipping_name ILIKE $1
           ORDER BY p.created_at DESC LIMIT 5`,
          [likeTerm]
        );

    const [ordersResult, productsResult, paymentsResult] = await Promise.all([
      ordersPromise,
      productsPromise,
      paymentsPromise,
    ]);

    sendSuccess(res, {
      orders: ordersResult.rows,
      products: productsResult.rows,
      payments: paymentsResult.rows,
    });
  } catch (error: unknown) {
    next(error);
  }
}
