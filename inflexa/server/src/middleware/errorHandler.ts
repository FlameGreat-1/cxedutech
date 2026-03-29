import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
