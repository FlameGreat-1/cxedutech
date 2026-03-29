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

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', validate(createProductRules), createProduct);
router.put('/:id', validate(updateProductRules), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/inventory', validate(updateInventoryRules), updateInventory);

export default router;
