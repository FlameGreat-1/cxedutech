export interface IProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
}

export interface IProduct {
  id: number;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  age_range: string;
  subject: string;
  focus_area: string;
  price: number;
  currency: string;
  format: 'physical' | 'printable';
  included_items: string[];
  inventory_count: number;
  image_url: string | null;
  images: IProductImage[];
  created_at: Date;
  updated_at: Date;
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

export interface PaginatedProducts {
  products: IProduct[];
  total: number;
}
