import pool from '../config/database';
import { IUser, IUserRow, CreateUserRow } from '../types/user.types';

export async function findByEmail(email: string): Promise<IUserRow | null> {
  const { rows } = await pool.query<IUserRow>(
    'SELECT id, username, email, password, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

export async function findByUsername(username: string): Promise<IUserRow | null> {
  const { rows } = await pool.query<IUserRow>(
    'SELECT id, username, email, password, role, created_at FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

export async function findById(id: number): Promise<IUser | null> {
  const { rows } = await pool.query<IUser>(
    'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function findByIdWithPassword(id: number): Promise<IUserRow | null> {
  const { rows } = await pool.query<IUserRow>(
    'SELECT id, username, email, password, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function create(data: CreateUserRow): Promise<IUser> {
  const { rows } = await pool.query<IUser>(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, username, email, role, created_at`,
    [data.username, data.email, data.hashedPassword]
  );
  return rows[0];
}

export async function updatePassword(id: number, hashedPassword: string): Promise<void> {
  const { rowCount } = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, id]
  );
  if ((rowCount ?? 0) === 0) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
}
