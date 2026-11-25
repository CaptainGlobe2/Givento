'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  ChevronRight,
  Package,
  SlidersHorizontal,
  HelpCircle,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';
import { Category } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/sampleData';
import { db } from '../lib/database';
import ProfileDrawer from './ProfileDrawer';
import BrandWordmark from './BrandWordmark';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedGroup?: string;
  onSelectGroup?: (groupKey: string) => void;
  onOpenProfile?: () => void;
  showSearch?: boolean;
}

export default function Navbar({
  searchQuery = '',
  onSearchChange,
  selectedGroup = 'all',
  onSelectGroup,
  onOpenProfile,
  showSearch,
}: NavbarProps) {
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  // Only show search bar & quick category links on the Home storefront ('/') unless explicitly passed
  const isHomePage = pathname === '/';
  const shouldShowSearch = showSearch !== undefined ? showSearch : isHomePage;
  const shouldShowCategories = showSearch !== undefined ? showSearch : isHomePage;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [prevSearchProp, setPrevSearchProp] = useState(searchQuery);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (searchQuery !== prevSearchProp) {
    setPrevSearchProp(searchQuery);
    setLocalSearch(searchQuery);
  }

  useEffect(() => {
    let active = true;
    db.getCategories().then((cats) => {
      if (active && cats && cats.length > 0) {
        setCategories(cats);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/category/all?q=${encodeURIComponent(localSearch.trim())}`);
    } else if (onSearchChange) {
      onSearchChange('');
      router.push('/category/all');
    } else {
      router.push('/category/all');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setIsProfileOpen(true);
    }
  };

  const navCategories = categories.filter((c) => c.isActive !== false).slice(0, 7);

  return (
    <>
      {/* 2. Main Header: Signature Givento Boutique Wine Header */}
      <header className="sticky top-0 z-30 bg-[#7A1C3B] text-white border-b border-[#5E132C] shadow-sm transition-all">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
          {/* Top Row: Hamburger on Left, Centered Brand Identity, Actions on Right */}
          <div className="relative flex items-center justify-between h-10 sm:h-12">
            {/* Left: Clean Hamburger Menu Button */}
            <div className="flex items-center">
              <motion.button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open main menu"
                aria-expanded={isMenuOpen}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.86 }}
                animate={
                  isMenuOpen
                    ? { scale: 0.94, backgroundColor: 'rgba(255,255,255,0.18)' }
                    : { scale: 1, backgroundColor: 'rgba(255,255,255,0)' }
                }
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5 stroke-[2]" />
              </motion.button>
            </div>

            {/* Center: Bespoke Givento.in Brand Wordmark */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-center">
              <Link
                href="/"
                aria-label="Givento.in Home"
                className="inline-flex items-center no-underline"
              >
                <BrandWordmark variant="light" size="md" />
              </Link>
            </div>

            {/* Right: Profile Action */}
            <div className="flex items-center text-white">
              <motion.button
                type="button"
                onClick={handleProfileClick}
                aria-label="Open profile and studio account"
                aria-expanded={isProfileOpen}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.86 }}
                animate={
                  isProfileOpen
                    ? { rotate: 12, scale: 0.94, backgroundColor: 'rgba(255,255,255,0.18)' }
                    : { rotate: 0, scale: 1, backgroundColor: 'rgba(255,255,255,0)' }
                }
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <User className="w-5 h-5 stroke-[2]" />
              </motion.button>
            </div>
          </div>

          {/* Underneath Row: Compact, Sleek Search Bar (Only shown on storefront / discovery pages) */}
          {shouldShowSearch && (
            <div className="mt-2 max-w-md sm:max-w-lg mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <label htmlFor="givento-search" className="sr-only">
                  Search bouquets, jewellery, frames &amp; more...
                </label>
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3.5 w-4 h-4 text-[#7A1C3B] pointer-events-none stroke-[2]" />
                  <input
                    id="givento-search"
                    type="search"
                    value={localSearch}
                    onChange={handleInputChange}
                    placeholder="Search bouquets, jewellery, gifts..."
                    autoComplete="off"
                    className="w-full h-10 border border-white/20 focus:border-white/50 rounded-full bg-white pl-10 pr-10 text-xs sm:text-sm font-body text-[#1C1917] placeholder-[#8C827A] focus:outline-none focus:ring-2 focus:ring-white/40 transition-all shadow-xs"
                  />
                  {localSearch ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        if (onSearchChange) onSearchChange('');
                      }}
                      className="absolute right-3 p-1 rounded-full text-[#8C827A] hover:text-[#1C1917] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      aria-label="Filter or search"
                      className="absolute right-2 w-7 h-7 rounded-full flex items-center justify-center text-[#8C827A] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Category Quick Links (Desktop & Tablet - Only shown on storefront / discovery pages) */}
          {shouldShowCategories && (
            <nav
              aria-label="Desktop Categories"
              className="hidden md:flex items-center justify-center gap-6 pt-3 overflow-x-auto scrollbar-none text-xs sm:text-sm font-semibold"
            >
              {navCategories.map((c) => {
                const isSelected = selectedGroup === c.id || selectedGroup === c.groupKey || selectedGroup === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className={`py-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${isSelected
                      ? 'text-white border-white font-bold'
                      : 'border-transparent text-white/80 hover:text-white'
                      }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* 3. Slide-out Hamburger Menu Drawer (Mobile & Desktop) */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360 }}
              className="relative w-[85vw] sm:w-full max-w-xs rounded-r-3xl sm:rounded-none bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
              aria-label="Navigation Menu"
            >
            {/* Header */}
            <div className="p-4 border-b border-[#EFE8E1] flex items-center justify-between bg-[#FAF7F2]">
              <Link
                href="/"
                aria-label="Givento.in Home"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center no-underline"
              >
                <BrandWordmark variant="dark" size="sm" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories List */}
            <div className="p-4 flex-1 space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-[#6a5b60] uppercase px-2 mb-2 block">
                Shop by Category
              </span>

              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold text-[#231a1d] hover:bg-[#FAF7F2] hover:text-[#7A1C3B] transition-colors text-left cursor-pointer"
                >
                  <span>{c.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
                </Link>
              ))}

              <hr className="my-3 border-[#EFE8E1]" />

              <span className="text-[11px] font-bold tracking-wider text-[#6a5b60] uppercase px-2 mb-2 block">
                Studio &amp; Orders
              </span>

              <Link
                href="/track"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#7A1C3B]" />
                  Track Order
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#7A1C3B]" />
                  My Wishlist
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/custom-order"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7A1C3B]" />
                  Custom Bulk Orders
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/delivery"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6a5b60]" />
                  Delivery &amp; Shipping
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/faq"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#6a5b60]" />
                  Help &amp; FAQs
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span>About Givento Studio</span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#6a5b60]" />
                  Contact &amp; Support
                </span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EFE8E1] bg-[#FAF7F2]">
              <p className="text-[11px] text-[#78716C] text-center">
                Handcrafted with love in Adirampattinam, Tamil Nadu
              </p>
            </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Profile / Sign In Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
