import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { sendSuccess } from '../utils/apiResponse';

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

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;
    await authService.changePassword(userId, { current_password, new_password });
    sendSuccess(res, { message: 'Password updated successfully.' });
  } catch (error: unknown) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    await authService.forgotPassword({ email });
    // Always return success to prevent email enumeration
    sendSuccess(res, { message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error: unknown) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, new_password } = req.body;
    await authService.resetPassword({ token, new_password });
    sendSuccess(res, { message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error: unknown) {
    next(error);
  }
}
