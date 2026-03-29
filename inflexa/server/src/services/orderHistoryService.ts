import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import { IOrder, IOrderItem } from '../types/order.types';

function attachItemsToOrders(orders: IOrder[], allItems: IOrderItem[]): IOrder[] {
  const itemsByOrderId = new Map<number, IOrderItem[]>();

  for (const item of allItems) {
    const existing = itemsByOrderId.get(item.order_id) || [];
    existing.push(item);
    itemsByOrderId.set(item.order_id, existing);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) || [],
  }));
}

export async function getUserOrders(userId: number): Promise<IOrder[]> {
  const orders = await orderModel.findByUserId(userId);
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const allItems = await orderItemModel.findByOrderIds(orderIds);

  return attachItemsToOrders(orders, allItems);
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
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const allItems = await orderItemModel.findByOrderIds(orderIds);

  return attachItemsToOrders(orders, allItems);
}
