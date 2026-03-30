import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/orderService';
import * as orderHistoryService from '../services/orderHistoryService';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

function getIdempotencyKey(req: Request): string | null {
  const key = req.header('Idempotency-Key');
  return key && key.trim().length > 0 ? key.trim() : null;
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { items, shipping, currency } = req.body;
    const idempotencyKey = getIdempotencyKey(req);
    const order = await orderService.createOrder(userId, { items, shipping, currency }, idempotencyKey);
    sendSuccess(res, order, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function createGuestOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { items, shipping, currency } = req.body;
    const idempotencyKey = getIdempotencyKey(req);
    const order = await orderService.createOrder(null, { items, shipping, currency }, idempotencyKey);
    sendSuccess(res, order, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMyOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const { orders, total } = await orderHistoryService.getUserOrders(userId, page, limit);
    sendPaginated(res, orders, total, page, limit);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMyOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.id as string, 10);
    const order = await orderHistoryService.getOrderDetail(orderId, userId);
    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getGuestOrderByIdAndEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = parseInt(req.params.id as string, 10);
    const email = req.query.email as string;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email query parameter is required.' });
      return;
    }

    const order = await orderHistoryService.getOrderDetail(orderId);

    if (order.user_id !== null) {
      res.status(403).json({ success: false, error: 'This is not a guest order.' });
      return;
    }

    if (order.shipping_email.toLowerCase() !== email.toLowerCase()) {
      res.status(403).json({ success: false, error: 'Email does not match this order.' });
      return;
    }

    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}
