import { PoolClient } from 'pg';
import * as productModel from '../models/productModel';
import { OrderItemInput } from '../types/order.types';
import { IProduct } from '../types/product.types';
import { logger } from '../utils/logger';

export interface StockCheckResult {
  product: IProduct;
  requested: number;
}

export async function checkAndReserveStock(
  client: PoolClient,
  items: OrderItemInput[]
): Promise<StockCheckResult[]> {
  const results: StockCheckResult[] = [];

  for (const item of items) {
    const { rows } = await client.query<IProduct>(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE',
      [item.product_id]
    );

    const product = rows[0];
    if (!product) {
      throw Object.assign(
        new Error('The requested product is no longer available.'),
        { statusCode: 404 }
      );
    }

    if (product.inventory_count < item.quantity) {
      // Log exact counts server-side for debugging/inventory management
      logger.warn(
        `Insufficient stock for product #${product.id} ("${product.title}"): ` +
        `available=${product.inventory_count}, requested=${item.quantity}`
      );

      const userMessage = product.inventory_count === 0
        ? `"${product.title}" is currently out of stock.`
        : `Sorry, there isn't enough stock for "${product.title}". Please reduce the quantity and try again.`;

      throw Object.assign(
        new Error(userMessage),
        { statusCode: 400 }
      );
    }

    await client.query(
      'UPDATE products SET inventory_count = inventory_count - $1 WHERE id = $2',
      [item.quantity, item.product_id]
    );

    results.push({ product, requested: item.quantity });
  }

  return results;
}

export async function updateStock(
  productId: number,
  count: number
): Promise<IProduct> {
  const updated = await productModel.updateInventory(productId, count);
  if (!updated) {
    throw Object.assign(new Error('Product not found.'), { statusCode: 404 });
  }
  return updated;
}
