import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    sendSuccess(res, result, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    sendSuccess(res, result);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.id);
    sendSuccess(res, user);
  } catch (error: unknown) {
    next(error);
  }
}
