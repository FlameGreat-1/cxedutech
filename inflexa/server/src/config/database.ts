import { Pool, PoolConfig } from 'pg';
import { env } from './env';

const isProduction = env.nodeEnv === 'production';

const poolConfig: PoolConfig = {
  user: env.db.user,
  host: env.db.host,
  database: env.db.name,
  password: env.db.password,
  port: env.db.port,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
};

if (isProduction || process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: process.env.DB_SSL_REJECT !== 'false' };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err.message);
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('[OK] PostgreSQL connected successfully');
  } finally {
    client.release();
  }
}

export default pool;
