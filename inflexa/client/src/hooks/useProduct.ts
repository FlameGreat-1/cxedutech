import { useQuery } from '@tanstack/react-query';
import * as productsApi from '@/api/products.api';
import type { IProduct } from '@/types/product.types';

interface UseProductReturn {
  product: IProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: number | null): UseProductReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: id !== null,
    staleTime: 60_000,
  });

  return {
    product: data ?? null,
    isLoading: id === null ? false : isLoading,
    error: error ? 'Product not found.' : null,
  };
}
