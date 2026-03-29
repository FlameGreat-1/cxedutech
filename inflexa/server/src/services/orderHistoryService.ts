import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { IOrder } from '../types/order.types';

export async function getUserOrders(userId: number): Promise<IOrder[]> {
  const orders = await orderModel.findByUserId(userId);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await orderItemModel.findByOrderId(order.id);
      return { ...order, items };
    })
  );

  return ordersWithItems;
}

export async function getOrderDetail(
  orderId: number,
  userId?: number
): Promise<IOrder> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  if (userId !== undefined && order.user_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  const items = await orderItemModel.findByOrderId(orderId);
  return { ...order, items };
}

export async function getAllOrders(): Promise<IOrder[]> {
  const orders = await orderModel.findAll();

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await orderItemModel.findByOrderId(order.id);
      return { ...order, items };
    })
  );

  return ordersWithItems;
}
