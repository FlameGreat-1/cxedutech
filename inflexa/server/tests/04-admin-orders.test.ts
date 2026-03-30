import {
  request,
  cleanAllTables,
  createAdminUser,
  registerUser,
  createProduct,
  createOrder,
  closeDb,
} from './helpers';

let adminToken: string;
let userToken: string;
let orderId: number;

beforeAll(async () => {
  await cleanAllTables();
  const admin = await createAdminUser();
  adminToken = admin.token;
  const user = await registerUser('customer', 'customer@test.com', 'CustPass1');
  userToken = user.token;

  const product = await createProduct(adminToken, {
    title: 'Admin Test Cards',
    price: 20.00,
    inventory_count: 50,
  });

  const order = await createOrder(userToken, product.id as number, 2);
  orderId = order.id as number;
});

afterAll(async () => {
  await closeDb();
});

describe('Admin Order Management - List, Detail, Status, Export', () => {

  // ---- LIST ALL ORDERS ----

  it('should list all orders as admin', async () => {
    const res = await request
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();

    // Should have user join data
    const order = res.body.data.find(
      (o: Record<string, unknown>) => o.id === orderId
    );
    expect(order).toBeDefined();
    expect(order.username).toBe('customer');
  });

  // ---- ORDER DETAIL ----

  it('should get order detail with items as admin', async () => {
    const res = await request
      .get(`/api/admin/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(orderId);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].product_title).toBe('Admin Test Cards');
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  // ---- UPDATE STATUS ----

  it('should update order status to Paid', async () => {
    const res = await request
      .put(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order_status: 'Paid' })
      .expect(200);

    expect(res.body.data.order_status).toBe('Paid');
  });

  it('should update order status to Shipped', async () => {
    const res = await request
      .put(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order_status: 'Shipped' })
      .expect(200);

    expect(res.body.data.order_status).toBe('Shipped');
  });

  it('should update order status to Delivered', async () => {
    const res = await request
      .put(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order_status: 'Delivered' })
      .expect(200);

    expect(res.body.data.order_status).toBe('Delivered');
  });

  it('should reject invalid status value', async () => {
    const res = await request
      .put(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order_status: 'InvalidStatus' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  // ---- EXPORT ----

  it('should export orders as CSV', async () => {
    const res = await request
      .get('/api/admin/orders/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('inflexa-orders.csv');

    // Verify CSV has headers and data
    const lines = res.text.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(2); // header + at least 1 row
    expect(lines[0]).toContain('order_id');
    expect(lines[0]).toContain('total_amount');
    expect(lines[0]).toContain('order_status');
  });

  // ---- UNAUTHORIZED ----

  it('should reject admin endpoints with user token', async () => {
    await request
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should reject admin endpoints without token', async () => {
    await request.get('/api/admin/orders').expect(401);
  });
});
