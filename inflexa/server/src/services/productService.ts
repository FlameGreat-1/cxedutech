import * as productModel from '../models/productModel';
import { IProduct, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '../types/product.types';
import type { DistinctFilters } from '../models/productModel';

export async function getAll(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedProducts> {
  return productModel.findAll(filters, page, limit);
}

export async function getById(id: number): Promise<IProduct> {
  const product = await productModel.findById(id);
  if (!product) {
    throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
  }
  return product;
}

export async function create(data: CreateProductDTO): Promise<IProduct> {
  return productModel.create(data);
}

export async function update(id: number, data: UpdateProductDTO): Promise<IProduct> {
  const existing = await productModel.findById(id);
  if (!existing) {
    throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
  }

  const updated = await productModel.update(id, data);
  if (!updated) {
    throw Object.assign(new Error('Failed to update product.'), { statusCode: 500 });
  }
  return updated;
}

export async function remove(id: number): Promise<void> {
  const deleted = await productModel.remove(id);
  if (!deleted) {
    throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
  }
}

export async function getFilters(): Promise<DistinctFilters> {
  return productModel.getDistinctFilters();
}
