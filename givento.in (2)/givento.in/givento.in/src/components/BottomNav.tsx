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
      aria-label="Bottom Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE8E1] py-1.5 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          onClick={scrollToTopOrHome}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? 'text-[#7a1c3b] font-bold' : 'text-[#6a5b60] hover:text-[#231a1d]'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </Link>

        {/* 2. Orders */}
        <Link
          href="/track"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isOrders ? 'text-[#7a1c3b] font-bold' : 'text-[#6a5b60] hover:text-[#231a1d]'
          }`}
        >
          <Package className={`w-5 h-5 ${isOrders ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Orders</span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            isWishlist ? 'text-[#7a1c3b] font-bold' : 'text-[#6a5b60] hover:text-[#231a1d]'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlist ? 'stroke-[2.4] fill-[#7a1c3b]' : 'stroke-[1.8]'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#7a1c3b] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Wishlist</span>
        </Link>

        {/* 4. Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            isCart ? 'text-[#7a1c3b] font-bold' : 'text-[#6a5b60] hover:text-[#231a1d]'
          }`}
          aria-label={`Open shopping cart with ${itemCount} items`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isCart ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#7a1c3b] text-white text-[9px] font-bold flex items-center justify-center tabular-nums animate-pulse">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Cart</span>
        </Link>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1 text-[#6a5b60] hover:text-[#7a1c3b] transition-colors cursor-pointer"
          aria-label="Open Profile and Account Menu"
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
