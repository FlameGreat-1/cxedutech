const TOKEN_KEY = 'inflexa_token';
const ADMIN_TOKEN_KEY = 'inflexa_admin_token';
const CART_KEY = 'inflexa_cart';

export interface CartStorageItem {
  product_id: number;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  quantity: number;
  format?: string;
  subject?: string;
  age_range?: string;
}

// ── Token helpers ──────────────────────────────────────────────
// Admin tokens live in sessionStorage (cleared on tab/browser close).
// Regular user tokens live in localStorage (persist across sessions).

export function getToken(): string | null {
  // Admin session takes priority if present
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function isAdminSession(): boolean {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) !== null;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

// ── Cart helpers ───────────────────────────────────────────────

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
