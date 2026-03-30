import {
  request,
  cleanAllTables,
  createAdminUser,
  registerUser,
  createProduct,
  closeDb,
  db,
} from './helpers';

let adminToken: string;
let userToken: string;
let product1: Record<string, unknown>;
let product2: Record<string, unknown>;
let orderId: number;

beforeAll(async () => {
  await cleanAllTables();
  const admin = await createAdminUser();
  adminToken = admin.token;
  const user = await registerUser('buyer', 'buyer@test.com', 'BuyerPass1');
  userToken = user.token;

  product1 = await createProduct(adminToken, {
    title: 'Science Cards 4-6',
    subject: 'Science',
    focus_area: 'Biology',
    price: 9.99,
    inventory_count: 10,
  });
  product2 = await createProduct(adminToken, {
    title: 'History Cards 6-8',
    min_age: 6,
    max_age: 8,
    subject: 'History',
    focus_area: 'World History',
    price: 15.50,
    inventory_count: 5,
  });
});

afterAll(async () => {
  await closeDb();
});

describe('Order Flow - Create, Inventory, Guest, Idempotency, History', () => {

  // ---- CREATE ORDER ----

  it('should create an order with multiple items', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          { product_id: product1.id, quantity: 2 },
          { product_id: product2.id, quantity: 1 },
        ],
        shipping: {
          shipping_name: 'Alice Smith',
          shipping_email: 'alice@test.com',
          shipping_address_line1: '42 Baker Street',
          shipping_city: 'London',
          shipping_state: 'England',
          shipping_postal_code: 'NW1 6XE',
          shipping_country: 'GB',
        },
        currency: 'GBP',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.order_status).toBe('Pending');
    expect(res.body.data.currency).toBe('GBP');
    expect(res.body.data.shipping_name).toBe('Alice Smith');
    expect(res.body.data.shipping_city).toBe('London');
    expect(res.body.data.items).toHaveLength(2);

    // Verify total: (9.99 * 2) + (15.50 * 1) = 35.48
    expect(parseFloat(res.body.data.total_amount)).toBeCloseTo(35.48, 2);

    // Verify unit prices are snapshots
    const scienceItem = res.body.data.items.find(
      (i: Record<string, unknown>) => i.product_id === product1.id
    );
    expect(parseFloat(scienceItem.unit_price)).toBeCloseTo(9.99, 2);
    expect(scienceItem.quantity).toBe(2);

    orderId = res.body.data.id;
  });

  // ---- INVENTORY DECREMENT ----

  it('should have decremented inventory in the database', async () => {
    const { rows } = await db().query(
      'SELECT inventory_count FROM products WHERE id = $1',
      [product1.id]
    );
    // Was 10, ordered 2 => should be 8
    expect(rows[0].inventory_count).toBe(8);

    const { rows: rows2 } = await db().query(
      'SELECT inventory_count FROM products WHERE id = $1',
      [product2.id]
    );
    // Was 5, ordered 1 => should be 4
    expect(rows2[0].inventory_count).toBe(4);
  });

  // ---- OUT OF STOCK ----

  it('should reject order when inventory is insufficient', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: product2.id, quantity: 999 }],
        shipping: {
          shipping_name: 'Greedy Buyer',
          shipping_email: 'greedy@test.com',
          shipping_address_line1: '1 Greed Lane',
          shipping_city: 'London',
          shipping_state: 'England',
          shipping_postal_code: 'E1 1AA',
        },
      })
      .expect(400);

    expect(res.body.error).toContain('Insufficient stock');
  });

  // ---- GUEST CHECKOUT ----

  it('should create a guest order without authentication', async () => {
    const res = await request
      .post('/api/orders/guest')
      .send({
        items: [{ product_id: product1.id, quantity: 1 }],
        shipping: {
          shipping_name: 'Guest User',
          shipping_email: 'guest@test.com',
          shipping_address_line1: '5 Guest Road',
          shipping_city: 'Manchester',
          shipping_state: 'England',
          shipping_postal_code: 'M1 1AA',
        },
        currency: 'GBP',
      })
      .expect(201);

    expect(res.body.data.user_id).toBeNull();
    expect(res.body.data.shipping_name).toBe('Guest User');

    // Guest lookup
    const lookupRes = await request
      .get(`/api/orders/guest/${res.body.data.id}?email=guest@test.com`)
      .expect(200);

    expect(lookupRes.body.data.id).toBe(res.body.data.id);
  });

  it('should reject guest lookup with wrong email', async () => {
    await request
      .get(`/api/orders/guest/${orderId}?email=wrong@test.com`)
      .expect(403);
  });

  // ---- IDEMPOTENCY ----

  it('should return same order for duplicate idempotency key', async () => {
    const idempotencyKey = 'unique-key-12345';
    const orderPayload = {
      items: [{ product_id: product1.id, quantity: 1 }],
      shipping: {
        shipping_name: 'Idem User',
        shipping_email: 'idem@test.com',
        shipping_address_line1: '1 Idem St',
        shipping_city: 'London',
        shipping_state: 'England',
        shipping_postal_code: 'E1 1AA',
      },
    };

    const res1 = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(orderPayload)
      .expect(201);

    const res2 = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(orderPayload)
      .expect(201);

    // Same order returned, not a new one
    expect(res2.body.data.id).toBe(res1.body.data.id);
  });

  // ---- ORDER HISTORY ----

  it('should list user order history', async () => {
    const res = await request
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.pagination).toBeDefined();

    // Each order should have items attached
    for (const order of res.body.data) {
      expect(order.items).toBeDefined();
      expect(Array.isArray(order.items)).toBe(true);
    }
  });

  it('should get own order detail', async () => {
    const res = await request
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(orderId);
    expect(res.body.data.items).toHaveLength(2);
  });

  it('should reject access to another user order', async () => {
    // Register a different user
    const other = await registerUser('other', 'other@test.com', 'OtherPass1');

    await request
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .expect(403);
  });

  // ---- VALIDATION ----

  it('should reject order with empty items', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [],
        shipping: {
          shipping_name: 'X',
          shipping_email: 'x@x.com',
          shipping_address_line1: 'X',
          shipping_city: 'X',
          shipping_state: 'X',
          shipping_postal_code: 'X',
        },
      })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('should reject order with missing shipping fields', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: product1.id, quantity: 1 }],
        shipping: { shipping_name: 'Only Name' },
      })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });
});
