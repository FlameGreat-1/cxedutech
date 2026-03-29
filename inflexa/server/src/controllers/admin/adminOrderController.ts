import { Request, Response, NextFunction } from 'express';
import * as orderHistoryService from '../../services/orderHistoryService';
import * as orderService from '../../services/orderService';
import * as orderExportService from '../../services/orderExportService';
import { OrderStatus } from '../../types/order.types';
import { sendSuccess } from '../../utils/apiResponse';

export async function getAllOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await orderHistoryService.getAllOrders();
    sendSuccess(res, orders);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = parseInt(req.params.id, 10);
    const order = await orderHistoryService.getOrderDetail(orderId);
    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { order_status } = req.body as { order_status: OrderStatus };
    const order = await orderService.updateOrderStatus(orderId, order_status);
    sendSuccess(res, order);
  } catch (error: unknown) {
    next(error);
  }
}

export async function exportOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const csv = await orderExportService.exportOrdersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inflexa-orders.csv');
    res.status(200).send(csv);
  } catch (error: unknown) {
    next(error);
  }
}
