import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 404 handler for unmatched routes.
 *
 * SECURITY: Never echo the request method or URL path back to the client.
 * Full details are logged server-side for debugging.
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: 'The requested resource was not found.',
  });
}

/**
 * Global error handler.
 *
 * SECURITY: For 5xx errors, return safe messages based on status code.
 * For 4xx errors, return the error message directly (these are intentional
 * business-logic messages set by our controllers/services).
 * Full error details are always logged server-side.
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;

  logger.error(`[${statusCode}] ${err.message}`, {
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.originalUrl,
  });

  if (statusCode >= 500) {
    // Upstream payment gateway errors get a specific message
    if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
      res.status(statusCode).json({
        success: false,
        error: 'The payment service is temporarily unavailable. Please try again in a few minutes.',
      });
      return;
    }

    // All other server errors
    res.status(statusCode).json({
      success: false,
      error: 'An internal error occurred. Please try again later.',
    });
    return;
  }

  // 4xx client errors - these are intentional messages from our services
  // (e.g. "Order not found", "out of stock", "Access denied")
  res.status(statusCode).json({
    success: false,
    error: err.message,
  });
}
