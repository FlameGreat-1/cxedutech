import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as productsApi from '@/api/products.api';
import type { IProduct, ProductFilters } from '@/types/product.types';
import { PRODUCTS_PER_PAGE } from '@/utils/constants';

interface UseProductsOptions {
  /** Override the default per-page limit (default: PRODUCTS_PER_PAGE). */
  limit?: number;
}

interface UseProductsReturn {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useProducts(
  filters: ProductFilters = {},
  options: UseProductsOptions = {}
): UseProductsReturn {
  const perPage = options.limit ?? PRODUCTS_PER_PAGE;
  const [page, setPage] = useState(1);
  const filtersKey = JSON.stringify(filters);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters, page, perPage],
    queryFn: () => productsApi.getAll(filters, page, perPage),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  return {
    products: data?.data ?? [],
    total: data?.pagination?.total ?? 0,
    page,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    error: error ? 'Failed to load products.' : null,
    setPage,
    refetch,
  };
}
