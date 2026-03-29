import { Router } from 'express';
import { createOrder, getMyOrders, getMyOrderById } from '../controllers/orderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderRules } from '../validators/orderValidators';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderRules), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
