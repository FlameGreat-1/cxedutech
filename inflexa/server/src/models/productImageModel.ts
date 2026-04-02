import pool from '../config/database';
import { PoolClient } from 'pg';

export interface IProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
}

export async function findByProductId(productId: number): Promise<IProductImage[]> {
  const { rows } = await pool.query<IProductImage>(
    'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC, id ASC',
    [productId]
  );
  return rows;
}

export async function findByProductIds(productIds: number[]): Promise<IProductImage[]> {
  if (productIds.length === 0) return [];
  const { rows } = await pool.query<IProductImage>(
    'SELECT * FROM product_images WHERE product_id = ANY($1) ORDER BY sort_order ASC, id ASC',
    [productIds]
  );
  return rows;
}

export async function countByProductId(productId: number): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
    [productId]
  );
  return parseInt(rows[0].count, 10);
}

/**
 * Insert multiple images for a product in a single transaction.
 * The first image becomes primary if the product has no existing images.
 */
export async function addImages(
  productId: number,
  imageUrls: string[],
  existingCount: number
): Promise<IProductImage[]> {
  if (imageUrls.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current max sort_order
    const { rows: maxRows } = await client.query<{ max_order: number | null }>(
      'SELECT MAX(sort_order) AS max_order FROM product_images WHERE product_id = $1',
      [productId]
    );
    let nextOrder = (maxRows[0].max_order ?? -1) + 1;

    const inserted: IProductImage[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const isPrimary = existingCount === 0 && i === 0;

      const { rows } = await client.query<IProductImage>(
        `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [productId, imageUrls[i], nextOrder++, isPrimary]
      );
      inserted.push(rows[0]);

      // Sync products.image_url for the primary
      if (isPrimary) {
        await client.query(
          'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
          [imageUrls[i], productId]
        );
      }
    }

    await client.query('COMMIT');
    return inserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Insert a single image. Used by management operations.
 */
export async function addImage(
  productId: number,
  imageUrl: string,
  isPrimary: boolean = false
): Promise<IProductImage> {
  const currentCount = await countByProductId(productId);
  const results = await addImages(productId, [imageUrl], isPrimary ? 0 : currentCount);
  return results[0];
}

export async function removeImage(imageId: number): Promise<IProductImage | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: deleted } = await client.query<IProductImage>(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [imageId]
    );

    if (deleted.length === 0) {
      await client.query('COMMIT');
      return null;
    }

    const removedImage = deleted[0];

    // If we removed the primary image, promote the next one
    if (removedImage.is_primary) {
      const { rows: remaining } = await client.query<IProductImage>(
        'SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC, id ASC LIMIT 1',
        [removedImage.product_id]
      );

      if (remaining.length > 0) {
        await client.query(
          'UPDATE product_images SET is_primary = TRUE WHERE id = $1',
          [remaining[0].id]
        );
        await client.query(
          'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
          [remaining[0].image_url, removedImage.product_id]
        );
      } else {
        await client.query(
          'UPDATE products SET image_url = NULL, updated_at = NOW() WHERE id = $1',
          [removedImage.product_id]
        );
      }
    }

    await client.query('COMMIT');
    return removedImage;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function setPrimary(imageId: number): Promise<IProductImage | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: images } = await client.query<IProductImage>(
      'SELECT * FROM product_images WHERE id = $1',
      [imageId]
    );
    if (images.length === 0) {
      await client.query('COMMIT');
      return null;
    }

    const image = images[0];

    await client.query(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
      [image.product_id]
    );

    await client.query(
      'UPDATE product_images SET is_primary = TRUE WHERE id = $1',
      [imageId]
    );

    await client.query(
      'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
      [image.image_url, image.product_id]
    );

    await client.query('COMMIT');
    return { ...image, is_primary: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
