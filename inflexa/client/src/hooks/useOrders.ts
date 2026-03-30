import { useState, useEffect, useCallback } from 'react';
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
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getMyOrders(page, ORDERS_PER_PAGE);
      setOrders(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, total, page, totalPages, isLoading, error, setPage, refetch: fetchOrders };
}
