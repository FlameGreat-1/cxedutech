import { Router } from 'express';
import { recordConsent } from '../controllers/consentController';
import { validate } from '../middleware/validate';
import { consentRules } from '../validators/consentValidators';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/consent
 *
 * Public endpoint — no authentication required.
 * Rate-limited via the general apiLimiter (200 req / 15 min per IP)
 * which is more than sufficient for a consent record.
 *
 * The authenticate middleware is intentionally NOT applied here:
 * guests must be able to record consent before they log in.
 * The controller resolves req.user?.id gracefully when present.
 */
router.post('/', apiLimiter, validate(consentRules), recordConsent);

export default router;
