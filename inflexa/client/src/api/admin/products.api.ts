import apiClient from '../client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { IProduct, CreateProductDTO, UpdateProductDTO } from '@/types/product.types';

const BASE = '/admin/products';

export async function getAll(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<IProduct>> {
  const res = await apiClient.get<PaginatedResponse<IProduct>>(BASE, {
    params: { page, limit },
  });
  return res.data;
}

export async function getById(id: number): Promise<IProduct> {
  const res = await apiClient.get<ApiResponse<IProduct>>(`${BASE}/${id}`);
  return res.data.data;
}

export async function create(data: CreateProductDTO): Promise<IProduct> {
  const res = await apiClient.post<ApiResponse<IProduct>>(BASE, data);
  return res.data.data;
}

export async function update(id: number, data: UpdateProductDTO): Promise<IProduct> {
  const res = await apiClient.put<ApiResponse<IProduct>>(`${BASE}/${id}`, data);
  return res.data.data;
}

export async function remove(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function updateInventory(id: number, inventoryCount: number): Promise<IProduct> {
  const res = await apiClient.patch<ApiResponse<IProduct>>(
    `${BASE}/${id}/inventory`,
    { inventory_count: inventoryCount }
  );
  return res.data.data;
}

export async function uploadImage(id: number, file: File): Promise<IProduct> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiClient.post<ApiResponse<IProduct>>(
    `${BASE}/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data.data;
}
