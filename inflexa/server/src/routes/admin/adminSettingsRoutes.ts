import { Router } from 'express';
import {
  getPaymentGatewayConfigs,
  updatePaymentGatewayConfig,
  getShippingConfigs,
  createShippingConfig,
  updateShippingConfig,
  deleteShippingConfig,
} from '../../controllers/admin/adminSettingsController';
import { writeLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Payment Gateway Configs
router.get('/payment-gateways', getPaymentGatewayConfigs);
router.put('/payment-gateways/:provider', writeLimiter, updatePaymentGatewayConfig);

// Shipping Configs
router.get('/shipping', getShippingConfigs);
router.post('/shipping', writeLimiter, createShippingConfig);
router.put('/shipping/:provider', writeLimiter, updateShippingConfig);
router.delete('/shipping/:provider', writeLimiter, deleteShippingConfig);

export default router;
