import apiClient from '../client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { IPayment } from '@/types/payment.types';

const BASE = '/admin/payments';

export interface AdminPayment extends IPayment {
  shipping_name?: string;
  shipping_email?: string;
  order_status?: string;
}

export async function getAll(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<AdminPayment>> {
  const res = await apiClient.get<PaginatedResponse<AdminPayment>>(BASE, {
    params: { page, limit },
  });
  return res.data;
}

export async function getById(id: number): Promise<AdminPayment> {
  const res = await apiClient.get<ApiResponse<AdminPayment>>(`${BASE}/${id}`);
  return res.data.data;
}

export async function getByOrderId(orderId: number): Promise<AdminPayment | null> {
  try {
    const res = await apiClient.get<ApiResponse<AdminPayment>>(`${BASE}/by-order/${orderId}`);
    return res.data.data;
  } catch {
    return null;
  }
}
