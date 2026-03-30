import { request, cleanAllTables, closeDb } from './helpers';

beforeAll(async () => {
  await cleanAllTables();
});

afterAll(async () => {
  await closeDb();
});

describe('Auth Flow - Registration, Login, Profile, Password Change', () => {
  let userToken: string;
  let userId: number;

  it('should register a new user', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'johndoe', email: 'john@example.com', password: 'SecurePass1' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('johndoe');
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.password).toBeUndefined();
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('should reject duplicate email', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'different', email: 'john@example.com', password: 'SecurePass1' })
      .expect(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Email');
  });

  it('should reject duplicate username', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'johndoe', email: 'different@example.com', password: 'SecurePass1' })
      .expect(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Username');
  });

  it('should reject weak password', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'weakuser', email: 'weak@example.com', password: 'short' })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject missing fields', async () => {
    await request.post('/api/auth/register').send({ username: 'nofields' }).expect(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'SecurePass1' })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.id).toBe(userId);
  });

  it('should reject wrong password', async () => {
    await request.post('/api/auth/login').send({ email: 'john@example.com', password: 'WrongPass1' }).expect(401);
  });

  it('should reject non-existent email', async () => {
    await request.post('/api/auth/login').send({ email: 'nobody@example.com', password: 'SecurePass1' }).expect(401);
  });

  it('should get current user profile', async () => {
    const res = await request.get('/api/users/me').set('Authorization', `Bearer ${userToken}`).expect(200);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.username).toBe('johndoe');
    expect(res.body.data.password).toBeUndefined();
  });

  it('should reject profile request without token', async () => {
    await request.get('/api/users/me').expect(401);
  });

  it('should reject profile request with invalid token', async () => {
    await request.get('/api/users/me').set('Authorization', 'Bearer invalid-token-here').expect(401);
  });

  it('should change password', async () => {
    const res = await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ current_password: 'SecurePass1', new_password: 'NewSecure2' })
      .expect(200);
    expect(res.body.data.message).toContain('Password updated');
  });

  it('should reject change with wrong current password', async () => {
    await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ current_password: 'WrongOldPass1', new_password: 'AnotherNew3' })
      .expect(401);
  });

  it('should reject same password as current', async () => {
    await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ current_password: 'NewSecure2', new_password: 'NewSecure2' })
      .expect(400);
  });

  it('should login with new password', async () => {
    const res = await request.post('/api/auth/login').send({ email: 'john@example.com', password: 'NewSecure2' }).expect(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with old password', async () => {
    await request.post('/api/auth/login').send({ email: 'john@example.com', password: 'SecurePass1' }).expect(401);
  });
});
