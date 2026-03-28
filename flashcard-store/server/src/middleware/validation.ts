import { body, validationResult } from 'express-validator';

export const validateProduct = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('ageRange').notEmpty().withMessage('Age range is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('focusArea').notEmpty().withMessage('Focus area is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('format').isIn(['physical', 'printable']).withMessage('Format must be either physical or printable'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateOrder = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];