import { Router } from 'express';
import {
  getPaymentGatewayConfigs,
  updatePaymentGatewayConfig,
  getShippingConfigs,
  createShippingConfig,
  updateShippingConfig,
  deleteShippingConfig,
  getTaxConfigs,
  updateTaxConfig,
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

// Tax Configs
router.get('/tax', getTaxConfigs);
router.put('/tax/:region', writeLimiter, updateTaxConfig);

export default router;
