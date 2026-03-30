import {
  request,
  cleanAllTables,
  createAdminUser,
  registerUser,
  createProduct,
  createOrder,
  closeDb,
  db,
} from './helpers';

let adminToken: string;
let userToken: string;
let orderId: number;
let guestOrderId: number;

beforeAll(async () => {
  await cleanAllTables();
  const admin = await createAdminUser();
  adminToken = admin.token;
  const user = await registerUser('payer', 'payer@test.com', 'PayerPass1');
  userToken = user.token;

  const product = await createProduct(adminToken, {
    title: 'Payment Test Cards',
    price: 25.00,
    inventory_count: 100,
  });

  const order = await createOrder(userToken, product.id as number, 1);
  orderId = order.id as number;

  // Create a guest order for guest payment test
  const guestRes = await request
    .post('/api/orders/guest')
    .send({
      items: [{ product_id: product.id, quantity: 1 }],
      shipping: {
        shipping_name: 'Guest Payer',
        shipping_email: 'guestpay@test.com',
        shipping_address_line1: '1 Guest Lane',
        shipping_city: 'London',
        shipping_state: 'England',
        shipping_postal_code: 'E1 1AA',
      },
    })
    .expect(201);
  guestOrderId = guestRes.body.data.id;
});

afterAll(async () => {
  await closeDb();
});

describe('Payment Flow - Intent Creation, Validation, Records', () => {

  let paymentId: number;

  // ---- CREATE PAYMENT INTENT ----

  it('should create a payment intent for a pending order', async () => {
    const res = await request
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: orderId })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.payment).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(orderId);
    expect(res.body.data.payment.status).toBe('pending');
    expect(res.body.data.payment.currency).toBe('GBP');
    expect(parseFloat(res.body.data.payment.amount)).toBeCloseTo(25.00, 2);
    expect(res.body.data.payment.stripe_payment_intent_id).toBeDefined();
    expect(res.body.data.payment.stripe_payment_intent_id).toMatch(/^pi_/);

    paymentId = res.body.data.payment.id;
  });

  // ---- IDEMPOTENT INTENT ----

  it('should return same intent on duplicate request for same order', async () => {
    const res = await request
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: orderId })
      .expect(201);

    // Same payment ID returned (existing pending intent reused)
    expect(res.body.data.payment.id).toBe(paymentId);
  });

  // ---- REJECT NON-EXISTENT ORDER ----

  it('should reject payment intent for non-existent order', async () => {
    await request
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: 99999 })
      .expect(404);
  });

  // ---- REJECT WRONG USER ----

  it('should reject payment intent when user does not own the order', async () => {
    const other = await registerUser('otherpayer', 'otherpay@test.com', 'OtherPay1');

    await request
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${other.token}`)
      .send({ order_id: orderId })
      .expect(403);
  });

  // ---- GUEST PAYMENT ----

  it('should create a guest payment intent', async () => {
    const res = await request
      .post('/api/payments/guest/create-intent')
      .send({ order_id: guestOrderId })
      .expect(201);

    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(guestOrderId);
  });

  // ---- GET PAYMENT DETAILS ----

  it('should get payment details by ID', async () => {
    const res = await request
      .get(`/api/payments/${paymentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(paymentId);
    expect(res.body.data.order_id).toBe(orderId);
    expect(res.body.data.payment_method).toBe('card');
  });

  it('should reject payment details without auth', async () => {
    await request.get(`/api/payments/${paymentId}`).expect(401);
  });

  // ---- VALIDATION ----

  it('should reject payment intent without order_id', async () => {
    await request
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(400);
  });

  // ---- DATABASE VERIFICATION ----

  it('should have payment record in database', async () => {
    const { rows } = await db().query(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].order_id).toBe(orderId);
    expect(rows[0].status).toBe('pending');
    expect(rows[0].stripe_payment_intent_id).toMatch(/^pi_/);
    expect(rows[0].payment_method).toBe('card');
  });
});
