import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '@/api/admin/settings.api';
import type {
  PaymentGatewayProvider,
  UpdatePaymentGatewayConfigDTO,
  ShippingProvider,
  CreateShippingConfigDTO,
  UpdateShippingConfigDTO,
} from '@/types/settings.types';
import { extractErrorMessage } from '@/api/client';

export function useAdminSettings() {
  const queryClient = useQueryClient();

  // ── Payment Gateway Configs ───────────────────────────────────────

  const gatewayQuery = useQuery({
    queryKey: ['admin', 'settings', 'payment-gateways'],
    queryFn: settingsApi.getPaymentGateways,
    staleTime: 30_000,
  });

  const updateGatewayMutation = useMutation({
    mutationFn: ({ provider, data }: { provider: PaymentGatewayProvider; data: UpdatePaymentGatewayConfigDTO }) =>
      settingsApi.updatePaymentGateway(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'payment-gateways'] });
    },
  });

  // ── Shipping Configs ─────────────────────────────────────────────

  const shippingQuery = useQuery({
    queryKey: ['admin', 'settings', 'shipping'],
    queryFn: settingsApi.getShippingConfigs,
    staleTime: 30_000,
  });

  const createShippingMutation = useMutation({
    mutationFn: (data: CreateShippingConfigDTO) =>
      settingsApi.createShippingConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'shipping'] });
    },
  });

  const updateShippingMutation = useMutation({
    mutationFn: ({ provider, data }: { provider: ShippingProvider; data: UpdateShippingConfigDTO }) =>
      settingsApi.updateShippingConfig(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'shipping'] });
    },
  });

  const deleteShippingMutation = useMutation({
    mutationFn: (provider: ShippingProvider) =>
      settingsApi.deleteShippingConfig(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'shipping'] });
    },
  });

  return {
    // Payment Gateways
    gateways: gatewayQuery.data ?? [],
    gatewaysLoading: gatewayQuery.isLoading,
    gatewaysError: gatewayQuery.error ? extractErrorMessage(gatewayQuery.error) : null,
    refetchGateways: gatewayQuery.refetch,
    updateGateway: updateGatewayMutation.mutateAsync,
    isUpdatingGateway: updateGatewayMutation.isPending,

    // Shipping
    shippingConfigs: shippingQuery.data ?? [],
    shippingLoading: shippingQuery.isLoading,
    shippingError: shippingQuery.error ? extractErrorMessage(shippingQuery.error) : null,
    refetchShipping: shippingQuery.refetch,
    createShipping: createShippingMutation.mutateAsync,
    updateShipping: updateShippingMutation.mutateAsync,
    deleteShipping: deleteShippingMutation.mutateAsync,
    isCreatingShipping: createShippingMutation.isPending,
    isUpdatingShipping: updateShippingMutation.isPending,
    isDeletingShipping: deleteShippingMutation.isPending,
  };
}
