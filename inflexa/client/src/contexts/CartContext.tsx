import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getCartItems, setCartItems, clearCart as clearCartStorage, type CartStorageItem } from '@/utils/storage';

export interface CartItem extends CartStorageItem {}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  currency: string;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());

  useEffect(() => {
    setCartItems(items);
    if (items.length === 0) {
      sessionStorage.removeItem('inflexa_checkout_order');
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCartFn = useCallback(() => {
    setItems([]);
    clearCartStorage();
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items.length > 0 ? items[0].currency : 'GBP';

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        currency,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartFn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
