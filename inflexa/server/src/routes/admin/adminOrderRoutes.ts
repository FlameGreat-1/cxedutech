import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  shipOrder,
  exportOrders,
  getPaidUnshippedOrders,
} from '../../controllers/admin/adminOrderController';
import { validate } from '../../middleware/validate';
import { updateOrderStatusRules } from '../../validators/orderValidators';
import { writeLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.get('/', getAllOrders);
router.get('/export', exportOrders);
router.get('/unshipped', getPaidUnshippedOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', writeLimiter, validate(updateOrderStatusRules), updateOrderStatus);
router.post('/:id/ship', writeLimiter, shipOrder);

export default router;
