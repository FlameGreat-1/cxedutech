import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as adminPaymentsApi from '@/api/admin/payments.api';
import type { AdminPayment } from '@/api/admin/payments.api';
import { extractErrorMessage } from '@/api/client';

const ADMIN_PAYMENTS_PER_PAGE = 20;

export function useAdminPayments() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'payments', page],
    queryFn: () => adminPaymentsApi.getAll(page, ADMIN_PAYMENTS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });

  return {
    payments: (data?.data ?? []) as AdminPayment[],
    total: data?.pagination?.total ?? 0,
    page,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    error: error ? extractErrorMessage(error) : null,
    setPage,
    refetch,
  };
}
