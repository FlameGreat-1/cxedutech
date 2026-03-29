export interface IProduct {
  id: number;
  title: string;
  description: string;
  age_range: string;
  subject: string;
  focus_area: string;
  price: number;
  currency: string;
  format: 'physical' | 'printable';
  included_items: string[];
  inventory_count: number;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDTO {
  title: string;
  description: string;
  age_range: string;
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
  age_range?: string;
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
  age_range?: string;
  subject?: string;
  focus_area?: string;
  format?: string;
}

export interface PaginatedProducts {
  products: IProduct[];
  total: number;
}
