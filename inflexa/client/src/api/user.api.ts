import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { IUser, ChangePasswordDTO } from '@/types/auth.types';

export async function getMe(): Promise<IUser> {
  const res = await apiClient.get<ApiResponse<IUser>>('/users/me');
  return res.data.data;
}

export async function changePassword(data: ChangePasswordDTO): Promise<{ message: string }> {
  const res = await apiClient.put<ApiResponse<{ message: string }>>('/users/password', data);
  return res.data.data;
}
