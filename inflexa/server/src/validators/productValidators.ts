import { body } from 'express-validator';

export const createProductRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.'),
  body('age_range')
    .trim()
    .notEmpty().withMessage('Age range is required.'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required.'),
  body('focus_area')
    .trim()
    .notEmpty().withMessage('Focus area is required.'),
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
    .isString().withMessage('Each included item must be a string.'),
  body('inventory_count')
    .optional()
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
  body('image_url')
    .optional({ values: 'null' })
    .trim()
    .isURL().withMessage('Image URL must be a valid URL.'),
];

export const updateProductRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters.'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty.'),
  body('age_range')
    .optional()
    .trim()
    .notEmpty().withMessage('Age range cannot be empty.'),
  body('subject')
    .optional()
    .trim()
    .notEmpty().withMessage('Subject cannot be empty.'),
  body('focus_area')
    .optional()
    .trim()
    .notEmpty().withMessage('Focus area cannot be empty.'),
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
    .isString().withMessage('Each included item must be a string.'),
  body('inventory_count')
    .optional()
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
  body('image_url')
    .optional({ values: 'null' })
    .trim()
    .isURL().withMessage('Image URL must be a valid URL.'),
];

export const updateInventoryRules = [
  body('inventory_count')
    .isInt({ min: 0 }).withMessage('Inventory count must be a non-negative integer.'),
];
