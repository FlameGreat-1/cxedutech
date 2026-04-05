export type ShippingProvider = 'easypost' | 'shipengine' | 'shippo' | 'easyship';

export interface IShippingConfig {
  id: number;
  provider: ShippingProvider;
  api_key: string;
  is_enabled: boolean;
  fallback_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateShippingConfigDTO {
  provider: ShippingProvider;
  api_key?: string;
  is_enabled?: boolean;
  fallback_rate?: number;
}

export interface UpdateShippingConfigDTO {
  api_key?: string;
  is_enabled?: boolean;
  fallback_rate?: number;
}

/** Safe version returned to the frontend (key masked) */
export interface IShippingConfigSafe {
  id: number;
  provider: ShippingProvider;
  has_api_key: boolean;
  masked_api_key?: string;
  is_enabled: boolean;
  fallback_rate: number;
  created_at: Date;
  updated_at: Date;
}
