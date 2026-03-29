import { Response } from 'express';

export function sendSuccess(
  res: Response,
  data: unknown,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 500
): void {
  res.status(statusCode).json({
    success: false,
    error,
  });
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
): void {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
