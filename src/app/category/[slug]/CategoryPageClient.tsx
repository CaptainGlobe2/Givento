'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Heart,
  Star,
  ShoppingBag,
  ArrowLeft,
  SlidersHorizontal,
  Search,
  MessageCircle,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Product, Category } from '../../../types';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../../../data/sampleData';
import { db } from '../../../lib/database';
import { useWishlist } from '../../../context/WishlistContext';
import { useBasket } from '../../../context/BasketContext';

interface CategoryPageClientProps {
  slug: string;
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToBasket } = useBasket();

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // Sync with live DB products and categories
  useEffect(() => {
    let active = true;
    Promise.all([db.getProducts(), db.getCategories()]).then(([prods, cats]) => {
      if (!active) return;
      if (prods && prods.length > 0) setProducts(prods);
      if (cats && cats.length > 0) setCategories(cats);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync search query from URL parameter if it changes
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Active categories list
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  // Identify current category
  const isAll = slug === 'all' || !slug;
  const currentCategory = useMemo(() => {
    if (isAll) return null;
    return (
      categories.find(
        (c) =>
          c.slug.toLowerCase() === slug.toLowerCase() ||
          c.id.toLowerCase() === slug.toLowerCase() ||
          c.groupKey?.toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }, [categories, slug, isAll]);

  // Category title & description
  const categoryTitle = isAll
    ? 'All Handcrafted Collections'
    : currentCategory?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const categoryDescription = isAll
    ? 'Explore every handcrafted bloom, anti-tarnish jewellery piece, custom hamper, and resin keepsake made with love in Adirampattinam.'
    : currentCategory?.description ||
      `Browse our handcrafted ${categoryTitle.toLowerCase()} collection made with care and personal attention.`;

  // Find subcategories belonging to this category
  const subcategories = useMemo(() => {
    if (isAll || !currentCategory) return [];
    const subMap = new Map<string, string>();
    products.forEach((p) => {
      const match =
        p.categoryId === currentCategory.id ||
        p.categoryId === currentCategory.slug ||
        p.realmId === currentCategory.id ||
        p.realmId === currentCategory.slug;
      if (match && p.subcategoryId && p.subcategoryName) {
        subMap.set(p.subcategoryId, p.subcategoryName);
      }
    });
    return Array.from(subMap.entries()).map(([id, name]) => ({ id, name }));
  }, [products, currentCategory, isAll]);

  // Filter products for this category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category match
      if (!isAll && currentCategory) {
        const matchesCat =
          p.categoryId === currentCategory.id ||
          p.categoryId === currentCategory.slug ||
          p.realmId === currentCategory.id ||
          p.realmId === currentCategory.slug ||
          p.categoryName?.toLowerCase() === currentCategory.name.toLowerCase() ||
          (currentCategory.groupKey && p.realmId === currentCategory.groupKey);

        if (!matchesCat) return false;
      }

      // 2. Subcategory match
      if (selectedSubcategory !== 'all') {
        if (p.subcategoryId !== selectedSubcategory) return false;
      }

      // 3. Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.name.toLowerCase().includes(query);
        const matchesDesc = p.shortDescription?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query);
        const matchesSubcat = p.subcategoryName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesSubcat) return false;
      }

      return true;
    });
  }, [products, isAll, currentCategory, selectedSubcategory, searchQuery]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    const list = [...categoryProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.price ?? a.priceFrom ?? 0) - (b.price ?? b.priceFrom ?? 0));
      case 'price-desc':
        return list.sort((a, b) => (b.price ?? b.priceFrom ?? 0) - (a.price ?? a.priceFrom ?? 0));
      case 'rating':
        return list.sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
      case 'featured':
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [categoryProducts, sortBy]);

  // Quick 1-tap add to cart handler
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToBasket(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((prev) => (prev === product.id ? null : prev));
    }, 1600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-[1240px] mx-auto px-3.5 sm:px-6 py-3 sm:py-5 w-full">
        {/* 1. Category Switcher Bar (Smooth Horizontal Scrollable Strip) */}
        <div className="mb-3.5 overflow-x-auto scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max pb-1">
            <Link
              href="/category/all"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isAll
                  ? 'bg-[#7A1C3B] text-white shadow-xs'
                  : 'bg-white text-[#6A5B60] hover:text-[#1C1917] border border-[#EFE8E1] hover:bg-[#FAF7F2]'
              }`}
            >
              All Pieces
            </Link>

            {activeCategories.map((c) => {
              const active = !isAll && (c.slug === slug || c.id === slug || c.groupKey === slug);
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#7A1C3B] text-white shadow-xs'
                      : 'bg-white text-[#6A5B60] hover:text-[#1C1917] border border-[#EFE8E1] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{c.icon || '✨'}</span>
                  <span>{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2. Unified Toolbar: Title & Count on Left, Search & Sort on Right */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-2.5 border-b border-[#EFE8E1]">
          {/* Title & Count */}
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="font-heading font-medium text-xl sm:text-2xl text-[#1C1917] tracking-tight truncate">
              {categoryTitle}
            </h1>
            <span className="text-xs font-medium text-[#8C827A] shrink-0">
              ({sortedProducts.length})
            </span>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input - Sleek Pill */}
            <div className="relative w-36 sm:w-48">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-7.5 pr-6 bg-white border border-[#E4DAD0] rounded-full text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] focus:ring-1 focus:ring-[#7A1C3B]/20 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#A8A29E] hover:text-[#1C1917]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Awesome Custom Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-label="Sort options"
                aria-expanded={isSortOpen}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 shadow-2xs ${
                  isSortOpen
                    ? 'bg-[#7A1C3B] text-white border border-[#7A1C3B] shadow-xs'
                    : 'bg-white text-[#1C1917] hover:text-[#7A1C3B] hover:bg-[#FAF7F2] border border-[#E4DAD0]'
                }`}
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 ${isSortOpen ? 'text-white' : 'text-[#7A1C3B]'}`} />
                <span className="whitespace-nowrap font-medium text-xs">
                  {sortBy === 'featured' && 'Featured'}
                  {sortBy === 'price-asc' && 'Price: Low to High'}
                  {sortBy === 'price-desc' && 'Price: High to Low'}
                  {sortBy === 'rating' && 'Top Rated'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isSortOpen ? 'rotate-180 text-white' : 'text-[#8C827A]'
                  }`}
                />
              </button>

              {/* Floating Menu */}
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EFE8E1] py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C827A] border-b border-[#F5EFE8] mb-1">
                    Sort Collection
                  </div>
                  {[
                    { id: 'featured', label: 'Featured' },
                    { id: 'price-asc', label: 'Price: Low to High' },
                    { id: 'price-desc', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Top Rated' },
                  ].map((option) => {
                    const isSelected = sortBy === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSortBy(option.id as any);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF7F2] text-[#7A1C3B] font-semibold'
                            : 'text-[#1C1917] hover:bg-[#FAF7F2] hover:text-[#7A1C3B]'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#7A1C3B]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Subcategory Pills (Only displayed when current category has subcategories) */}
        {subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white text-[#6A5B60] hover:bg-[#FAF7F2] border border-[#EFE8E1]'
              }`}
            >
              All {categoryTitle}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubcategory === sub.id
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-white text-[#6A5B60] hover:bg-[#FAF7F2] border border-[#EFE8E1]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* 5. Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-[#EFE8E1] my-4 shadow-xs">
            <div className="text-4xl mb-3">🧺</div>
            <h3 className="font-display font-normal text-2xl text-[#1C1917] mb-1.5">No matching pieces found</h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto mb-5 leading-relaxed">
              We couldn&apos;t find any handcrafted items matching your search or filters in this category.
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-[#7A1C3B] text-white rounded-xl text-xs font-bold hover:bg-[#5a1230] transition-colors"
                >
                  Clear Search
                </button>
              )}
              <Link
                href="/category/all"
                className="px-5 py-2.5 border border-[#EFE8E1] bg-white text-[#1C1917] rounded-xl text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
              >
                View All Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-12">
            {sortedProducts.map((p) => {
              const inWish = isInWishlist(p.id);
              const isAdded = addedProductId === p.id;
              const hasPrice = p.price !== undefined && p.price !== null;
              const priceDisplay = hasPrice
                ? `₹${p.price}`
                : p.priceFrom
                ? `from ₹${p.priceFrom}`
                : 'Price on chat';

              const mainImage = p.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-[#EFE8E1] overflow-hidden hover:border-[#DFD5CB] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Floating Action Badges */}
                    <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-[#FAF7F2] overflow-hidden">
                      <img
                        src={mainImage}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1C1917]/80 backdrop-blur-xs text-white text-[9px] font-bold tracking-wider uppercase">
                            {p.badge}
                          </span>
                        )}
                        {p.inStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#FBF3E4] text-[#855D10] border border-[#E9DFD0] text-[9px] font-bold">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#F6E9EE] text-[#7A1C3B] border border-[#FADDE3] text-[9px] font-bold">
                            Made to Order
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(p);
                        }}
                        aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
                          inWish
                            ? 'bg-[#7A1C3B] text-white shadow-xs scale-105'
                            : 'bg-white/95 text-[#78716C] hover:text-[#7A1C3B] hover:bg-white shadow-2xs'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWish ? 'fill-white stroke-white' : ''}`} />
                      </button>
                    </Link>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-4">
                      {/* Subcategory / Realm tag */}
                      <div className="text-[10px] text-[#8C827A] uppercase font-semibold tracking-wider mb-1 truncate">
                        {p.subcategoryName || p.categoryName || currentCategory?.name || 'Handcrafted'}
                      </div>

                      {/* Product Name */}
                      <Link href={`/product/${p.slug}`}>
                        <h3 className="font-sans font-semibold text-xs sm:text-sm text-[#1C1917] group-hover:text-[#7A1C3B] transition-colors line-clamp-1 mb-1">
                          {p.name}
                        </h3>
                      </Link>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                i < Math.floor(p.rating || 5) ? 'fill-amber-400 stroke-amber-400' : 'stroke-amber-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#78716C] tabular-nums">
                          ({p.reviewCount || 24})
                        </span>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans font-bold text-sm sm:text-base text-[#1C1917] tabular-nums">
                          {priceDisplay}
                        </span>
                        {p.originalPrice && (
                          <span className="text-[11px] text-[#A8A29E] line-through tabular-nums">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3.5 sm:p-4 pt-0">
                    {/* 1-Tap Add to Bag */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(p, e)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-[#7A1C3B] text-white shadow-2xs'
                          : 'bg-[#7A1C3B] hover:bg-[#5a1230] text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
