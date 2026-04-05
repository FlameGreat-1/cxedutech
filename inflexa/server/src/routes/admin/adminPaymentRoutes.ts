import { Router } from 'express';
import {
  getAllPayments,
  getPaymentByOrderId,
  getPaymentById,
} from '../../controllers/admin/adminPaymentController';

const router = Router();

router.get('/', getAllPayments);
router.get('/by-order/:orderId', getPaymentByOrderId);
router.get('/:id', getPaymentById);

export default router;
