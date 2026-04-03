import apiClient from '../client';
import type { ApiResponse } from '@/types/api.types';

export interface AdminSearchResults {
  orders: Array<{
    id: number;
    order_status: string;
    total_amount: number | string;
    currency: string;
    shipping_name: string;
    shipping_email: string;
    created_at: string;
  }>;
  products: Array<{
    id: number;
    title: string;
    price: number | string;
    currency: string;
    subject: string;
    format: string;
    inventory_count: number;
    image_url: string | null;
  }>;
  payments: Array<{
    id: number;
    order_id: number;
    provider: string;
    amount: number | string;
    currency: string;
    status: string;
    created_at: string;
    shipping_name: string;
  }>;
}

export async function search(q: string): Promise<AdminSearchResults> {
  const res = await apiClient.get<ApiResponse<AdminSearchResults>>('/admin/search', {
    params: { q },
  });
  return res.data.data;
}
