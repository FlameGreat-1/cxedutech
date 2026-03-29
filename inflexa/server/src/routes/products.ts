import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';

const router = express.Router();

// Route to get all products
router.get('/', getAllProducts);

// Route to get a product by ID
router.get('/:id', getProductById);

// Route to create a new product
router.post('/', createProduct);

// Route to update an existing product
router.put('/:id', updateProduct);

// Route to delete a product
router.delete('/:id', deleteProduct);

export default router;