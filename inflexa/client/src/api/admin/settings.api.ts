import apiClient from '../client';
import type { ApiResponse } from '@/types/api.types';
import type {
  IPaymentGatewayConfigSafe,
  UpdatePaymentGatewayConfigDTO,
  PaymentGatewayProvider,
  IShippingConfigSafe,
  CreateShippingConfigDTO,
  UpdateShippingConfigDTO,
  ShippingProvider,
  ITaxConfigSafe,
  UpdateTaxConfigDTO,
} from '@/types/settings.types';

const BASE = '/admin/settings';

// ── Payment Gateway Configs ─────────────────────────────────────────

export async function getPaymentGateways(): Promise<IPaymentGatewayConfigSafe[]> {
  const res = await apiClient.get<ApiResponse<IPaymentGatewayConfigSafe[]>>(
    `${BASE}/payment-gateways`
  );
  return res.data.data;
}

export async function updatePaymentGateway(
  provider: PaymentGatewayProvider,
  data: UpdatePaymentGatewayConfigDTO
): Promise<IPaymentGatewayConfigSafe> {
  const res = await apiClient.put<ApiResponse<IPaymentGatewayConfigSafe>>(
    `${BASE}/payment-gateways/${provider}`,
    data
  );
  return res.data.data;
}

// ── Shipping Configs ────────────────────────────────────────────────

export async function getShippingConfigs(): Promise<IShippingConfigSafe[]> {
  const res = await apiClient.get<ApiResponse<IShippingConfigSafe[]>>(
    `${BASE}/shipping`
  );
  return res.data.data;
}

export async function createShippingConfig(
  data: CreateShippingConfigDTO
): Promise<IShippingConfigSafe> {
  const res = await apiClient.post<ApiResponse<IShippingConfigSafe>>(
    `${BASE}/shipping`,
    data
  );
  return res.data.data;
}

export async function updateShippingConfig(
  provider: ShippingProvider,
  data: UpdateShippingConfigDTO
): Promise<IShippingConfigSafe> {
  const res = await apiClient.put<ApiResponse<IShippingConfigSafe>>(
    `${BASE}/shipping/${provider}`,
    data
  );
  return res.data.data;
}

export async function deleteShippingConfig(
  provider: ShippingProvider
): Promise<void> {
  await apiClient.delete(`${BASE}/shipping/${provider}`);
}

// ── Tax Configs ─────────────────────────────────────────────────────

export async function getTaxConfigs(): Promise<ITaxConfigSafe[]> {
  const res = await apiClient.get<ApiResponse<ITaxConfigSafe[]>>(
    `${BASE}/tax`
  );
  return res.data.data;
}

export async function updateTaxConfig(
  region: string,
  data: UpdateTaxConfigDTO
): Promise<ITaxConfigSafe> {
  const res = await apiClient.put<ApiResponse<ITaxConfigSafe>>(
    `${BASE}/tax/${region}`,
    data
  );
  return res.data.data;
}
