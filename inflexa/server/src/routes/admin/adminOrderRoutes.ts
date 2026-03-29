import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  exportOrders,
} from '../../controllers/admin/adminOrderController';
import { validate } from '../../middleware/validate';
import { updateOrderStatusRules } from '../../validators/orderValidators';
import { writeLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.get('/', getAllOrders);
router.get('/export', exportOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', writeLimiter, validate(updateOrderStatusRules), updateOrderStatus);

export default router;
