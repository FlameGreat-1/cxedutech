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

export async function addImage(
  productId: number,
  imageUrl: string,
  isPrimary: boolean = false
): Promise<IProductImage> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get next sort_order
    const { rows: maxRows } = await client.query<{ max_order: number | null }>(
      'SELECT MAX(sort_order) AS max_order FROM product_images WHERE product_id = $1',
      [productId]
    );
    const nextOrder = (maxRows[0].max_order ?? -1) + 1;

    // If this is the first image or explicitly primary, ensure only one primary
    if (isPrimary) {
      await client.query(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
        [productId]
      );
    }

    // If no images exist yet, make this one primary regardless
    const count = await countByProductIdWithClient(client, productId);
    const shouldBePrimary = isPrimary || count === 0;

    const { rows } = await client.query<IProductImage>(
      `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [productId, imageUrl, nextOrder, shouldBePrimary]
    );

    // Update the products.image_url to match the primary image
    if (shouldBePrimary) {
      await client.query(
        'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
        [imageUrl, productId]
      );
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function countByProductIdWithClient(client: PoolClient, productId: number): Promise<number> {
  const { rows } = await client.query<{ count: string }>(
    'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
    [productId]
  );
  return parseInt(rows[0].count, 10);
}

export async function removeImage(imageId: number): Promise<IProductImage | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the image before deleting
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
        // No images left
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

    // Unset all primary flags for this product
    await client.query(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
      [image.product_id]
    );

    // Set this one as primary
    await client.query(
      'UPDATE product_images SET is_primary = TRUE WHERE id = $1',
      [imageId]
    );

    // Sync products.image_url
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
