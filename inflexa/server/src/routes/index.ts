import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import contactRoutes from './contactRoutes';
import adminRoutes from './admin';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

export default router;
