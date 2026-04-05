import apiClient from '../client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { INotification } from '@/types/notification.types';

const BASE = '/admin/notifications';

export async function getAll(
  page: number = 1,
  limit: number = 30
): Promise<PaginatedResponse<INotification>> {
  const res = await apiClient.get<PaginatedResponse<INotification>>(BASE, {
    params: { page, limit },
  });
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<ApiResponse<{ unread_count: number }>>(
    `${BASE}/unread-count`
  );
  return res.data.data.unread_count;
}

export async function markAsRead(id: number): Promise<INotification> {
  const res = await apiClient.put<ApiResponse<INotification>>(
    `${BASE}/${id}/read`
  );
  return res.data.data;
}

export async function markAllAsRead(): Promise<{ marked: number }> {
  const res = await apiClient.put<ApiResponse<{ marked: number }>>(
    `${BASE}/read-all`
  );
  return res.data.data;
}
