export interface ITaxConfig {
  id: number;
  region: string;
  tax_label: string;
  tax_rate: number;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateTaxConfigDTO {
  tax_label?: string;
  tax_rate?: number;
  is_enabled?: boolean;
}

/** Safe version returned to the frontend */
export interface ITaxConfigSafe {
  id: number;
  region: string;
  tax_label: string;
  tax_rate: number;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
