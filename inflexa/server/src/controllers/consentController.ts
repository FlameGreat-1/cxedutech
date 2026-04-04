import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * POST /api/consent
 *
 * Records a cookie consent decision to the database.
 * This endpoint is unauthenticated — consent must be recordable
 * by guests before they have an account or session token.
 *
 * The record is append-only (no UPDATE/DELETE) to maintain a
 * full audit trail for ICO / GDPR compliance purposes.
 */
export async function recordConsent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      status,
      preferences,
      consent_version,
      session_id,
      expires_at,
    } = req.body;

    // Resolve optional authenticated user_id
    const userId: number | null = req.user?.id ?? null;

    // Capture request metadata for the audit record
    // X-Forwarded-For is set by the reverse proxy (nginx)
    const rawIp =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        .trim() ?? req.socket.remoteAddress ?? null;

    const userAgent = req.headers['user-agent'] ?? null;

    await pool.query(
      `INSERT INTO cookie_consents
         (session_id, user_id, status, preferences, consent_version,
          ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6::inet, $7, $8::timestamptz)`,
      [
        session_id,
        userId,
        status,
        JSON.stringify(preferences),
        consent_version,
        rawIp,
        userAgent,
        expires_at,
      ],
    );

    logger.info(
      `Cookie consent recorded: status=${status} version=${consent_version} session=${session_id.slice(0, 8)}...`,
    );

    sendSuccess(res, { recorded: true }, 201);
  } catch (error: unknown) {
    next(error);
  }
}
