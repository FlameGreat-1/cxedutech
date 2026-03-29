import { Router } from 'express';
import { createPaymentIntent, stripeWebhook, getPaymentDetails } from '../controllers/paymentController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createPaymentIntentRules } from '../validators/paymentValidators';

const router = Router();

router.post(
  '/create-intent',
  authenticate,
  validate(createPaymentIntentRules),
  createPaymentIntent
);

router.get('/:paymentId', authenticate, getPaymentDetails);

export default router;
