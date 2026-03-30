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
  '007_create_migration_tracking.sql',
];

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Ensure the tracking table exists before checking it
    const trackingSql = fs.readFileSync(
      path.resolve(__dirname, '007_create_migration_tracking.sql'),
      'utf-8'
    );
    await client.query(trackingSql);

    // Get already-applied migrations
    const { rows: applied } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    await client.query('BEGIN');

    let appliedCount = 0;

    for (const file of MIGRATION_FILES) {
      if (appliedSet.has(file)) {
        logger.info(`  [SKIP] ${file} (already applied)`);
        continue;
      }

      const filePath = path.resolve(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`Running migration: ${file}`);
      await client.query(sql);

      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      );

      logger.info(`  [OK] ${file} completed`);
      appliedCount++;
    }

    await client.query('COMMIT');

    if (appliedCount === 0) {
      logger.info('All migrations already applied, nothing to do.');
    } else {
      logger.info(`${appliedCount} migration(s) applied successfully.`);
    }
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
