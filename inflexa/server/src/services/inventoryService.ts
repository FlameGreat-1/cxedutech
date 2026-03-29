import { PoolClient } from 'pg';
import * as productModel from '../models/productModel';
import { OrderItemInput } from '../types/order.types';
import { IProduct } from '../types/product.types';

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
        new Error(`Product with ID ${item.product_id} not found.`),
        { statusCode: 404 }
      );
    }

    if (product.inventory_count < item.quantity) {
      throw Object.assign(
        new Error(
          `Insufficient stock for "${product.title}". Available: ${product.inventory_count}, Requested: ${item.quantity}`
        ),
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
