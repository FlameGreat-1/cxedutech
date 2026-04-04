import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/user.types';

/**
 * optionalAuthenticate
 *
 * Attempts to decode a Bearer JWT if present in the Authorization
 * header. If valid, populates req.user exactly as the authenticate
 * middleware does. If absent or invalid, the request continues
 * without error and req.user remains undefined.
 *
 * Use this on public endpoints that benefit from knowing the
 * authenticated user when present, but must not reject guests.
 *
 * Example: POST /api/consent — guests must be able to record
 * consent before they have an account, but authenticated users'
 * consent records should have their user_id linked for the
 * audit trail.
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    // No token present — continue as guest
    return next();
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token present but invalid or expired — treat as guest,
    // do not reject the request.
  }

  next();
}
