export interface IProduct {
  id: number;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  age_range: string;
  subject: string;
  focus_area: string;
  price: number | string;
  currency: string;
  currency_symbol?: string;
  format: 'physical' | 'printable';
  included_items: string[];
  inventory_count: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDTO {
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  subject: string;
  focus_area: string;
  price: number;
  currency?: string;
  format: 'physical' | 'printable';
  included_items: string[];
  inventory_count?: number;
  image_url?: string;
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  subject?: string;
  focus_area?: string;
  price?: number;
  currency?: string;
  format?: 'physical' | 'printable';
  included_items?: string[];
  inventory_count?: number;
  image_url?: string;
}

export interface ProductFilters {
  search?: string;
  age?: number;
  min_age?: number;
  max_age?: number;
  subject?: string;
  focus_area?: string;
  format?: string;
}

export interface DistinctFilters {
  subjects: string[];
  formats: string[];
  age_ranges: { min_age: number; max_age: number }[];
}
