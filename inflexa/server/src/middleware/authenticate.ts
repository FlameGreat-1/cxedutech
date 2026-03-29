import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/user.types';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
}
