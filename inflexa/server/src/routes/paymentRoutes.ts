import { Router } from 'express';
import {
  createStripeIntent,
  createGuestStripeIntent,
  initializePaystackTransaction,
  initializeGuestPaystackTransaction,
  verifyPaystackTransaction,
  getGatewayStatus,
  getPaymentDetails,
  getOrderByPayment,
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

// Order by payment ID - used by post-payment confirmation flow.
// No auth required: caller must already know the payment ID from the
// authenticated payment creation or verification step.
router.get('/:paymentId/order', paymentLimiter, getOrderByPayment);

router.get('/:paymentId', authenticate, getPaymentDetails);

export default router;
