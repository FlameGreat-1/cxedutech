import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const MIGRATION_FILES = [
  '000_create_functions.sql',
  '001_create_users.sql',
  '002_create_products.sql',
  '003_create_orders.sql',
  '004_create_payments.sql',
];

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const file of MIGRATION_FILES) {
      const filePath = path.resolve(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`Running migration: ${file}`);
      await client.query(sql);
      console.log(`  ✓ ${file} completed`);
    }

    await client.query('COMMIT');
    console.log('\n✅ All migrations completed successfully');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Migration failed: ${message}`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
