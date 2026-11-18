'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Heart, ShoppingBag, User, Sparkles, ChevronRight, Package, HelpCircle, Shield, Store } from 'lucide-react';
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
  const { openBasket, itemCount } = useBasket();
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
      {/* 1. Subtle Announcement Ribbon */}
      <div className="bg-[#5a1230] text-[#f6e9ee] text-[0.78rem] sm:text-[0.82rem] font-medium tracking-wide">
        <div className="max-w-[1180px] mx-auto px-4 py-1.5 flex justify-between items-center gap-4">
          <p className="m-0 truncate">
            ✨ Free handwritten gift note with every keepsake · Handcrafted in Adirampattinam
          </p>
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs">
            <Link href="/custom-order" className="hover:text-[#f8eed6] underline underline-offset-2">
              Custom Orders
            </Link>
            <Link href="/track" className="hover:text-[#f8eed6] underline underline-offset-2">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Etsy-style Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e8dcdc] shadow-xs">
        <div className="max-w-[1180px] mx-auto px-3 sm:px-4 pt-2.5 pb-2 sm:py-3">
          {/* Top Bar: Brand Logo & Actions (Matching Reference Screenshot) */}
          <div className="flex items-center justify-between gap-4 mb-2 sm:mb-2.5">
            {/* Logo */}
            <Link href="/" className="no-underline flex items-center gap-1.5 group">
              <span className="font-display font-normal text-[1.75rem] sm:text-[2.1rem] leading-none text-[#7a1c3b] tracking-[-0.02em] group-hover:text-[#5a1230] transition-colors">
                Givento
              </span>
            </Link>

            {/* Right Side Header Items: Sign In, Currency Flag, Wishlist, Cart */}
            <div className="flex items-center gap-3 sm:gap-5 text-[#231a1d]">
              {/* Sign In button */}
              <button
                type="button"
                onClick={handleProfileClick}
                className="text-xs sm:text-sm font-semibold hover:text-[#7a1c3b] transition-colors cursor-pointer py-1"
              >
                Sign in
              </button>

              {/* Currency / Region Badge */}
              <div
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#faf6f4] border border-[#e8dcdc] text-xs font-semibold text-[#6a5b60]"
                title="Currency: Indian Rupee (INR)"
              >
                <span className="text-sm">🇮🇳</span>
                <span>(₹)</span>
              </div>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                aria-label={`View wishlist with ${wishlistCount} items`}
                className="relative p-1.5 text-[#231a1d] hover:text-[#7a1c3b] transition-colors"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7a1c3b] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Basket / Cart Icon */}
              <button
                type="button"
                onClick={openBasket}
                aria-label={`Open shopping cart with ${itemCount} items`}
                className="relative p-1.5 text-[#231a1d] hover:text-[#7a1c3b] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7a1c3b] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Row: Hamburger Menu + Rounded Search Bar (Matching Reference Screenshot) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open main menu"
              className="p-2 -ml-1 text-[#231a1d] hover:bg-[#faf6f4] rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              <Menu className="w-6 h-6 stroke-[2]" />
            </button>

            {/* Rounded Full Pill Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <label htmlFor="etsy-search" className="sr-only">
                Search for anything
              </label>
              <div className="relative flex items-center w-full">
                <input
                  id="etsy-search"
                  type="search"
                  value={localSearch}
                  onChange={handleInputChange}
                  placeholder="Search for anything"
                  autoComplete="off"
                  className="w-full h-11 sm:h-12 border-[1.5px] border-[#231a1d] rounded-full bg-white pl-4.5 pr-11 text-sm sm:text-base font-body text-[#231a1d] placeholder-[#6a5b60] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20 transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#231a1d] hover:bg-[#faf6f4] transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </form>
          </div>

          {/* Optional Category Navigation Links (Visible on Tablet/Desktop) */}
          <nav
            aria-label="Desktop Categories"
            className="hidden md:flex items-center gap-6 pt-2.5 overflow-x-auto scrollbar-none text-xs sm:text-sm font-semibold"
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
            <Link
              href="/custom-order"
              className="py-1 border-b-2 border-transparent text-[#7a1c3b] font-bold hover:text-[#5a1230] flex items-center gap-1 ml-auto whitespace-nowrap"
            >
              <span>Custom Order</span>
              <span className="text-[10px] bg-[#f8eed6] text-[#7a1c3b] px-1.5 py-0.2 rounded font-bold">Studio</span>
            </Link>
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
            <div className="p-4 border-b border-[#e8dcdc] flex items-center justify-between bg-[#fbf4f0]">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-2xl text-[#7a1c3b]"
              >
                Givento
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#e8dcdc] flex items-center justify-center text-[#231a1d] hover:bg-[#faf6f4] cursor-pointer"
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
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold text-[#231a1d] hover:bg-[#faf6f4] hover:text-[#7a1c3b] transition-colors text-left cursor-pointer"
                >
                  <span>{c.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
                </Link>
              ))}

              <hr className="my-3 border-[#e8dcdc]" />

              <span className="text-[11px] font-bold tracking-wider text-[#6a5b60] uppercase px-2 mb-2 block">
                Special Features
              </span>

              <Link
                href="/custom-order"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-bold text-[#7a1c3b] bg-[#fdf7f4] hover:bg-[#f6e9ee] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b98a2e]" />
                  Custom Handcrafted Orders
                </span>
                <span className="text-[10px] bg-[#f8eed6] text-[#7a1c3b] px-1.5 py-0.5 rounded font-bold">Studio</span>
              </Link>

              <Link
                href="/track"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#faf6f4] transition-colors"
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
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#faf6f4] transition-colors"
              >
                <span>About Givento Studio</span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-[#231a1d] hover:bg-[#faf6f4] transition-colors"
              >
                <span>Contact &amp; Support</span>
                <ChevronRight className="w-4 h-4 text-[#9c8b91]" />
              </Link>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e8dcdc] bg-[#faf6f4]">
              <a
                href="https://wa.me/919344013255?text=Hi%20Givento!%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-[#2c7a54] text-white py-2 px-4 rounded-lg font-bold text-xs hover:bg-[#236344] transition-colors"
              >
                Chat on WhatsApp
              </a>
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
