import { body } from 'express-validator';

export const createPaymentIntentRules = [
  body('order_id')
    .isInt({ min: 1 }).withMessage('A valid order ID is required.'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
];
