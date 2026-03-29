import { Router } from 'express';
import {
  createPaymentIntent,
  createGuestPaymentIntent,
  getPaymentDetails,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createPaymentIntentRules } from '../validators/paymentValidators';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

// Guest payment (no auth required)
router.post(
  '/guest/create-intent',
  paymentLimiter,
  validate(createPaymentIntentRules),
  createGuestPaymentIntent
);

// Authenticated payment
router.post(
  '/create-intent',
  authenticate,
  paymentLimiter,
  validate(createPaymentIntentRules),
  createPaymentIntent
);

router.get('/:paymentId', authenticate, getPaymentDetails);

export default router;
