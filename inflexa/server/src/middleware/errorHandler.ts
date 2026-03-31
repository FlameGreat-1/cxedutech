import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 404 handler for unmatched routes.
 *
 * SECURITY: Never echo the request method or URL path back to the client.
 * Attackers use reflected route information for endpoint enumeration and
 * reconnaissance. The full details are logged server-side for debugging.
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
 * SECURITY: For 5xx errors, always return a generic message. For 4xx errors,
 * return the error message only if it does not contain path/route information.
 * Full error details (including stack traces) are logged server-side only.
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

  // For server errors, never expose internal details
  if (statusCode >= 500) {
    res.status(statusCode).json({
      success: false,
      error: 'An internal error occurred. Please try again later.',
    });
    return;
  }

  // For client errors (4xx), return the message but sanitize any route/path leaks
  let safeMessage = err.message;
  if (/\/(api|payments|stripe|paystack|orders|admin|auth|users|products)\//i.test(safeMessage)) {
    safeMessage = 'The request could not be processed.';
  }

  res.status(statusCode).json({
    success: false,
    error: safeMessage,
  });
}
