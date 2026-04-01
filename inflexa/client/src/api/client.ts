import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { getToken } from '@/utils/storage';
import type { ApiErrorResponse } from '@/types/api.types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Patterns that leak internal implementation details and must be sanitized.
 * These catch route/path info that might slip through from proxies or
 * misconfigured servers. The server-side errorHandler is the primary
 * defense; this is the backup layer.
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /route\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\/[^\s]*/i,
  /cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+\/[^\s]*/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
];

const SAFE_FALLBACK = 'Something went wrong. Please try again later or contact support.';

function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Check structured error response first
    if (data?.error) {
      if (containsSensitiveInfo(data.error)) return SAFE_FALLBACK;
      return data.error;
    }
    if (data?.errors && data.errors.length > 0) {
      const combined = data.errors.map((e) => e.message).join(' ');
      if (containsSensitiveInfo(combined)) return SAFE_FALLBACK;
      return combined;
    }

    // Check raw message (often contains route/path info from proxies)
    if (error.message) {
      if (containsSensitiveInfo(error.message)) return SAFE_FALLBACK;
    }

    // Status-based fallbacks only for server-side errors where no
    // structured message was provided
    if (status === 502 || status === 503) return 'The server is temporarily unavailable. Please try again shortly.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status && status >= 500) return 'A server error occurred. Please try again later.';

    if (error.message) return error.message;
  }
  if (error instanceof Error) {
    if (containsSensitiveInfo(error.message)) return SAFE_FALLBACK;
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export default apiClient;
