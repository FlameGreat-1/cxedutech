import apiClient from '../client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { IOrder, OrderStatus } from '@/types/order.types';

const BASE = '/admin/orders';

export async function getAll(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<IOrder>> {
  const res = await apiClient.get<PaginatedResponse<IOrder>>(BASE, {
    params: { page, limit },
  });
  return res.data;
}

export async function getById(id: number): Promise<IOrder> {
  const res = await apiClient.get<ApiResponse<IOrder>>(`${BASE}/${id}`);
  return res.data.data;
}

export async function updateStatus(id: number, orderStatus: OrderStatus): Promise<IOrder> {
  const res = await apiClient.put<ApiResponse<IOrder>>(
    `${BASE}/${id}/status`,
    { order_status: orderStatus }
  );
  return res.data.data;
}

export async function ship(id: number): Promise<IOrder> {
  const res = await apiClient.post<ApiResponse<IOrder>>(`${BASE}/${id}/ship`);
  return res.data.data;
}

export async function exportCsv(): Promise<Blob> {
  const res = await apiClient.get(`${BASE}/export`, {
    responseType: 'blob',
  });
  return res.data as Blob;
}

export async function getUnshipped(): Promise<IOrder[]> {
  const res = await apiClient.get<ApiResponse<IOrder[]>>(`${BASE}/unshipped`);
  return res.data.data;
}

export async function getShipped(): Promise<IOrder[]> {
  const res = await apiClient.get<ApiResponse<IOrder[]>>(`${BASE}/shipped`);
  return res.data.data;
}
