import { body } from 'express-validator';
import { VALID_ORDER_STATUSES } from '../types/order.types';
import { sanitizeXss } from './sanitize';

export const createOrderRules = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item.'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Each item must have a valid product ID.'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Each item quantity must be at least 1.'),
  body('shipping.shipping_name')
    .trim()
    .notEmpty().withMessage('Shipping name is required.')
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_email')
    .trim()
    .isEmail().withMessage('Valid shipping email is required.')
    .normalizeEmail(),
  body('shipping.shipping_phone')
    .optional({ values: 'null' })
    .trim()
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_address_line1')
    .trim()
    .notEmpty().withMessage('Shipping address line 1 is required.')
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_address_line2')
    .optional({ values: 'null' })
    .trim()
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_city')
    .trim()
    .notEmpty().withMessage('Shipping city is required.')
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_state')
    .trim()
    .notEmpty().withMessage('Shipping state/county is required.')
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_postal_code')
    .trim()
    .notEmpty().withMessage('Shipping postal code is required.')
    .customSanitizer(sanitizeXss),
  body('shipping.shipping_country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 }).withMessage('Country code must be 2-5 characters.'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
];

export const updateOrderStatusRules = [
  body('order_status')
    .isIn(VALID_ORDER_STATUSES)
    .withMessage(`Order status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`),
];
