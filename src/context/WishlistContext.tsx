'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface WishlistItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  slug?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  isInWishlist: (id: string | number) => boolean;
  getWishlistCount: () => number;
  toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadInitialWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('ananya_wishlist');
    return saved ? (JSON.parse(saved) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(loadInitialWishlist);

  useEffect(() => {
    try {
      localStorage.setItem('ananya_wishlist', JSON.stringify(wishlist));
    } catch {
      // storage full / unavailable — ignore
    }
  }, [wishlist]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string | number) => {
    setWishlist(prev => prev.filter(i => i.id !== id));
  }, []);

  const isInWishlist = useCallback((id: string | number) => {
    return wishlist.some(i => i.id === id);
  }, [wishlist]);

  const getWishlistCount = useCallback(() => wishlist.length, [wishlist]);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.some(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const value = useMemo(
    () => ({ wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount, toggleWishlist }),
    [wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount, toggleWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
