import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { IOrder, CreateOrderDTO, ShippingAddress, OrderItemInput } from '@/types/order.types';

// ── Shipping Rates (pre-checkout) ─────────────────────────────────

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: string;
  currency: string;
  delivery_days: number | null;
}

export interface ShippingRatesResult {
  rates: ShippingRate[];
  shipment_id: string | null;
  shipping_enabled: boolean;
  provider: string | null;
}

export async function getShippingRates(
  shipping: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const res = await apiClient.post<ApiResponse<ShippingRatesResult>>(
    '/orders/shipping-rates',
    { shipping, items }
  );
  return res.data.data;
}

// ── Order CRUD ────────────────────────────────────────────────

export async function create(
  data: CreateOrderDTO,
  idempotencyKey?: string
): Promise<IOrder> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const res = await apiClient.post<ApiResponse<IOrder>>('/orders', data, { headers });
  return res.data.data;
}

export async function createGuest(
  data: CreateOrderDTO,
  idempotencyKey?: string
): Promise<IOrder> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const res = await apiClient.post<ApiResponse<IOrder>>('/orders/guest', data, { headers });
  return res.data.data;
}

export async function getMyOrders(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IOrder>> {
  const res = await apiClient.get<PaginatedResponse<IOrder>>('/orders', {
    params: { page, limit },
  });
  return res.data;
}

export async function getMyOrder(id: number): Promise<IOrder> {
  const res = await apiClient.get<ApiResponse<IOrder>>(`/orders/${id}`);
  return res.data.data;
}

export async function getGuestOrder(id: number, email: string): Promise<IOrder> {
  const res = await apiClient.get<ApiResponse<IOrder>>(`/orders/guest/${id}`, {
    params: { email },
  });
  return res.data.data;
}
