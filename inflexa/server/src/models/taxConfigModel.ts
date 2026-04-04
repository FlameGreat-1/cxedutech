import pool from '../config/database';
import { ITaxConfig, UpdateTaxConfigDTO } from '../types/taxConfig.types';

export async function findAll(): Promise<ITaxConfig[]> {
  const { rows } = await pool.query<ITaxConfig>(
    'SELECT * FROM tax_configs ORDER BY id ASC'
  );
  return rows;
}

export async function findByRegion(
  region: string
): Promise<ITaxConfig | null> {
  const { rows } = await pool.query<ITaxConfig>(
    'SELECT * FROM tax_configs WHERE region = $1',
    [region]
  );
  return rows[0] || null;
}

export async function update(
  region: string,
  data: UpdateTaxConfigDTO
): Promise<ITaxConfig | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.tax_label !== undefined) {
    fields.push(`tax_label = $${idx++}`);
    values.push(data.tax_label);
  }
  if (data.tax_rate !== undefined) {
    fields.push(`tax_rate = $${idx++}`);
    values.push(data.tax_rate);
  }
  if (data.is_enabled !== undefined) {
    fields.push(`is_enabled = $${idx++}`);
    values.push(data.is_enabled);
  }

  if (fields.length === 0) return findByRegion(region);

  values.push(region);

  const { rows } = await pool.query<ITaxConfig>(
    `UPDATE tax_configs SET ${fields.join(', ')} WHERE region = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
}
