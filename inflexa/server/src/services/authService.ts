import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as userModel from '../models/userModel';
import { CreateUserDTO, LoginDTO, AuthResponse, JwtPayload, IUser } from '../types/user.types';

const SALT_ROUNDS = 12;

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
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
    password: data.password,
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
