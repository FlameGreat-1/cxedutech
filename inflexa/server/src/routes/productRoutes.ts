import { Router } from 'express';
import { getAllProducts, getProductById, getProductFilters } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/filters', getProductFilters);
router.get('/:id', getProductById);

export default router;
