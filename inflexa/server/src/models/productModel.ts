import pool from '../config/database';
import { IProduct, CreateProductDTO, UpdateProductDTO, ProductFilters } from '../types/product.types';

export async function findAll(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ products: IProduct[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.age_range) {
    conditions.push(`age_range = $${paramIndex++}`);
    values.push(filters.age_range);
  }
  if (filters.subject) {
    conditions.push(`subject = $${paramIndex++}`);
    values.push(filters.subject);
  }
  if (filters.focus_area) {
    conditions.push(`focus_area = $${paramIndex++}`);
    values.push(filters.focus_area);
  }
  if (filters.format) {
    conditions.push(`format = $${paramIndex++}`);
    values.push(filters.format);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) FROM products ${where}`;
  const countResult = await pool.query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataSql = `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  const dataValues = [...values, limit, offset];

  const { rows } = await pool.query<IProduct>(dataSql, dataValues);
  return { products: rows, total };
}

export async function findById(id: number): Promise<IProduct | null> {
  const { rows } = await pool.query<IProduct>(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function create(data: CreateProductDTO): Promise<IProduct> {
  const { rows } = await pool.query<IProduct>(
    `INSERT INTO products
       (title, description, age_range, subject, focus_area, price, currency,
        format, included_items, inventory_count, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.age_range,
      data.subject,
      data.focus_area,
      data.price,
      data.currency || 'GBP',
      data.format,
      data.included_items,
      data.inventory_count ?? 0,
      data.image_url || null,
    ]
  );
  return rows[0];
}

export async function update(
  id: number,
  data: UpdateProductDTO
): Promise<IProduct | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields: (keyof UpdateProductDTO)[] = [
    'title', 'description', 'age_range', 'subject', 'focus_area',
    'price', 'currency', 'format', 'included_items', 'inventory_count', 'image_url',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return findById(id);

  values.push(id);

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const { rows } = await pool.query<IProduct>(sql, values);
  return rows[0] || null;
}

export async function remove(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    'DELETE FROM products WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

export async function updateInventory(
  id: number,
  count: number
): Promise<IProduct | null> {
  const { rows } = await pool.query<IProduct>(
    `UPDATE products SET inventory_count = $1 WHERE id = $2 RETURNING *`,
    [count, id]
  );
  return rows[0] || null;
}
