'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface CartItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, change: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadInitialCart(): CartItem[] {
  // Always start empty on server AND first client render to match SSR HTML.
  // localStorage is read in an effect after mount (see CartProvider).
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadInitialCart);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount — avoids SSR/client mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ananya_cart');
      if (saved) setCart(JSON.parse(saved) as CartItem[]);
    } catch {
      // corrupted storage — ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('ananya_cart', JSON.stringify(cart));
    } catch {
      // storage full / unavailable — ignore
    }
  }, [cart, hydrated]);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: string | number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, change: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + change;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  }, []);

  const getCartTotal = useCallback(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const getCartCount = useCallback(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
