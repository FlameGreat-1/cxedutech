import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SALT_ROUNDS = 12;

function createPool(): Pool {
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return null;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main(): Promise<void> {
  console.log('\n============================================');
  console.log('  Inflexa - Create Admin User');
  console.log('============================================\n');

  const username = process.env.ADMIN_USERNAME || await prompt('Admin username: ');
  const email = process.env.ADMIN_EMAIL || await prompt('Admin email: ');
  const password = process.env.ADMIN_PASSWORD || await prompt('Admin password: ');

  if (!username || username.length < 3) {
    console.error('[ERROR] Username must be at least 3 characters.');
    process.exit(1);
  }

  if (!validateEmail(email)) {
    console.error('[ERROR] Invalid email address.');
    process.exit(1);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`[ERROR] ${passwordError}`);
    process.exit(1);
  }

  const pool = createPool();

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existing.rows.length > 0) {
      console.error('[ERROR] A user with that email or username already exists.');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword]
    );

    const admin = rows[0];
    console.log('\n[OK] Admin user created successfully:');
    console.log(`  ID:       ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Role:     ${admin.role}`);
    console.log('');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to create admin: ${message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
