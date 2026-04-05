import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as adminOrdersApi from '@/api/admin/orders.api';
import type { IOrder, OrderStatus } from '@/types/order.types';
import { ADMIN_ORDERS_PER_PAGE } from '@/utils/constants';
import { extractErrorMessage } from '@/api/client';

export function useAdminOrders() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => adminOrdersApi.getAll(page, ADMIN_ORDERS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      adminOrdersApi.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const shipMutation = useMutation({
    mutationFn: (id: number) => adminOrdersApi.ship(id),
    onSuccess: invalidate,
  });

  async function exportCsv() {
    const blob = await adminOrdersApi.exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inflexa-orders.csv';

    // Signal to the admin navigation guard that a programmatic download
    // is in progress so it doesn't show the "Leave site?" prompt.
    (window as unknown as Record<string, unknown>).__adminDownloadInProgress = true;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Clear the flag after a short delay to allow the download to complete
    setTimeout(() => {
      (window as unknown as Record<string, unknown>).__adminDownloadInProgress = false;
    }, 1000);
  }

  return {
    orders: (data?.data ?? []) as IOrder[],
    total: data?.pagination?.total ?? 0,
    page,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    error: error ? extractErrorMessage(error) : null,
    setPage,
    refetch,
    updateStatus: statusMutation.mutateAsync,
    shipOrder: shipMutation.mutateAsync,
    exportCsv,
    isUpdatingStatus: statusMutation.isPending,
    isShipping: shipMutation.isPending,
  };
}
