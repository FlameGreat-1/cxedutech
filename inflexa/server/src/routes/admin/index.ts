import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import adminProductRoutes from './adminProductRoutes';
import adminOrderRoutes from './adminOrderRoutes';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);

export default router;
