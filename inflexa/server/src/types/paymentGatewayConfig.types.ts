export type PaymentGatewayProvider = 'stripe' | 'paystack';

export interface IPaymentGatewayConfig {
  id: number;
  provider: PaymentGatewayProvider;
  currency: string;
  public_key: string;
  secret_key: string;
  webhook_secret: string;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/** What the admin sends when updating a gateway config */
export interface UpdatePaymentGatewayConfigDTO {
  currency?: string;
  public_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  is_enabled?: boolean;
}

/** Safe version returned to the frontend (keys masked) */
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
  created_at: Date;
  updated_at: Date;
}
