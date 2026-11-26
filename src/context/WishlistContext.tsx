'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const persistWishlist = (next: Product[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('givento_wishlist', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem('givento_wishlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setWishlist(parsed);
          }
        }
      } catch {
        // ignore
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
      persistWishlist(next);
      return next;
    });
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      const next = [...prev, product];
      persistWishlist(next);
      return next;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      persistWishlist(next);
      return next;
    });
  };

  const clearWishlist = () => {
    persistWishlist([]);
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlist: [],
      wishlistCount: 0,
      isInWishlist: () => false,
      toggleWishlist: () => {},
      addToWishlist: () => {},
      removeFromWishlist: () => {},
      clearWishlist: () => {},
    };
  }
  return context;
}
