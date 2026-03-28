import express from 'express';
import { processPayment } from '../controllers/paymentController';

const router = express.Router();

// Route to handle payment processing
router.post('/process', processPayment);

export default router;