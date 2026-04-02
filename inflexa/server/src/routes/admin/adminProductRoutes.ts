import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  uploadImage,
  uploadImages,
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
import { productImageUpload, productMultiImageUpload } from '../../middleware/upload';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', writeLimiter, validate(createProductRules), createProduct);
router.put('/:id', writeLimiter, validate(updateProductRules), updateProduct);
router.delete('/:id', writeLimiter, deleteProduct);
router.patch('/:id/inventory', writeLimiter, validate(updateInventoryRules), updateInventory);

// Image management
router.post('/:id/image', writeLimiter, productImageUpload.single('image'), uploadImage);
router.post('/:id/images', writeLimiter, productMultiImageUpload.array('images', 5), uploadImages);
router.delete('/:id/images/:imageId', writeLimiter, deleteImage);
router.patch('/:id/images/:imageId/primary', writeLimiter, setPrimaryImage);

export default router;
