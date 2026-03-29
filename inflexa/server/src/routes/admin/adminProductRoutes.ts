import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
} from '../../controllers/admin/adminProductController';
import { validate } from '../../middleware/validate';
import {
  createProductRules,
  updateProductRules,
  updateInventoryRules,
} from '../../validators/productValidators';
import { writeLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', writeLimiter, validate(createProductRules), createProduct);
router.put('/:id', writeLimiter, validate(updateProductRules), updateProduct);
router.delete('/:id', writeLimiter, deleteProduct);
router.patch('/:id/inventory', writeLimiter, validate(updateInventoryRules), updateInventory);

export default router;
