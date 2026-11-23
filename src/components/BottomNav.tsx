'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Heart, ShoppingBag, User } from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';

interface BottomNavProps {
  onOpenProfile?: () => void;
}

export default function BottomNav({ onOpenProfile }: BottomNavProps) {
  const pathname = usePathname();
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();

  // Hide on admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isOrders = pathname?.startsWith('/track') || pathname?.startsWith('/order');
  const isWishlist = pathname?.startsWith('/wishlist');
  const isCart = pathname?.startsWith('/cart') || pathname?.startsWith('/basket');

  const scrollToTopOrHome = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Bottom Floating Navigation Bar"
      className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none safe-bottom"
    >
      <div className="max-w-[340px] sm:max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full border border-[#EFE8E1] px-2.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-1 pointer-events-auto transition-all">
        {/* 1. Home Tab */}
        {isHome ? (
          <div className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-[#F6E9EE] text-[#7A1C3B] transition-all duration-300">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
            </span>
            <span className="font-heading font-medium text-xs sm:text-sm tracking-tight text-[#7A1C3B]">
              Home
            </span>
          </div>
        ) : (
          <Link
            href="/"
            onClick={scrollToTopOrHome}
            aria-label="Home"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors"
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
          </Link>
        )}

        {/* 2. Orders Tab */}
        {isOrders ? (
          <div className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-[#F6E9EE] text-[#7A1C3B] transition-all duration-300">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
            </span>
            <span className="font-heading font-medium text-xs sm:text-sm tracking-tight text-[#7A1C3B]">
              Orders
            </span>
          </div>
        ) : (
          <Link
            href="/track"
            aria-label="Track and view orders"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors"
          >
            <Package className="w-5 h-5 stroke-[1.8]" />
          </Link>
        )}

        {/* 3. Cart Tab */}
        {isCart ? (
          <div className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-[#F6E9EE] text-[#7A1C3B] transition-all duration-300">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs relative">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#1C1917] text-white text-[8px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="font-heading font-medium text-xs sm:text-sm tracking-tight text-[#7A1C3B]">
              Cart
            </span>
          </div>
        ) : (
          <Link
            href="/cart"
            aria-label={`Open shopping cart with ${itemCount} items`}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#7A1C3B] text-white text-[9px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        )}

        {/* 4. Wishlist Tab */}
        {isWishlist ? (
          <div className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-[#F6E9EE] text-[#7A1C3B] transition-all duration-300">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] fill-white" />
            </span>
            <span className="font-heading font-medium text-xs sm:text-sm tracking-tight text-[#7A1C3B]">
              Wishlist
            </span>
          </div>
        ) : (
          <Link
            href="/wishlist"
            aria-label={`View wishlist with ${wishlistCount} items`}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#7A1C3B] text-white text-[9px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
        )}

        {/* 5. Profile Tab */}
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open Profile and Account Menu"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <User className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </nav>
  );
}
