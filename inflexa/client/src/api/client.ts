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
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.error) return data.error;
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.message).join(' ');
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export default apiClient;
