import {
  request,
  cleanAllTables,
  createAdminUser,
  registerUser,
  createProduct,
  createOrder,
  createOrderWithCurrency,
  createGuestOrder,
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
  const guestOrder = await createGuestOrder(product.id as number, 1);
  guestOrderId = guestOrder.id as number;
});

afterAll(async () => {
  await closeDb();
});

describe('Stripe Payment Flow - Intent Creation, Validation, Records', () => {

  let paymentId: number;

  // ---- CREATE PAYMENT INTENT ----

  it('should create a Stripe payment intent for a pending order', async () => {
    const res = await request
      .post('/api/payments/stripe/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: orderId })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.payment).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(orderId);
    expect(res.body.data.payment.provider).toBe('stripe');
    expect(res.body.data.payment.status).toBe('pending');
    expect(res.body.data.payment.currency).toBe('GBP');
    expect(parseFloat(res.body.data.payment.amount)).toBeCloseTo(25.00, 2);
    expect(res.body.data.payment.stripe_payment_intent_id).toBeDefined();
    expect(res.body.data.payment.stripe_payment_intent_id).toMatch(/^pi_/);
    expect(res.body.data.payment.paystack_reference).toBeNull();

    paymentId = res.body.data.payment.id;
  });

  // ---- IDEMPOTENT INTENT ----

  it('should return same intent on duplicate request for same order', async () => {
    const res = await request
      .post('/api/payments/stripe/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: orderId })
      .expect(201);

    // Same payment ID returned (existing pending intent reused)
    expect(res.body.data.payment.id).toBe(paymentId);
  });

  // ---- REJECT NON-EXISTENT ORDER ----

  it('should reject payment intent for non-existent order', async () => {
    await request
      .post('/api/payments/stripe/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ order_id: 99999 })
      .expect(404);
  });

  // ---- REJECT WRONG USER ----

  it('should reject payment intent when user does not own the order', async () => {
    const other = await registerUser('otherpayer', 'otherpay@test.com', 'OtherPay1');

    await request
      .post('/api/payments/stripe/create-intent')
      .set('Authorization', `Bearer ${other.token}`)
      .send({ order_id: orderId })
      .expect(403);
  });

  // ---- GUEST PAYMENT ----

  it('should create a guest Stripe payment intent', async () => {
    const res = await request
      .post('/api/payments/stripe/guest/create-intent')
      .send({ order_id: guestOrderId })
      .expect(201);

    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(guestOrderId);
    expect(res.body.data.payment.provider).toBe('stripe');
  });

  // ---- GET PAYMENT DETAILS ----

  it('should get payment details by ID', async () => {
    const res = await request
      .get(`/api/payments/${paymentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(paymentId);
    expect(res.body.data.order_id).toBe(orderId);
    expect(res.body.data.provider).toBe('stripe');
    expect(res.body.data.payment_method).toBe('card');
  });

  it('should reject payment details without auth', async () => {
    await request.get(`/api/payments/${paymentId}`).expect(401);
  });

  // ---- VALIDATION ----

  it('should reject payment intent without order_id', async () => {
    await request
      .post('/api/payments/stripe/create-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(400);
  });

  // ---- DATABASE VERIFICATION ----

  it('should have Stripe payment record in database with correct provider fields', async () => {
    const { rows } = await db().query(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].order_id).toBe(orderId);
    expect(rows[0].provider).toBe('stripe');
    expect(rows[0].status).toBe('pending');
    expect(rows[0].stripe_payment_intent_id).toMatch(/^pi_/);
    expect(rows[0].paystack_reference).toBeNull();
    expect(rows[0].payment_method).toBe('card');
  });
});

describe('Paystack Payment Flow - Initialization, Validation, Records', () => {

  let paystackUserToken: string;
  let paystackOrderId: number;
  let paystackGuestOrderId: number;
  let paystackPaymentId: number;
  let paystackReference: string;

  beforeAll(async () => {
    const user = await registerUser('paystackpayer', 'paystackpayer@test.com', 'PayStack1');
    paystackUserToken = user.token;

    // Paystack requires a supported currency (NGN, GHS, USD, ZAR, KES)
    const product = await createProduct(adminToken, {
      title: 'Paystack Test Cards',
      price: 5000.00,
      currency: 'NGN',
      inventory_count: 100,
    });

    const order = await createOrderWithCurrency(
      paystackUserToken,
      product.id as number,
      1,
      'NGN'
    );
    paystackOrderId = order.id as number;

    const guestOrder = await createGuestOrder(product.id as number, 1, 'NGN');
    paystackGuestOrderId = guestOrder.id as number;
  });

  // ---- INITIALIZE TRANSACTION ----

  it('should initialize a Paystack transaction for a pending order', async () => {
    const res = await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${paystackUserToken}`)
      .send({ order_id: paystackOrderId })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.authorization_url).toBeDefined();
    expect(res.body.data.authorization_url).toMatch(/^https:\/\//);
    expect(res.body.data.reference).toBeDefined();
    expect(res.body.data.reference).toMatch(/^inflexa_/);
    expect(res.body.data.payment).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(paystackOrderId);
    expect(res.body.data.payment.provider).toBe('paystack');
    expect(res.body.data.payment.status).toBe('pending');
    expect(res.body.data.payment.paystack_reference).toBe(res.body.data.reference);
    expect(res.body.data.payment.stripe_payment_intent_id).toBeNull();

    paystackPaymentId = res.body.data.payment.id;
    paystackReference = res.body.data.reference;
  });

  // ---- IDEMPOTENT INITIALIZATION ----

  it('should return same reference on duplicate initialization for same order', async () => {
    const res = await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${paystackUserToken}`)
      .send({ order_id: paystackOrderId })
      .expect(201);

    expect(res.body.data.reference).toBe(paystackReference);
  });

  // ---- REJECT UNSUPPORTED CURRENCY ----

  it('should reject Paystack initialization for unsupported currency (GBP)', async () => {
    // Create an order with GBP (not supported by Paystack)
    const gbpProduct = await createProduct(adminToken, {
      title: 'GBP Only Cards',
      price: 10.00,
      currency: 'GBP',
      inventory_count: 50,
    });
    const gbpOrder = await createOrder(paystackUserToken, gbpProduct.id as number, 1);

    const res = await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${paystackUserToken}`)
      .send({ order_id: gbpOrder.id })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('does not support');
  });

  // ---- REJECT NON-EXISTENT ORDER ----

  it('should reject Paystack initialization for non-existent order', async () => {
    await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${paystackUserToken}`)
      .send({ order_id: 99999 })
      .expect(404);
  });

  // ---- REJECT WRONG USER ----

  it('should reject Paystack initialization when user does not own the order', async () => {
    const other = await registerUser('otherpaystacker', 'otherps@test.com', 'OtherPs1');

    await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${other.token}`)
      .send({ order_id: paystackOrderId })
      .expect(403);
  });

  // ---- GUEST PAYSTACK ----

  it('should initialize a guest Paystack transaction', async () => {
    const res = await request
      .post('/api/payments/paystack/guest/initialize')
      .send({ order_id: paystackGuestOrderId })
      .expect(201);

    expect(res.body.data.authorization_url).toBeDefined();
    expect(res.body.data.payment.order_id).toBe(paystackGuestOrderId);
    expect(res.body.data.payment.provider).toBe('paystack');
  });

  // ---- VERIFY UNKNOWN REFERENCE ----

  it('should return 404 for unknown Paystack reference', async () => {
    await request
      .get('/api/payments/paystack/verify/nonexistent_ref_12345')
      .expect(404);
  });

  // ---- VALIDATION ----

  it('should reject Paystack initialization without order_id', async () => {
    await request
      .post('/api/payments/paystack/initialize')
      .set('Authorization', `Bearer ${paystackUserToken}`)
      .send({})
      .expect(400);
  });

  // ---- DATABASE VERIFICATION ----

  it('should have Paystack payment record in database with correct provider fields', async () => {
    const { rows } = await db().query(
      'SELECT * FROM payments WHERE id = $1',
      [paystackPaymentId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].order_id).toBe(paystackOrderId);
    expect(rows[0].provider).toBe('paystack');
    expect(rows[0].status).toBe('pending');
    expect(rows[0].paystack_reference).toMatch(/^inflexa_/);
    expect(rows[0].stripe_payment_intent_id).toBeNull();
    expect(rows[0].payment_method).toBe('card');
  });
});
