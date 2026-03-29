import { Router } from 'express';
import { createOrder, getMyOrders, getMyOrderById } from '../controllers/orderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderRules } from '../validators/orderValidators';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/', orderLimiter, validate(createOrderRules), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
