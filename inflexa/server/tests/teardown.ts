import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default async function globalTeardown(): Promise<void> {
  const dbName = process.env.DB_NAME || 'inflexa_test';

  const adminPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  try {
    // Terminate all connections to the test database
    await adminPool.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName]
    );
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`[TEST TEARDOWN] Dropped database: ${dbName}`);
  } finally {
    await adminPool.end();
  }
}
