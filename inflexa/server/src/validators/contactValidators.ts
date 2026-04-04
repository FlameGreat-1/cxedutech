import { body } from 'express-validator';
import { sanitizeXss } from './sanitize';

const ALLOWED_SUBJECTS = [
  'General Enquiry',
  'Order Issue',
  'Shipping Question',
  'Return or Refund',
  'Product Question',
  'Bulk or Wholesale Order',
  'Partnership or Collaboration',
  'Other',
];

export const contactRules = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters.')
    .customSanitizer(sanitizeXss),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters.')
    .customSanitizer(sanitizeXss),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required.')
    .isIn(ALLOWED_SUBJECTS).withMessage('Invalid subject selected.')
    .customSanitizer(sanitizeXss),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters.')
    .customSanitizer(sanitizeXss),
];
