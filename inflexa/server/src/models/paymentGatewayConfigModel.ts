import pool from '../config/database';
import { IPaymentGatewayConfig, PaymentGatewayProvider, UpdatePaymentGatewayConfigDTO } from '../types/paymentGatewayConfig.types';

export async function findAll(): Promise<IPaymentGatewayConfig[]> {
  const { rows } = await pool.query<IPaymentGatewayConfig>(
    'SELECT * FROM payment_gateway_configs ORDER BY id ASC'
  );
  return rows;
}

export async function findByProvider(
  provider: PaymentGatewayProvider
): Promise<IPaymentGatewayConfig | null> {
  const { rows } = await pool.query<IPaymentGatewayConfig>(
    'SELECT * FROM payment_gateway_configs WHERE provider = $1',
    [provider]
  );
  return rows[0] || null;
}

export async function update(
  provider: PaymentGatewayProvider,
  data: UpdatePaymentGatewayConfigDTO
): Promise<IPaymentGatewayConfig | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(data.currency);
  }
  if (data.public_key !== undefined) {
    fields.push(`public_key = $${idx++}`);
    values.push(data.public_key);
  }
  if (data.secret_key !== undefined) {
    fields.push(`secret_key = $${idx++}`);
    values.push(data.secret_key);
  }
  if (data.webhook_secret !== undefined) {
    fields.push(`webhook_secret = $${idx++}`);
    values.push(data.webhook_secret);
  }
  if (data.is_enabled !== undefined) {
    fields.push(`is_enabled = $${idx++}`);
    values.push(data.is_enabled);
  }

  if (fields.length === 0) return findByProvider(provider);

  values.push(provider);

  const { rows } = await pool.query<IPaymentGatewayConfig>(
    `UPDATE payment_gateway_configs SET ${fields.join(', ')} WHERE provider = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
}
