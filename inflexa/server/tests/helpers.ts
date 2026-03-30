import supertest from 'supertest';
import app from './app';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

export const request = supertest(app);

function getTestPool(): Pool {
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });
}

let pool: Pool | null = null;

export function db(): Pool {
  if (!pool) {
    pool = getTestPool();
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function cleanAllTables(): Promise<void> {
  const p = db();
  await p.query('DELETE FROM payments');
  await p.query('DELETE FROM order_items');
  await p.query('DELETE FROM orders');
  await p.query('DELETE FROM products');
  await p.query('DELETE FROM users');
}

export async function registerUser(
  username: string = 'testuser',
  email: string = 'test@test.com',
  password: string = 'TestPass123'
): Promise<{ token: string; user: Record<string, unknown> }> {
  const res = await request
    .post('/api/auth/register')
    .send({ username, email, password })
    .expect(201);
  return { token: res.body.data.token, user: res.body.data.user };
}

export async function loginUser(
  email: string = 'test@test.com',
  password: string = 'TestPass123'
): Promise<{ token: string; user: Record<string, unknown> }> {
  const res = await request
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return { token: res.body.data.token, user: res.body.data.user };
}

export async function createAdminUser(
  username: string = 'admin',
  email: string = 'admin@inflexa.com',
  password: string = 'AdminPass123'
): Promise<{ token: string; user: Record<string, unknown> }> {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db().query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [username, email, hashedPassword]
  );
  const res = await request
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return { token: res.body.data.token, user: res.body.data.user };
}

export async function createProduct(
  adminToken: string,
  overrides: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const product = {
    title: 'Maths Flashcards Ages 3-5',
    description: 'Fun maths flashcards for early learners',
    min_age: 3,
    max_age: 5,
    subject: 'Maths',
    focus_area: 'Numbers',
    price: 12.99,
    currency: 'GBP',
    format: 'physical',
    included_items: ['30 flashcards', 'Activity guide'],
    inventory_count: 50,
    ...overrides,
  };
  const res = await request
    .post('/api/admin/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(product)
    .expect(201);
  return res.body.data;
}

export async function createOrder(
  token: string,
  productId: number,
  quantity: number = 1
): Promise<Record<string, unknown>> {
  const res = await request
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      items: [{ product_id: productId, quantity }],
      shipping: {
        shipping_name: 'Jane Doe',
        shipping_email: 'jane@test.com',
        shipping_address_line1: '10 Downing Street',
        shipping_city: 'London',
        shipping_state: 'England',
        shipping_postal_code: 'SW1A 2AA',
        shipping_country: 'GB',
      },
      currency: 'GBP',
    })
    .expect(201);
  return res.body.data;
}
