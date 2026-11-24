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

interface CategoryBannerInfo {
  bgImage: string;
  showcaseImage: string;
  badge: string;
  tagline?: string;
}

const CATEGORY_BANNERS: Record<string, CategoryBannerInfo> = {
  frames: {
    bgImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80',
    badge: '🖼️ Sacred Keepsakes & Nikah Plaques',
    tagline: 'Gold-foiled Nikah celebration frames, custom photo plaques & Quranic calligraphy.',
  },
  bouquets: {
    bgImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=600&q=80',
    badge: '🌻 Everlasting Paper & Satin Blooms',
    tagline: 'Hand-rolled Italian crepe sunflowers, satin roses, and chocolate arrangements that never wilt.',
  },
  'gift-hampers': {
    bgImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    badge: '🎁 Curated Luxury Celebration Boxes',
    tagline: 'Boutique hampers tied with double satin ribbon, wax-sealed card notes & luxury surprises.',
  },
  hampers: {
    bgImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    badge: '🎁 Curated Luxury Celebration Boxes',
    tagline: 'Boutique hampers tied with double satin ribbon, wax-sealed card notes & luxury surprises.',
  },
  'stainless-steel-jewellery': {
    bgImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    badge: '💍 18k Gold Waterproof & Anti-Tarnish',
    tagline: 'Everyday anti-tarnish stainless steel chains, adjustable stone rings, and charm anklets.',
  },
  jewel: {
    bgImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    badge: '💍 18k Gold Waterproof & Anti-Tarnish',
    tagline: 'Everyday anti-tarnish stainless steel chains, adjustable stone rings, and charm anklets.',
  },
  'resin-art': {
    bgImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    badge: '✨ Botanical Resin Preservation',
    tagline: 'High-clarity preserved floral epoxy clocks, ocean trays, and personalized gold-flake keychains.',
  },
  resin: {
    bgImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    badge: '✨ Botanical Resin Preservation',
    tagline: 'High-clarity preserved floral epoxy clocks, ocean trays, and personalized gold-flake keychains.',
  },
  'hair-accessories': {
    bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    badge: '🌸 Handcrafted Hair Ornaments',
    tagline: 'Crochet floral alligator clips, matte banana clutchers, and hibiscus blossom accessories.',
  },
  keychains: {
    bgImage: 'https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    badge: '🔑 Personalised Charm Keychains',
    tagline: 'Arabic calligraphy letters, pressed flower charms, and kawaii keepsake bag trinkets.',
  },
  all: {
    bgImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85',
    showcaseImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    badge: '🌸 Complete Atelier Catalog',
    tagline: 'Every handcrafted bloom, keepsake frame, resin artwork, and waterproof jewellery piece.',
  },
};

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToBasket } = useBasket();

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

      <main className="flex-1 max-w-[1240px] mx-auto px-4 sm:px-6 py-6 w-full">
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8C827A] mb-4 overflow-x-auto">
          <Link href="/" className="hover:text-[#7A1C3B] transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <span className="text-[#D6CCC2]">/</span>
          <Link href="/category/all" className="hover:text-[#7A1C3B] transition-colors">
            Categories
          </Link>
          <span className="text-[#D6CCC2]">/</span>
          <span className="text-[#1C1917] font-semibold truncate max-w-xs">{categoryTitle}</span>
        </nav>

        {/* 2. Horizontal Category Switcher Bar */}
        <div className="mb-6 border-b border-[#EFE8E1] pb-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
            <Link
              href="/category/all"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isAll
                  ? 'bg-[#7A1C3B] text-white shadow-xs'
                  : 'bg-white text-[#6A5B60] hover:text-[#1C1917] border border-[#EFE8E1] hover:border-[#DFD5CB] hover:bg-[#FAF7F2]'
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
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-[#7A1C3B] text-white shadow-xs'
                      : 'bg-white text-[#6A5B60] hover:text-[#1C1917] border border-[#EFE8E1] hover:border-[#DFD5CB] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{c.icon || '✨'}</span>
                  <span>{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Category Hero Banner with Atmospheric Background Image & Showcase Photo */}
        {(() => {
          const categoryKey = slug?.toLowerCase() || 'all';
          const bannerInfo =
            CATEGORY_BANNERS[categoryKey] ||
            CATEGORY_BANNERS[currentCategory?.groupKey?.toLowerCase() || ''] ||
            CATEGORY_BANNERS[currentCategory?.id?.toLowerCase() || ''] ||
            CATEGORY_BANNERS.all;

          return (
            <div className="relative rounded-3xl p-6 sm:p-10 mb-8 shadow-md overflow-hidden min-h-[220px] sm:min-h-[270px] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/20">
              {/* Full-bleed Background Photo: clearly visible behind the category letter/title */}
              <img
                src={bannerInfo.bgImage}
                alt={categoryTitle}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1] transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85';
                }}
              />

              {/* Rich Multi-stop Dark & Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Left Content Column */}
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider shadow-2xs">
                  <span>{bannerInfo.badge}</span>
                  <span className="text-white/60">•</span>
                  <span className="text-white/90 lowercase font-medium">{categoryProducts.length} items available</span>
                </div>

                {/* Big Bold Category Title: 'Frames', 'Bouquets', etc. directly in front of the image */}
                <h1 className="font-heading font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                  {categoryTitle}
                </h1>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-body drop-shadow-sm max-w-lg">
                  {categoryDescription}
                </p>
              </div>

              {/* Right Showcase Photo Preview */}
              <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0">
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300 bg-white">
                  <img
                    src={bannerInfo.showcaseImage}
                    alt={`${categoryTitle} showcase`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = bannerInfo.bgImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                    {categoryTitle}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. Subcategory Pills & Sort Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Subcategory Pills */}
          {subcategories.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubcategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubcategory === 'all'
                    ? 'bg-[#1C1917] text-white'
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubcategory === sub.id
                      ? 'bg-[#1C1917] text-white'
                      : 'bg-white text-[#6A5B60] hover:bg-[#FAF7F2] border border-[#EFE8E1]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8C827A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>Showing all handcrafted pieces</span>
            </div>
          )}

          {/* Search within Category & Sort Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Live Filter Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search in ${categoryTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#EFE8E1] rounded-xl text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#A8A29E] hover:text-[#1C1917]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#EFE8E1] rounded-xl px-3 py-2 text-xs">
              <SlidersHorizontal className="w-3 h-3 text-[#78716C]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#1C1917] text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

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
