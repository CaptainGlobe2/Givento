'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, LayoutGrid, Heart, Package, ShoppingBag, type LucideIcon } from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';

interface BottomNavProps {
  onOpenProfile?: () => void;
}

interface NavTabItem {
  id: string;
  href: string;
  label: string;
  ariaLabel: string;
  active: boolean;
  icon: LucideIcon;
  badge: number;
  fillActiveIcon?: boolean;
  showBadgeWhenActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const PILL_SPRING = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 34,
};

export default function BottomNav({ onOpenProfile }: BottomNavProps) {
  const pathname = usePathname();
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();

  void onOpenProfile;

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isCollections = pathname?.startsWith('/category');
  const isWishlist = pathname?.startsWith('/wishlist');
  const isOrders =
    pathname?.startsWith('/track') ||
    pathname?.startsWith('/order') ||
    pathname?.startsWith('/orders');
  const isCart = pathname?.startsWith('/cart') || pathname?.startsWith('/basket');

  const scrollToTopOrHome = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tabs: NavTabItem[] = [
    {
      id: 'home',
      href: '/',
      label: 'Home',
      ariaLabel: 'Home',
      active: Boolean(isHome),
      icon: Home,
      badge: 0,
      onClick: scrollToTopOrHome,
    },
    {
      id: 'shop',
      href: '/category/all',
      label: 'Shop',
      ariaLabel: 'Browse all collections',
      active: Boolean(isCollections),
      icon: LayoutGrid,
      badge: 0,
    },
    {
      id: 'wishlist',
      href: '/wishlist',
      label: 'Wishlist',
      ariaLabel: `View wishlist (${wishlistCount})`,
      active: Boolean(isWishlist),
      icon: Heart,
      badge: wishlistCount,
      fillActiveIcon: true,
    },
    {
      id: 'orders',
      href: '/track',
      label: 'Orders',
      ariaLabel: 'Track and view orders',
      active: Boolean(isOrders),
      icon: Package,
      badge: 0,
    },
    {
      id: 'cart',
      href: '/cart',
      label: 'Cart',
      ariaLabel: `Open shopping cart with ${itemCount} items`,
      active: Boolean(isCart),
      icon: ShoppingBag,
      badge: itemCount,
      showBadgeWhenActive: true,
    },
  ];

  return (
    <nav
      aria-label="Bottom Floating Navigation Bar"
      className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none safe-bottom"
    >
      <div className="max-w-[380px] sm:max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full border border-[#EFE8E1] px-2.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-1 pointer-events-auto transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const showBadge = tab.badge > 0 && (!tab.active || tab.showBadgeWhenActive);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={tab.onClick}
              aria-label={tab.ariaLabel}
              aria-current={tab.active ? 'page' : undefined}
              className="focus:outline-none rounded-full active:scale-95 transition-transform duration-150"
            >
              <motion.div
                layout
                transition={PILL_SPRING}
                whileTap={{ scale: 0.92 }}
                className={`relative inline-flex items-center rounded-full ${
                  tab.active
                    ? 'gap-1.5 pl-1 pr-3 py-1 text-[#7A1C3B]'
                    : 'justify-center w-9 h-9 sm:w-10 sm:h-10 text-[#78716C] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors'
                }`}
              >
                {tab.active && (
                  <motion.span
                    layoutId="bottom-nav-active-pill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-[#F6E9EE]"
                  />
                )}

                <span
                  className={`relative z-10 flex items-center justify-center rounded-full transition-colors duration-200 ${
                    tab.active
                      ? 'w-7 h-7 sm:w-8 sm:h-8 bg-[#7A1C3B] text-white shadow-xs'
                      : 'w-full h-full'
                  }`}
                >
                  <Icon
                    className={`transition-transform duration-200 ${
                      tab.active
                        ? `w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] ${tab.fillActiveIcon ? 'fill-white' : ''}`
                        : 'w-5 h-5 stroke-[1.8]'
                    }`}
                  />
                  {showBadge && (
                    <span
                      className={`absolute rounded-full text-white font-bold flex items-center justify-center tabular-nums shadow-xs ${
                        tab.active
                          ? '-top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-[#1C1917] text-[8px]'
                          : 'top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-[#7A1C3B] text-[9px]'
                      }`}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </span>

                <AnimatePresence initial={false} mode="popLayout">
                  {tab.active && (
                    <motion.span
                      key={`${tab.id}-label`}
                      initial={{ opacity: 0, width: 0, x: -4 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -4 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10 overflow-hidden whitespace-nowrap font-heading font-medium text-xs sm:text-sm tracking-tight text-[#7A1C3B]"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
