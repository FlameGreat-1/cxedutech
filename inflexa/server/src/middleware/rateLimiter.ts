import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const isTest = process.env.NODE_ENV === 'test';

// In test environment, skip rate limiting entirely
const noopLimiter = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

// Auth endpoints: brute-force protection
export const authLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
      },
    });

// Password reset: prevent email enumeration and abuse
export const passwordResetLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many password reset attempts. Please try again in 15 minutes.',
      },
    });

// Payment endpoints: prevent payment gateway abuse (Stripe + Paystack)
export const paymentLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many payment attempts. Please try again in 15 minutes.',
      },
    });

// Order creation: prevent inventory lock spam
export const orderLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many order attempts. Please try again in 15 minutes.',
      },
    });

// Guest order lookup: prevent order ID enumeration and email brute-forcing
export const guestLookupLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many lookup attempts. Please try again in 15 minutes.',
      },
    });

// Admin write operations
export const writeLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many write operations. Please try again later.',
      },
    });

// General API: public reads only (products, etc.)
export const apiLimiter = isTest
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
    });
