import { body } from 'express-validator';

export const createPaymentIntentRules = [
  body('order_id')
    .isInt({ min: 1 }).withMessage('A valid order ID is required.'),
];

export const initializePaystackRules = [
  body('order_id')
    .isInt({ min: 1 }).withMessage('A valid order ID is required.'),
];
