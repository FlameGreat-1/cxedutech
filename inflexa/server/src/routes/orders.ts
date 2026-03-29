import express from 'express';
import { createOrder, getOrder, updateOrderStatus } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Create a new order
router.post('/', authenticate, createOrder);

// Get an order by ID
router.get('/:id', authenticate, getOrder);

// Update order status
router.put('/:id/status', authenticate, updateOrderStatus);

export default router;