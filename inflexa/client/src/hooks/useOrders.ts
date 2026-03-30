import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as ordersApi from '@/api/orders.api';
import type { IOrder } from '@/types/order.types';
import { ORDERS_PER_PAGE } from '@/utils/constants';

interface UseOrdersReturn {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', 'mine', page],
    queryFn: () => ordersApi.getMyOrders(page, ORDERS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  return {
    orders: data?.data ?? [],
    total: data?.pagination?.total ?? 0,
    page,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    error: error ? 'Failed to load orders.' : null,
    setPage,
    refetch,
  };
}
