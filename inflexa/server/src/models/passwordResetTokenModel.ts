import pool from '../config/database';
import { IPasswordResetToken } from '../types/user.types';

export async function create(
  userId: number,
  tokenHash: string,
  expiresAt: Date
): Promise<IPasswordResetToken> {
  // Delete any existing tokens for this user before creating a new one
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);

  const { rows } = await pool.query<IPasswordResetToken>(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

export async function findValidByUserId(
  userId: number
): Promise<IPasswordResetToken | null> {
  const { rows } = await pool.query<IPasswordResetToken>(
    `SELECT * FROM password_reset_tokens
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function deleteByUserId(userId: number): Promise<void> {
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
}

export async function deleteExpired(): Promise<number> {
  const { rowCount } = await pool.query(
    'DELETE FROM password_reset_tokens WHERE expires_at <= NOW()'
  );
  return rowCount ?? 0;
}
