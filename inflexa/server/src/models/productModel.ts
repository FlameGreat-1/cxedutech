import pool from '../config/database';
import { IProduct, CreateProductDTO, UpdateProductDTO, ProductFilters } from '../types/product.types';

const BASE_SELECT = `SELECT *,
  (min_age || '-' || max_age) AS age_range
  FROM products`;

export async function findAll(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ products: IProduct[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex}` +
      ` OR subject ILIKE $${paramIndex} OR focus_area ILIKE $${paramIndex}` +
      ` OR format ILIKE $${paramIndex}` +
      ` OR (min_age || '-' || max_age) ILIKE $${paramIndex})`
    );
    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.age !== undefined) {
    conditions.push(`min_age <= $${paramIndex} AND max_age >= $${paramIndex}`);
    values.push(filters.age);
    paramIndex++;
  } else {
    if (filters.min_age !== undefined) {
      conditions.push(`min_age = $${paramIndex++}`);
      values.push(filters.min_age);
    }
    if (filters.max_age !== undefined) {
      conditions.push(`max_age = $${paramIndex++}`);
      values.push(filters.max_age);
    }
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
  if (filters.level) {
    conditions.push(`level = $${paramIndex++}`);
    values.push(filters.level);
  }
  if (filters.pack_type) {
    conditions.push(`pack_type = $${paramIndex++}`);
    values.push(filters.pack_type);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'created_at DESC';
  if (filters.sort === 'popular') {
    // Basic popularity proxy for now: sort by lowest inventory (most sold) or title
    orderBy = 'inventory_count ASC, title ASC';
  } else if (filters.sort === 'newest') {
    orderBy = 'created_at DESC';
  }

  const countSql = `SELECT COUNT(*) FROM products ${where}`;
  const countResult = await pool.query(countSql, values);
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataSql = `${BASE_SELECT} ${where} ORDER BY ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  const dataValues = [...values, limit, offset];

  const { rows } = await pool.query<IProduct>(dataSql, dataValues);
  return { products: rows, total };
}

export async function findById(id: number): Promise<IProduct | null> {
  const { rows } = await pool.query<IProduct>(
    `${BASE_SELECT} WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create(data: CreateProductDTO): Promise<IProduct> {
  const { rows } = await pool.query<IProduct>(
    `INSERT INTO products
       (title, description, min_age, max_age, subject, focus_area, price, currency,
        format, included_items, inventory_count, image_url, level, pack_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *, (min_age || '-' || max_age) AS age_range`,
    [
      data.title,
      data.description,
      data.min_age,
      data.max_age,
      data.subject,
      data.focus_area,
      data.price,
      data.currency || 'GBP',
      data.format,
      data.included_items,
      data.inventory_count ?? 0,
      data.image_url || null,
      data.level || null,
      data.pack_type || 'Standard',
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
    'title', 'description', 'min_age', 'max_age', 'subject', 'focus_area',
    'price', 'currency', 'format', 'included_items', 'inventory_count', 'image_url', 'level', 'pack_type'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex}
    RETURNING *, (min_age || '-' || max_age) AS age_range`;
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
    `UPDATE products SET inventory_count = $1, updated_at = NOW() WHERE id = $2
     RETURNING *, (min_age || '-' || max_age) AS age_range`,
    [count, id]
  );
  return rows[0] || null;
}

export interface DistinctFilters {
  subjects: string[];
  formats: string[];
  age_ranges: { min_age: number; max_age: number }[];
}

export async function getDistinctFilters(): Promise<DistinctFilters> {
  const [subjectsRes, formatsRes, agesRes] = await Promise.all([
    pool.query<{ subject: string }>(
      'SELECT DISTINCT subject FROM products ORDER BY subject ASC'
    ),
    pool.query<{ format: string }>(
      'SELECT DISTINCT format FROM products ORDER BY format ASC'
    ),
    pool.query<{ min_age: number; max_age: number }>(
      'SELECT DISTINCT min_age, max_age FROM products ORDER BY min_age ASC, max_age ASC'
    ),
  ]);

  return {
    subjects: subjectsRes.rows.map((r) => r.subject),
    formats: formatsRes.rows.map((r) => r.format),
    age_ranges: agesRes.rows.map((r) => ({ min_age: r.min_age, max_age: r.max_age })),
  };
}
