import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  uploadImage,
} from '../../controllers/admin/adminProductController';
import { validate } from '../../middleware/validate';
import {
  createProductRules,
  updateProductRules,
  updateInventoryRules,
} from '../../validators/productValidators';
import { writeLimiter } from '../../middleware/rateLimiter';
import { productImageUpload } from '../../middleware/upload';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', writeLimiter, validate(createProductRules), createProduct);
router.put('/:id', writeLimiter, validate(updateProductRules), updateProduct);
router.delete('/:id', writeLimiter, deleteProduct);
router.patch('/:id/inventory', writeLimiter, validate(updateInventoryRules), updateInventory);
router.post('/:id/image', writeLimiter, productImageUpload.single('image'), uploadImage);

export default router;
