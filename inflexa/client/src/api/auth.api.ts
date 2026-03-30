import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { AuthResponse, RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from '@/types/auth.types';

export async function register(data: RegisterDTO): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data.data;
}

export async function login(data: LoginDTO): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data.data;
}

export async function forgotPassword(data: ForgotPasswordDTO): Promise<{ message: string }> {
  const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data);
  return res.data.data;
}

export async function resetPassword(data: ResetPasswordDTO): Promise<{ message: string }> {
  const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
  return res.data.data;
}
