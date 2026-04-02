import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  uploadImage,
  deleteImage,
  setPrimaryImage,
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

// Image management (single endpoint accepts 1-5 files)
router.post('/:id/image', writeLimiter, productImageUpload.array('images', 5), uploadImage);
router.delete('/:id/images/:imageId', writeLimiter, deleteImage);
router.patch('/:id/images/:imageId/primary', writeLimiter, setPrimaryImage);

export default router;
