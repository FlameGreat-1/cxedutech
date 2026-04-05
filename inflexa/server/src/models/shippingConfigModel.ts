import pool from '../config/database';
import { IShippingConfig, ShippingProvider, CreateShippingConfigDTO, UpdateShippingConfigDTO } from '../types/shippingConfig.types';

export async function findAll(): Promise<IShippingConfig[]> {
  const { rows } = await pool.query<IShippingConfig>(
    'SELECT * FROM shipping_configs ORDER BY id ASC'
  );
  return rows;
}

export async function findByProvider(
  provider: ShippingProvider
): Promise<IShippingConfig | null> {
  const { rows } = await pool.query<IShippingConfig>(
    'SELECT * FROM shipping_configs WHERE provider = $1',
    [provider]
  );
  return rows[0] || null;
}

export async function create(
  data: CreateShippingConfigDTO
): Promise<IShippingConfig> {
  const { rows } = await pool.query<IShippingConfig>(
    `INSERT INTO shipping_configs (provider, api_key, is_enabled, fallback_rate)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.provider, data.api_key || '', data.is_enabled ?? false, data.fallback_rate ?? 5.00]
  );
  return rows[0];
}

export async function update(
  provider: ShippingProvider,
  data: UpdateShippingConfigDTO
): Promise<IShippingConfig | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.api_key !== undefined) {
    fields.push(`api_key = $${idx++}`);
    values.push(data.api_key);
  }
  if (data.is_enabled !== undefined) {
    fields.push(`is_enabled = $${idx++}`);
    values.push(data.is_enabled);
  }
  if (data.fallback_rate !== undefined) {
    fields.push(`fallback_rate = $${idx++}`);
    values.push(data.fallback_rate);
  }

  if (fields.length === 0) return findByProvider(provider);

  values.push(provider);

  const { rows } = await pool.query<IShippingConfig>(
    `UPDATE shipping_configs SET ${fields.join(', ')} WHERE provider = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function remove(provider: ShippingProvider): Promise<boolean> {
  const { rowCount } = await pool.query(
    'DELETE FROM shipping_configs WHERE provider = $1',
    [provider]
  );
  return (rowCount ?? 0) > 0;
}
