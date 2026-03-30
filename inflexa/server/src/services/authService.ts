import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as userModel from '../models/userModel';
import * as passwordResetTokenModel from '../models/passwordResetTokenModel';
import { sendPasswordResetEmail } from './emailService';
import { CreateUserDTO, LoginDTO, ChangePasswordDTO, ForgotPasswordDTO, ResetPasswordDTO, AuthResponse, JwtPayload, IUser } from '../types/user.types';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(data: CreateUserDTO): Promise<AuthResponse> {
  const existingEmail = await userModel.findByEmail(data.email);
  if (existingEmail) {
    throw Object.assign(new Error('Email is already registered.'), { statusCode: 409 });
  }

  const existingUsername = await userModel.findByUsername(data.username);
  if (existingUsername) {
    throw Object.assign(new Error('Username is already taken.'), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await userModel.create({
    username: data.username,
    email: data.email,
    hashedPassword,
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { token, user };
}

export async function login(data: LoginDTO): Promise<AuthResponse> {
  const userRow = await userModel.findByEmail(data.email);
  if (!userRow) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(data.password, userRow.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const token = signToken({ id: userRow.id, email: userRow.email, role: userRow.role });

  const user: IUser = {
    id: userRow.id,
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    created_at: userRow.created_at,
  };

  return { token, user };
}

export async function getProfile(userId: number): Promise<IUser> {
  const user = await userModel.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  return user;
}

export async function changePassword(userId: number, data: ChangePasswordDTO): Promise<void> {
  const userRow = await userModel.findByIdWithPassword(userId);
  if (!userRow) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const isMatch = await bcrypt.compare(data.current_password, userRow.password);
  if (!isMatch) {
    throw Object.assign(new Error('Current password is incorrect.'), { statusCode: 401 });
  }

  const hashedPassword = await bcrypt.hash(data.new_password, SALT_ROUNDS);
  await userModel.updatePassword(userId, hashedPassword);
}

export async function forgotPassword(data: ForgotPasswordDTO): Promise<void> {
  // Always return success to prevent email enumeration.
  // If the email doesn't exist, we silently do nothing.
  const userRow = await userModel.findByEmail(data.email);
  if (!userRow) {
    return;
  }

  const plainToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await passwordResetTokenModel.create(userRow.id, tokenHash, expiresAt);

  const resetUrl = `${env.clientUrl}/reset-password?token=${plainToken}&email=${encodeURIComponent(userRow.email)}`;

  sendPasswordResetEmail(userRow.email, userRow.username, resetUrl).catch((err) =>
    logger.error(`Failed to send password reset email to ${userRow.email}`, err)
  );
}

export async function resetPassword(data: ResetPasswordDTO): Promise<void> {
  const tokenHash = hashToken(data.token);

  // Find all users that have a valid (non-expired) token matching this hash
  const result = await findUserByResetToken(tokenHash);
  if (!result) {
    throw Object.assign(
      new Error('Invalid or expired reset token.'),
      { statusCode: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(data.new_password, SALT_ROUNDS);
  await userModel.updatePassword(result.userId, hashedPassword);
  await passwordResetTokenModel.deleteByUserId(result.userId);
}

async function findUserByResetToken(
  tokenHash: string
): Promise<{ userId: number } | null> {
  const { rows } = await (await import('../config/database')).default.query<{ user_id: number }>(
    `SELECT user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (rows.length === 0) return null;
  return { userId: rows[0].user_id };
}
