import { Response } from 'express';
import { getSymbol } from './currency';

function enrichCurrency(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(enrichCurrency);
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
      result[key] = enrichCurrency(obj[key]);
    }

    if (
      typeof result.currency === 'string' &&
      result.currency_symbol === undefined
    ) {
      result.currency_symbol = getSymbol(result.currency as string);
    }

    return result;
  }

  return data;
}

export function sendSuccess(
  res: Response,
  data: unknown,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data: enrichCurrency(data),
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
    data: enrichCurrency(data),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
