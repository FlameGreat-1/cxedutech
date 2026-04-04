// ── Payment Gateway Config ─────────────────────────────────────────

export type PaymentGatewayProvider = 'stripe' | 'paystack';

export interface IPaymentGatewayConfigSafe {
  id: number;
  provider: PaymentGatewayProvider;
  currency: string;
  has_public_key: boolean;
  has_secret_key: boolean;
  has_webhook_secret: boolean;
  masked_public_key?: string;
  masked_secret_key?: string;
  masked_webhook_secret?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePaymentGatewayConfigDTO {
  currency?: string;
  public_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  is_enabled?: boolean;
}

// ── Shipping Config ───────────────────────────────────────────────

export type ShippingProvider = 'easypost' | 'shippo' | 'shipstation' | 'manual';

export interface IShippingConfigSafe {
  id: number;
  provider: ShippingProvider;
  has_api_key: boolean;
  masked_api_key?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingConfigDTO {
  provider: ShippingProvider;
  api_key?: string;
  is_enabled?: boolean;
}

export interface UpdateShippingConfigDTO {
  api_key?: string;
  is_enabled?: boolean;
}

// ── Tax Config ────────────────────────────────────────────────────

export interface ITaxConfigSafe {
  id: number;
  region: string;
  tax_label: string;
  tax_rate: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateTaxConfigDTO {
  tax_label?: string;
  tax_rate?: number;
  is_enabled?: boolean;
}
