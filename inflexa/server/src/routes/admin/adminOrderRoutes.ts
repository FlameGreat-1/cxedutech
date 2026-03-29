import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  exportOrders,
} from '../../controllers/admin/adminOrderController';
import { validate } from '../../middleware/validate';
import { updateOrderStatusRules } from '../../validators/orderValidators';

const router = Router();

router.get('/', getAllOrders);
router.get('/export', exportOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', validate(updateOrderStatusRules), updateOrderStatus);

export default router;
