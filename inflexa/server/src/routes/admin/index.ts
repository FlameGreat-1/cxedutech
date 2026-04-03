import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import adminProductRoutes from './adminProductRoutes';
import adminOrderRoutes from './adminOrderRoutes';
import adminPaymentRoutes from './adminPaymentRoutes';
import adminSettingsRoutes from './adminSettingsRoutes';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);
router.use('/payments', adminPaymentRoutes);
router.use('/settings', adminSettingsRoutes);

export default router;
