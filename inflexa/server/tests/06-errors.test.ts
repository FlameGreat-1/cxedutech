import { request, cleanAllTables, createAdminUser, closeDb } from './helpers';

let adminToken: string;

beforeAll(async () => {
  await cleanAllTables();
  const admin = await createAdminUser();
  adminToken = admin.token;
});

afterAll(async () => {
  await closeDb();
});

describe('Error Handling, Security Headers, Edge Cases', () => {

  // ---- 404 ----

  it('should return 404 for undefined routes', async () => {
    const res = await request.get('/api/nonexistent').expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not found');
  });

  it('should return 404 for wrong HTTP method', async () => {
    const res = await request.patch('/api/auth/login').expect(404);

    expect(res.body.success).toBe(false);
  });

  // ---- SECURITY HEADERS ----

  it('should include Helmet security headers', async () => {
    const res = await request.get('/api/products').expect(200);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  // ---- RATE LIMITING HEADERS ----
  // Rate limiting is disabled in test environment (NODE_ENV=test)
  // so headers won't be present. This test verifies the behavior
  // is correctly skipped rather than erroring.

  it('should skip rate limiting in test environment', async () => {
    const res = await request.get('/api/products').expect(200);

    // In test mode, rate limit headers should NOT be present
    expect(res.headers['ratelimit-limit']).toBeUndefined();
    expect(res.headers['ratelimit-remaining']).toBeUndefined();
  });

  // ---- XSS SANITIZATION ----

  it('should sanitize XSS in product title', async () => {
    const res = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '<script>alert("xss")</script>Safe Title',
        description: 'Clean description',
        min_age: 3,
        max_age: 5,
        subject: 'Test',
        focus_area: 'Test',
        price: 10,
        format: 'physical',
        included_items: ['item'],
        inventory_count: 1,
      })
      .expect(201);

    // Script tag should be stripped
    expect(res.body.data.title).not.toContain('<script>');
    expect(res.body.data.title).toContain('Safe Title');
  });

  it('should sanitize XSS in shipping name during order', async () => {
    // First create a product to order
    const productRes = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'XSS Order Test',
        description: 'Test',
        min_age: 1,
        max_age: 3,
        subject: 'Test',
        focus_area: 'Test',
        price: 5,
        format: 'physical',
        included_items: ['card'],
        inventory_count: 10,
      })
      .expect(201);

    const res = await request
      .post('/api/orders/guest')
      .send({
        items: [{ product_id: productRes.body.data.id, quantity: 1 }],
        shipping: {
          shipping_name: '<img onerror=alert(1) src=x>John',
          shipping_email: 'xss@test.com',
          shipping_address_line1: '1 Test St',
          shipping_city: 'London',
          shipping_state: 'England',
          shipping_postal_code: 'E1 1AA',
        },
      })
      .expect(201);

    expect(res.body.data.shipping_name).not.toContain('<img');
    expect(res.body.data.shipping_name).not.toContain('onerror');
  });

  // ---- CONTENT TYPE ----

  it('should return JSON content type on all API responses', async () => {
    const res = await request.get('/api/products').expect(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

  // ---- PAGINATION DEFAULTS ----

  it('should use default pagination when not specified', async () => {
    const res = await request.get('/api/products').expect(200);

    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('should respect custom pagination params', async () => {
    const res = await request.get('/api/products?page=1&limit=1').expect(200);

    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(1);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
  });
});
