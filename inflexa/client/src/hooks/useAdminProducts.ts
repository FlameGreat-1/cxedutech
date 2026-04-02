import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as adminProductsApi from '@/api/admin/products.api';
import type { IProduct, CreateProductDTO, UpdateProductDTO } from '@/types/product.types';
import { ADMIN_PRODUCTS_PER_PAGE } from '@/utils/constants';
import { extractErrorMessage } from '@/api/client';

export function useAdminProducts() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => adminProductsApi.getAll(page, ADMIN_PRODUCTS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['product-filters'] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductDTO) => adminProductsApi.create(dto),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: dto }: { id: number; data: UpdateProductDTO }) =>
      adminProductsApi.update(id, dto),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminProductsApi.remove(id),
    onSuccess: invalidate,
  });

  const inventoryMutation = useMutation({
    mutationFn: ({ id, count }: { id: number; count: number }) =>
      adminProductsApi.updateInventory(id, count),
    onSuccess: invalidate,
  });

  const imageMutation = useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      adminProductsApi.uploadImage(id, files),
    onSuccess: invalidate,
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      adminProductsApi.deleteImage(productId, imageId),
    onSuccess: invalidate,
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      adminProductsApi.setPrimaryImage(productId, imageId),
    onSuccess: invalidate,
  });

  return {
    products: (data?.data ?? []) as IProduct[],
    total: data?.pagination?.total ?? 0,
    page,
    totalPages: data?.pagination?.totalPages ?? 0,
    isLoading,
    error: error ? extractErrorMessage(error) : null,
    setPage,
    refetch,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    updateInventory: inventoryMutation.mutateAsync,
    uploadImage: imageMutation.mutateAsync,
    deleteImage: deleteImageMutation.mutateAsync,
    setPrimaryImage: setPrimaryImageMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
