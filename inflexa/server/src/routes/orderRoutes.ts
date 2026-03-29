import { Router } from 'express';
import {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getMyOrderById,
  getGuestOrderByIdAndEmail,
} from '../controllers/orderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderRules } from '../validators/orderValidators';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

// Guest checkout routes (no auth required)
router.post('/guest', orderLimiter, validate(createOrderRules), createGuestOrder);
router.get('/guest/:id', getGuestOrderByIdAndEmail);

// Authenticated user routes
router.use(authenticate);
router.post('/', orderLimiter, validate(createOrderRules), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
