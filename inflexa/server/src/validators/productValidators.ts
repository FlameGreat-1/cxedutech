import { body } from 'express-validator';
import { sanitizeXss } from './sanitize';

function isValidImageRef(value: string): boolean {
  if (value.startsWith('/uploads/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const createProductRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters.')
    .customSanitizer(sanitizeXss),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .customSanitizer(sanitizeXss),
  body('min_age')
    .isInt({ min: 0, max: 18 }).withMessage('Minimum age must be between 0 and 18.'),
  body('max_age')
    .isInt({ min: 0, max: 18 }).withMessage('Maximum age must be between 0 and 18.')
    .custom((value, { req }) => {
      if (parseInt(value, 10) < parseInt(req.body.min_age, 10)) {
        throw new Error('Maximum age must be greater than or equal to minimum age.');
      }
      return true;
    }),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required.')
    .customSanitizer(sanitizeXss),
  body('focus_area')
    .trim()
    .notEmpty().withMessage('Focus area is required.')
    .customSanitizer(sanitizeXss),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
  body('format')
    .isIn(['physical', 'printable']).withMessage('Format must be physical or printable.'),
  body('included_items')
    .isArray({ min: 1 }).withMessage('Included items must be a non-empty array.'),
  body('included_items.*')
    .isString().withMessage('Each included item must be a string.')
    .customSanitizer(sanitizeXss),
  body('inventory_count')
    .optional()
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
  body('image_url')
    .optional({ values: 'null' })
    .trim()
    .custom((value) => {
      if (!isValidImageRef(value)) {
        throw new Error('Image URL must be a valid URL or a local /uploads/ path.');
      }
      return true;
    }),
];

export const updateProductRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters.')
    .customSanitizer(sanitizeXss),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty.')
    .customSanitizer(sanitizeXss),
  body('min_age')
    .optional()
    .isInt({ min: 0, max: 18 }).withMessage('Minimum age must be between 0 and 18.'),
  body('max_age')
    .optional()
    .isInt({ min: 0, max: 18 }).withMessage('Maximum age must be between 0 and 18.'),
  body('subject')
    .optional()
    .trim()
    .notEmpty().withMessage('Subject cannot be empty.')
    .customSanitizer(sanitizeXss),
  body('focus_area')
    .optional()
    .trim()
    .notEmpty().withMessage('Focus area cannot be empty.')
    .customSanitizer(sanitizeXss),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
  body('format')
    .optional()
    .isIn(['physical', 'printable']).withMessage('Format must be physical or printable.'),
  body('included_items')
    .optional()
    .isArray({ min: 1 }).withMessage('Included items must be a non-empty array.'),
  body('included_items.*')
    .optional()
    .isString().withMessage('Each included item must be a string.')
    .customSanitizer(sanitizeXss),
  body('inventory_count')
    .optional()
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
  body('image_url')
    .optional({ values: 'null' })
    .trim()
    .custom((value) => {
      if (!isValidImageRef(value)) {
        throw new Error('Image URL must be a valid URL or a local /uploads/ path.');
      }
      return true;
    }),
];

export const updateInventoryRules = [
  body('inventory_count')
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
];
