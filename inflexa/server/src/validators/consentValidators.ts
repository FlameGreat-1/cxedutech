import { body } from 'express-validator';

/**
 * Validates the POST /api/consent payload.
 *
 * Rules mirror the client-side CookiePreferences type exactly:
 *   - status: one of the three valid consent outcomes
 *   - preferences: object with boolean flags per category
 *   - consent_version: semver string matching CONSENT_VERSION
 *   - session_id: 64-char hex SHA-256 string
 *   - expires_at: ISO 8601 datetime
 */
export const consentRules = [
  body('status')
    .trim()
    .notEmpty().withMessage('status is required.')
    .isIn(['accepted', 'rejected', 'customised'])
    .withMessage('status must be accepted, rejected, or customised.'),

  body('preferences')
    .notEmpty().withMessage('preferences is required.')
    .isObject().withMessage('preferences must be an object.'),

  body('preferences.necessary')
    .equals('true').withMessage('preferences.necessary must be true.')
    // express-validator receives booleans as booleans from JSON
    .customSanitizer((v) => v === true || v === 'true'),

  body('preferences.analytics')
    .isBoolean().withMessage('preferences.analytics must be a boolean.')
    .toBoolean(),

  body('preferences.functional')
    .isBoolean().withMessage('preferences.functional must be a boolean.')
    .toBoolean(),

  body('preferences.marketing')
    .isBoolean().withMessage('preferences.marketing must be a boolean.')
    .toBoolean(),

  body('consent_version')
    .trim()
    .notEmpty().withMessage('consent_version is required.')
    .isLength({ max: 20 }).withMessage('consent_version too long.'),

  body('session_id')
    .trim()
    .notEmpty().withMessage('session_id is required.')
    .isLength({ min: 8, max: 64 }).withMessage('session_id must be 8-64 characters.'),

  body('expires_at')
    .trim()
    .notEmpty().withMessage('expires_at is required.')
    .isISO8601().withMessage('expires_at must be a valid ISO 8601 date.'),
];
