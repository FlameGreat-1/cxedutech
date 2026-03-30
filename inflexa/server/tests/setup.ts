import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const MIGRATION_DIR = path.resolve(__dirname, '../src/migrations');
const MIGRATION_FILES = [
  '000_create_functions.sql',
  '001_create_users.sql',
  '002_create_products.sql',
  '003_create_orders.sql',
  '004_create_payments.sql',
  '005_add_idempotency_key.sql',
  '006_add_payments_updated_at.sql',
  '007_create_migration_tracking.sql',
  '008_create_password_reset_tokens.sql',
  '009_add_paystack_support.sql',
];

/**
 * Validate database name to prevent SQL injection.
 * Only allows alphanumeric characters and underscores.
 */
function sanitizeDbName(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid database name: "${name}". Only alphanumeric characters and underscores are allowed.`);
  }
  return name;
}

export default async function globalSetup(): Promise<void> {
  const dbName = sanitizeDbName(process.env.DB_NAME || 'inflexa_test');

  const adminPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  try {
    // Terminate existing connections to allow clean drop
    await adminPool.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName]
    );
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`[TEST SETUP] Created database: ${dbName}`);
  } finally {
    await adminPool.end();
  }

  const testPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  const client = await testPool.connect();
  try {
    for (const file of MIGRATION_FILES) {
      const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`[TEST SETUP] Migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[TEST SETUP] Failed on migration: ${file}`);
        throw err;
      }
    }
    console.log('[TEST SETUP] All migrations completed');
  } finally {
    client.release();
    await testPool.end();
  }
}
