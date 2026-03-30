import crypto from 'crypto';
import { request, cleanAllTables, closeDb, db, createAdminUser } from './helpers';

beforeAll(async () => {
  await cleanAllTables();
});

afterAll(async () => {
  await closeDb();
});

describe('Auth Flow - Registration, Login, Profile, Password Change, Password Reset', () => {
  let userToken: string;
  let userId: number;

  // ---- REGISTRATION ----

  it('should register a new user', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass1',
      })
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
      .send({
        username: 'different',
        email: 'john@example.com',
        password: 'SecurePass1',
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Email');
  });

  it('should reject duplicate username', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({
        username: 'johndoe',
        email: 'different@example.com',
        password: 'SecurePass1',
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Username');
  });

  it('should reject weak password', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'short',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject missing fields', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'nofields' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  // ---- LOGIN ----

  it('should login with correct credentials', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'SecurePass1' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.id).toBe(userId);
    expect(res.body.data.user.email).toBe('john@example.com');
  });

  it('should reject wrong password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'WrongPass1' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent email', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'SecurePass1' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  // ---- PROFILE ----

  it('should get current user profile', async () => {
    const res = await request
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.username).toBe('johndoe');
    expect(res.body.data.password).toBeUndefined();
  });

  it('should reject profile request without token', async () => {
    await request.get('/api/users/me').expect(401);
  });

  it('should reject profile request with invalid token', async () => {
    await request
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  // ---- PASSWORD CHANGE ----

  it('should change password', async () => {
    const res = await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        current_password: 'SecurePass1',
        new_password: 'NewSecure2',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('Password updated');
  });

  it('should reject change with wrong current password', async () => {
    const res = await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        current_password: 'WrongOldPass1',
        new_password: 'AnotherNew3',
      })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should reject same password as current', async () => {
    const res = await request
      .put('/api/users/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        current_password: 'NewSecure2',
        new_password: 'NewSecure2',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should login with new password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'NewSecure2' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with old password', async () => {
    await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'SecurePass1' })
      .expect(401);
  });

  // ---- FORGOT PASSWORD ----

  it('should return success for forgot-password with existing email', async () => {
    const res = await request
      .post('/api/auth/forgot-password')
      .send({ email: 'john@example.com' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('password reset link');
  });

  it('should return success for forgot-password with non-existent email (no enumeration)', async () => {
    const res = await request
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('password reset link');
  });

  it('should reject forgot-password with invalid email format', async () => {
    const res = await request
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('should create a reset token in the database', async () => {
    const { rows } = await db().query(
      'SELECT * FROM password_reset_tokens WHERE user_id = $1',
      [userId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].token_hash).toBeDefined();
    expect(rows[0].token_hash.length).toBe(64); // SHA-256 hex
    expect(new Date(rows[0].expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  // ---- RESET PASSWORD ----

  it('should reject reset with invalid token', async () => {
    const fakeToken = crypto.randomBytes(32).toString('hex');

    const res = await request
      .post('/api/auth/reset-password')
      .send({ token: fakeToken, new_password: 'ResetPass1' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid or expired');
  });

  it('should reject reset with weak new password', async () => {
    const fakeToken = crypto.randomBytes(32).toString('hex');

    const res = await request
      .post('/api/auth/reset-password')
      .send({ token: fakeToken, new_password: 'weak' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('should reject reset with missing token', async () => {
    const res = await request
      .post('/api/auth/reset-password')
      .send({ new_password: 'ResetPass1' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('should reset password with a valid token', async () => {
    // Generate a token the same way the service does
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Insert directly into DB for this test
    await db().query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    await db().query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    const res = await request
      .post('/api/auth/reset-password')
      .send({ token: plainToken, new_password: 'AfterReset1' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('reset successfully');
  });

  it('should login with the reset password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'AfterReset1' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with the pre-reset password', async () => {
    await request
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'NewSecure2' })
      .expect(401);
  });

  it('should have deleted the used reset token', async () => {
    const { rows } = await db().query(
      'SELECT * FROM password_reset_tokens WHERE user_id = $1',
      [userId]
    );
    expect(rows.length).toBe(0);
  });

  it('should reject expired reset token', async () => {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiredAt = new Date(Date.now() - 1000); // already expired

    await db().query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiredAt]
    );

    const res = await request
      .post('/api/auth/reset-password')
      .send({ token: plainToken, new_password: 'ExpiredTest1' })
      .expect(400);

    expect(res.body.error).toContain('Invalid or expired');
  });

  // ---- ADMIN PASSWORD RESET ----

  it('should work for admin users too', async () => {
    const admin = await createAdminUser('resetadmin', 'resetadmin@inflexa.com', 'AdminPass123');

    // Request forgot password
    const forgotRes = await request
      .post('/api/auth/forgot-password')
      .send({ email: 'resetadmin@inflexa.com' })
      .expect(200);

    expect(forgotRes.body.success).toBe(true);

    // Get admin user ID
    const { rows: adminRows } = await db().query(
      'SELECT id FROM users WHERE email = $1',
      ['resetadmin@inflexa.com']
    );
    const adminId = adminRows[0].id;

    // Create a valid token directly for testing
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db().query('DELETE FROM password_reset_tokens WHERE user_id = $1', [adminId]);
    await db().query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [adminId, tokenHash, expiresAt]
    );

    // Reset the admin password
    const resetRes = await request
      .post('/api/auth/reset-password')
      .send({ token: plainToken, new_password: 'NewAdmin1' })
      .expect(200);

    expect(resetRes.body.success).toBe(true);

    // Login with new password
    const loginRes = await request
      .post('/api/auth/login')
      .send({ email: 'resetadmin@inflexa.com', password: 'NewAdmin1' })
      .expect(200);

    expect(loginRes.body.data.user.role).toBe('admin');
  });
});
