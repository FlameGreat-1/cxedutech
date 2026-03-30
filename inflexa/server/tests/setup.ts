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
];

export default async function globalSetup(): Promise<void> {
  const dbName = process.env.DB_NAME || 'inflexa_test';

  // Connect to default 'postgres' database to create the test database
  const adminPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  try {
    // Drop and recreate test database for a clean slate
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`[TEST SETUP] Created database: ${dbName}`);
  } finally {
    await adminPool.end();
  }

  // Connect to the test database and run migrations
  const testPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    for (const file of MIGRATION_FILES) {
      const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf-8');
      await client.query(sql);
      console.log(`[TEST SETUP] Migration: ${file}`);
    }
    await client.query('COMMIT');
    console.log('[TEST SETUP] All migrations completed');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await testPool.end();
  }
}
