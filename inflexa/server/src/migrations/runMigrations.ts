import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import { logger } from '../utils/logger';

const MIGRATION_FILES = [
  '000_create_functions.sql',
  '001_create_users.sql',
  '002_create_products.sql',
  '003_create_orders.sql',
  '004_create_payments.sql',
  '005_add_idempotency_key.sql',
  '006_add_payments_updated_at.sql',
];

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const file of MIGRATION_FILES) {
      const filePath = path.resolve(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`Running migration: ${file}`);
      await client.query(sql);
      logger.info(`  [OK] ${file} completed`);
    }

    await client.query('COMMIT');
    logger.info('All migrations completed successfully');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Migration failed: ${message}`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
