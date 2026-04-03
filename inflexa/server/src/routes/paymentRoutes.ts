import { Router } from 'express';
import {
  createStripeIntent,
  createGuestStripeIntent,
  initializePaystackTransaction,
  initializeGuestPaystackTransaction,
  verifyPaystackTransaction,
  getGatewayStatus,
  getPaymentDetails,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createPaymentIntentRules, initializePaystackRules } from '../validators/paymentValidators';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Stripe ────────────────────────────────────────────────────────

router.post(
  '/stripe/guest/create-intent',
  paymentLimiter,
  validate(createPaymentIntentRules),
  createGuestStripeIntent
);

router.post(
  '/stripe/create-intent',
  authenticate,
  paymentLimiter,
  validate(createPaymentIntentRules),
  createStripeIntent
);

// ── Paystack ──────────────────────────────────────────────────────

router.post(
  '/paystack/guest/initialize',
  paymentLimiter,
  validate(initializePaystackRules),
  initializeGuestPaystackTransaction
);

router.post(
  '/paystack/initialize',
  authenticate,
  paymentLimiter,
  validate(initializePaystackRules),
  initializePaystackTransaction
);

router.get(
  '/paystack/verify/:reference',
  paymentLimiter,
  verifyPaystackTransaction
);

// ── Gateway Status (public, no auth) ───────────────────────────────────

router.get('/gateways/status', getGatewayStatus);

// ── Shared ────────────────────────────────────────────────────────

router.get('/:paymentId', authenticate, getPaymentDetails);

export default router;
