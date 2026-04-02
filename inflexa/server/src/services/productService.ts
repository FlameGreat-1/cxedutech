import * as productModel from '../models/productModel';
import * as productImageModel from '../models/productImageModel';
import { IProduct, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '../types/product.types';
import type { DistinctFilters } from '../models/productModel';

export async function getAll(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedProducts> {
  const result = await productModel.findAll(filters, page, limit);

  // Batch-load images for all products
  const productIds = result.products.map((p) => p.id);
  const allImages = await productImageModel.findByProductIds(productIds);

  // Group images by product_id
  const imagesByProduct = new Map<number, typeof allImages>();
  for (const img of allImages) {
    const existing = imagesByProduct.get(img.product_id) || [];
    existing.push(img);
    imagesByProduct.set(img.product_id, existing);
  }

  const products = result.products.map((p) => ({
    ...p,
    images: imagesByProduct.get(p.id) || [],
  }));

  return { products, total: result.total };
}

export async function getById(id: number): Promise<IProduct> {
  const product = await productModel.findById(id);
  if (!product) {
    throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
  }

  const images = await productImageModel.findByProductId(id);
  return { ...product, images };
}

export async function create(data: CreateProductDTO): Promise<IProduct> {
  const product = await productModel.create(data);
  return { ...product, images: [] };
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

  const images = await productImageModel.findByProductId(id);
  return { ...updated, images };
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
