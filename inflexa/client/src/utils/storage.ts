const TOKEN_KEY = 'inflexa_token';
const CART_KEY = 'inflexa_cart';

export interface CartStorageItem {
  product_id: number;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  quantity: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCartItems(): CartStorageItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartStorageItem[];
  } catch {
    return [];
  }
}

export function setCartItems(items: CartStorageItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}
