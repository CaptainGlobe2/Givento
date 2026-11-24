'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';
import { Category } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/sampleData';
import { db } from '../lib/database';
import ProfileDrawer from './ProfileDrawer';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedGroup?: string;
  onSelectGroup?: (groupKey: string) => void;
  onOpenProfile?: () => void;
}

export default function Navbar({
  searchQuery = '',
  onSearchChange,
  selectedGroup = 'all',
  onSelectGroup,
  onOpenProfile,
}: NavbarProps) {
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Keep local search input synced with prop
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/category/all?q=${encodeURIComponent(localSearch.trim())}`);
    } else if (onSearchChange) {
      onSearchChange(localSearch);
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
      {/* 2. Main Header: Centered Identity matching Reference Image 3 */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE8E1] shadow-2xs">
        <div className="max-w-[1180px] mx-auto px-3 sm:px-6 pt-3 pb-3">
          {/* Top Row: Hamburger on Left, Centered Brand Identity, Actions on Right */}
          <div className="relative flex items-center justify-between min-h-[58px]">
            {/* Left: Clean Hamburger Menu Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open main menu"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] hover:bg-white border border-transparent hover:border-[#EFE8E1] transition-all cursor-pointer"
              >
                <Menu className="w-6 h-6 stroke-[2]" />
              </button>
            </div>

            {/* Center: Clean Givento.in Brand Identity */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-center">
              <Link href="/" className="group inline-flex items-center no-underline">
                <span className="font-heading font-normal text-2xl sm:text-[1.9rem] leading-none text-[#1C1917] tracking-tight group-hover:text-[#7A1C3B] transition-colors">
                  Givento.in
                </span>
              </Link>
            </div>

            {/* Right: Actions (Wishlist & Cart) */}
            <div className="flex items-center gap-1 sm:gap-2 text-[#1C1917]">
              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                aria-label={`View wishlist with ${wishlistCount} items`}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] hover:bg-white border border-transparent hover:border-[#EFE8E1] transition-all cursor-pointer"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#7A1C3B] text-white text-[8px] font-bold flex items-center justify-center tabular-nums">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Icon */}
              <Link
                href="/cart"
                aria-label={`View cart with ${itemCount} items`}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] hover:bg-white border border-transparent hover:border-[#EFE8E1] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#7A1C3B] text-white text-[8px] font-bold flex items-center justify-center tabular-nums">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Underneath Row: Full-width / Centered Pill Search Bar matching Image 3 */}
          <div className="mt-2.5 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <label htmlFor="givento-search" className="sr-only">
                Search bouquets, jewellery, frames &amp; more...
              </label>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 w-4 h-4 text-[#8C827A] pointer-events-none stroke-[2]" />
                <input
                  id="givento-search"
                  type="search"
                  value={localSearch}
                  onChange={handleInputChange}
                  placeholder="Search bouquets, jewellery, frames & more..."
                  autoComplete="off"
                  className="w-full h-11 border border-[#EFE8E1] focus:border-[#7A1C3B] rounded-full bg-white pl-11 pr-11 text-xs sm:text-sm font-body text-[#1C1917] placeholder-[#8C827A] focus:outline-none focus:ring-2 focus:ring-[#7A1C3B]/10 transition-all shadow-2xs"
                />
                {localSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-3.5 p-1 rounded-full text-[#8C827A] hover:text-[#1C1917] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Filter or search"
                    className="absolute right-2 w-8 h-8 rounded-full flex items-center justify-center text-[#8C827A] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Category Quick Links (Desktop & Tablet) */}
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
                  className={`py-1 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'text-[#7a1c3b] border-[#7a1c3b] font-bold'
                      : 'border-transparent text-[#231a1d] hover:text-[#7a1c3b]'
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 3. Slide-out Hamburger Menu Drawer (Mobile & Desktop) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-left duration-300"
            aria-label="Navigation Menu"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#EFE8E1] flex items-center justify-between bg-[#FAF7F2]">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-heading text-2xl text-[#7A1C3B]"
              >
                Givento.in
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
                  <Package className="w-4 h-4 text-[#6a5b60]" />
                  Track Order
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
                <span>Contact &amp; Support</span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EFE8E1] bg-[#FAF7F2]">
              <p className="text-[11px] text-[#78716C] text-center">
                Handcrafted with love in Adirampattinam, Tamil Nadu
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* 4. Profile / Sign In Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
