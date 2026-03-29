import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool({
  user: env.db.user,
  host: env.db.host,
  database: env.db.name,
  password: env.db.password,
  port: env.db.port,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
  } finally {
    client.release();
  }
}

export default pool;
