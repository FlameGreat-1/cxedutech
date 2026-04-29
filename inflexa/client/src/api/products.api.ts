import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { IProduct, ProductFilters, DistinctFilters } from '@/types/product.types';

export async function getAll(
  filters: ProductFilters = {},
  page: number = 1,
  limit: number = 12
): Promise<PaginatedResponse<IProduct>> {
  const params: Record<string, string | number> = { page, limit };

  if (filters.search) params.search = filters.search;
  if (filters.age !== undefined) params.age = filters.age;
  if (filters.min_age !== undefined) params.min_age = filters.min_age;
  if (filters.max_age !== undefined) params.max_age = filters.max_age;
  if (filters.subject) params.subject = filters.subject;
  if (filters.focus_area) params.focus_area = filters.focus_area;
  if (filters.format) params.format = filters.format;
  if (filters.level) params.level = filters.level;
  if (filters.pack_type) params.pack_type = filters.pack_type;
  if (filters.sort) params.sort = filters.sort;

  const res = await apiClient.get<PaginatedResponse<IProduct>>('/products', { params });
  return res.data;
}

export async function getById(id: number): Promise<IProduct> {
  const res = await apiClient.get<ApiResponse<IProduct>>(`/products/${id}`);
  return res.data.data;
}

export async function getFilters(): Promise<DistinctFilters> {
  const res = await apiClient.get<ApiResponse<DistinctFilters>>('/products/filters');
  return res.data.data;
}
