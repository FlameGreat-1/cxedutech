import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
} from '../../controllers/admin/adminPaymentController';

const router = Router();

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);

export default router;
