import { Router } from 'express';
import {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getMyOrderById,
  getGuestOrderByIdAndEmail,
  getShippingRatesForCheckout,
} from '../controllers/orderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderRules, shippingRatesRules } from '../validators/orderValidators';
import { orderLimiter, guestLookupLimiter } from '../middleware/rateLimiter';

const router = Router();

// Pre-checkout: fetch shipping rates (public, no auth required)
router.post('/shipping-rates', orderLimiter, validate(shippingRatesRules), getShippingRatesForCheckout);

// Guest checkout routes (no auth required)
router.post('/guest', orderLimiter, validate(createOrderRules), createGuestOrder);
router.get('/guest/:id', guestLookupLimiter, getGuestOrderByIdAndEmail);

// Authenticated user routes
router.use(authenticate);
router.post('/', orderLimiter, validate(createOrderRules), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
