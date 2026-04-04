import { Router } from 'express';
import { recordConsent } from '../controllers/consentController';
import { validate } from '../middleware/validate';
import { consentRules } from '../validators/consentValidators';
import { apiLimiter } from '../middleware/rateLimiter';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate';

const router = Router();

/**
 * POST /api/consent
 *
 * Public endpoint — no authentication required.
 * Rate-limited via the general apiLimiter (200 req / 15 min per IP).
 *
 * optionalAuthenticate is applied so that:
 *  - Guests: req.user is undefined — user_id stored as NULL
 *  - Authenticated users: req.user is populated — user_id linked
 *    in the audit record for full traceability
 */
router.post(
  '/',
  apiLimiter,
  optionalAuthenticate,
  validate(consentRules),
  recordConsent,
);

export default router;
