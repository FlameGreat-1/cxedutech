export type ShippingProvider = 'easypost' | 'shippo' | 'shipstation' | 'manual';

export interface IShippingConfig {
  id: number;
  provider: ShippingProvider;
  api_key: string;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
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

/** Safe version returned to the frontend (key masked) */
export interface IShippingConfigSafe {
  id: number;
  provider: ShippingProvider;
  has_api_key: boolean;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
