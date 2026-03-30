import { useState, useEffect } from 'react';
import * as productsApi from '@/api/products.api';
import type { IProduct } from '@/types/product.types';

interface UseProductReturn {
  product: IProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: number | null): UseProductReturn {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    productsApi.getById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError('Product not found.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { product, isLoading, error };
}
