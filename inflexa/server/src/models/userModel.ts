import pool from '../config/database';
import { IUser, IUserRow, CreateUserDTO } from '../types/user.types';

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

export async function create(
  data: CreateUserDTO & { hashedPassword: string }
): Promise<IUser> {
  const { rows } = await pool.query<IUser>(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, username, email, role, created_at`,
    [data.username, data.email, data.hashedPassword]
  );
  return rows[0];
}
