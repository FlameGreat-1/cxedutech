import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Audit record retention: 6 years from the moment of recording.
 *
 * Rationale:
 *  - UK Limitation Act 1980: civil claims up to 6 years
 *  - GDPR Art. 5(2) accountability: must prove compliance for
 *    the duration of processing + a reasonable period after
 *  - ICO enforcement investigations can span several years
 *
 * This is completely independent of the client-side 180-day
 * re-consent TTL. The client sends consent_expires_at (180d)
 * which tells us when the user needs to re-consent. The server
 * calculates record_expires_at (6yr) which tells us when the
 * audit record itself can be safely purged.
 */
const RECORD_RETENTION_MS = 6 * 365 * 24 * 60 * 60 * 1000;

/**
 * POST /api/consent
 *
 * Records a cookie consent decision to the database.
 * This endpoint is unauthenticated — consent must be recordable
 * by guests before they have an account or session token.
 *
 * The record is append-only (no UPDATE/DELETE) to maintain a
 * full audit trail for ICO / GDPR compliance purposes.
 *
 * Two expiry timestamps are stored:
 *  - consent_expires_at  → from the client (180-day re-consent window)
 *  - record_expires_at   → calculated server-side (6-year audit retention)
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
      expires_at,        // client-side 180-day re-consent deadline
    } = req.body;

    // Resolve optional authenticated user_id
    const userId: number | null = req.user?.id ?? null;

    // Capture request metadata for the audit record.
    // X-Forwarded-For is set by the reverse proxy (nginx).
    const rawIp =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        .trim() ?? req.socket.remoteAddress ?? null;

    const userAgent = req.headers['user-agent'] ?? null;

    // Server calculates its own 6-year retention deadline.
    // This must never come from the client — it is a server
    // concern only and must not be spoofable.
    const recordExpiresAt = new Date(
      Date.now() + RECORD_RETENTION_MS,
    ).toISOString();

    await pool.query(
      `INSERT INTO cookie_consents
         (session_id, user_id, status, preferences, consent_version,
          ip_address, user_agent, consent_expires_at, record_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6::inet, $7, $8::timestamptz, $9::timestamptz)`,
      [
        session_id,
        userId,
        status,
        JSON.stringify(preferences),
        consent_version,
        rawIp,
        userAgent,
        expires_at,       // consent_expires_at — 180-day client TTL
        recordExpiresAt,  // record_expires_at  — 6-year server retention
      ],
    );

    logger.info(
      `Cookie consent recorded: status=${status} version=${consent_version} ` +
      `session=${session_id.slice(0, 8)}... ` +
      `consent_expires=${expires_at} record_expires=${recordExpiresAt}`,
    );

    sendSuccess(res, { recorded: true }, 201);
  } catch (error: unknown) {
    next(error);
  }
}
