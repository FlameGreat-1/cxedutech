// ── Payment Gateway Config ─────────────────────────────────────────

export type PaymentGatewayProvider = 'stripe' | 'paystack';

export interface IPaymentGatewayConfigSafe {
  id: number;
  provider: PaymentGatewayProvider;
  currency: string;
  has_secret_key: boolean;
  has_webhook_secret: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePaymentGatewayConfigDTO {
  currency?: string;
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
