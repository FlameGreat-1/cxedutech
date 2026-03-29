import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/orderService';
import * as orderHistoryService from '../services/orderHistoryService';
import { sendSuccess } from '../utils/apiResponse';

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { items, shipping, currency } = req.body;
    const order = await orderService.createOrder(userId, { items, shipping, currency });
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
    const orders = await orderHistoryService.getUserOrders(userId);
    sendSuccess(res, orders);
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
    const orderId = parseInt(req.params.id, 10);
    const order = await orderHistoryService.getOrderDetail(orderId, userId);
    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}
