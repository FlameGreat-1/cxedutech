import { request, cleanAllTables, createAdminUser, registerUser, closeDb } from './helpers';

let adminToken: string;
let userToken: string;
let productId: number;

beforeAll(async () => {
  await cleanAllTables();
  const admin = await createAdminUser();
  adminToken = admin.token;
  const user = await registerUser('shopper', 'shopper@test.com', 'ShopPass1');
  userToken = user.token;
});

afterAll(async () => {
  await closeDb();
});

describe('Product Flow - Admin CRUD, Public Browse, Filters', () => {

  // ---- ADMIN CREATE ----

  it('should create a product as admin', async () => {
    const res = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Phonics Flashcards Ages 3-5',
        description: 'Learn letter sounds with fun illustrations',
        min_age: 3,
        max_age: 5,
        subject: 'English',
        focus_area: 'Phonics',
        price: 14.99,
        currency: 'GBP',
        format: 'physical',
        included_items: ['40 flashcards', 'Parent guide'],
        inventory_count: 100,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Phonics Flashcards Ages 3-5');
    expect(res.body.data.price).toBe('14.99');
    expect(res.body.data.currency).toBe('GBP');
    expect(res.body.data.currency_symbol).toBe('\u00a3');
    expect(res.body.data.inventory_count).toBe(100);
    expect(res.body.data.included_items).toEqual(['40 flashcards', 'Parent guide']);
    expect(res.body.data.age_range).toBe('3-5');

    productId = res.body.data.id;
  });

  it('should create a second product for filtering', async () => {
    const res = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Maths Flashcards Ages 5-7',
        description: 'Addition and subtraction practice',
        min_age: 5,
        max_age: 7,
        subject: 'Maths',
        focus_area: 'Arithmetic',
        price: 11.99,
        format: 'printable',
        included_items: ['50 printable cards'],
        inventory_count: 200,
      })
      .expect(201);

    expect(res.body.data.format).toBe('printable');
  });

  // ---- REJECT UNAUTHORIZED ----

  it('should reject product creation without token', async () => {
    await request
      .post('/api/admin/products')
      .send({ title: 'Hack' })
      .expect(401);
  });

  it('should reject product creation with user token (not admin)', async () => {
    await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Hack',
        description: 'x',
        min_age: 1,
        max_age: 2,
        subject: 'x',
        focus_area: 'x',
        price: 1,
        format: 'physical',
        included_items: ['x'],
      })
      .expect(403);
  });

  // ---- VALIDATION ----

  it('should reject product with missing required fields', async () => {
    const res = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete' })
      .expect(400);

    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  // ---- PUBLIC BROWSE ----

  it('should list all products publicly with pagination', async () => {
    const res = await request.get('/api/products').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.page).toBe(1);
  });

  it('should filter products by subject', async () => {
    const res = await request.get('/api/products?subject=Maths').expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].subject).toBe('Maths');
  });

  it('should filter products by age (child is 5)', async () => {
    const res = await request.get('/api/products?age=5').expect(200);

    // Both products cover age 5: (3-5) and (5-7)
    expect(res.body.data.length).toBe(2);
  });

  it('should filter products by age (child is 3)', async () => {
    const res = await request.get('/api/products?age=3').expect(200);

    // Only Phonics (3-5) covers age 3
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].subject).toBe('English');
  });

  it('should filter products by format', async () => {
    const res = await request.get('/api/products?format=printable').expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].format).toBe('printable');
  });

  // ---- SINGLE PRODUCT ----

  it('should get a single product by ID', async () => {
    const res = await request.get(`/api/products/${productId}`).expect(200);

    expect(res.body.data.id).toBe(productId);
    expect(res.body.data.title).toBe('Phonics Flashcards Ages 3-5');
    expect(res.body.data.currency_symbol).toBe('\u00a3');
  });

  it('should return 404 for non-existent product', async () => {
    await request.get('/api/products/99999').expect(404);
  });

  // ---- ADMIN UPDATE ----

  it('should update a product as admin', async () => {
    const res = await request
      .put(`/api/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 16.99, title: 'Phonics Flashcards Ages 3-5 (Updated)' })
      .expect(200);

    expect(res.body.data.price).toBe('16.99');
    expect(res.body.data.title).toBe('Phonics Flashcards Ages 3-5 (Updated)');
  });

  // ---- ADMIN INVENTORY ----

  it('should update inventory independently', async () => {
    const res = await request
      .patch(`/api/admin/products/${productId}/inventory`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ inventory_count: 75 })
      .expect(200);

    expect(res.body.data.inventory_count).toBe(75);
  });

  // ---- ADMIN DELETE ----

  it('should delete a product as admin', async () => {
    // Create a throwaway product to delete
    const createRes = await request
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'To Delete',
        description: 'Will be deleted',
        min_age: 1,
        max_age: 3,
        subject: 'Test',
        focus_area: 'Test',
        price: 5.00,
        format: 'physical',
        included_items: ['test'],
        inventory_count: 1,
      })
      .expect(201);

    const deleteId = createRes.body.data.id;

    await request
      .delete(`/api/admin/products/${deleteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify it's gone
    await request.get(`/api/products/${deleteId}`).expect(404);
  });
});
