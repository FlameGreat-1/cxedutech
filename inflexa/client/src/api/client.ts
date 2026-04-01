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

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Server returned a structured JSON error - trust it.
    // The server-side errorHandler already sanitizes sensitive info.
    if (data?.error) {
      return data.error;
    }
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.message).join(' ');
    }

    // No structured response body - server might be completely down.
    // Use status-based fallbacks that don't leak anything.
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status && status >= 500) return 'A server error occurred. Please try again later.';

    // Network error (no response received at all - server unreachable)
    if (!error.response) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export default apiClient;
