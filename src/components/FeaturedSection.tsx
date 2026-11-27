'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Star, ShoppingBag, Check, ArrowRight, Wand2 } from 'lucide-react';
import { Product, Category } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../data/sampleData';
import { db } from '../lib/database';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';
import { CategoryArt } from './PrototypeArt';

interface FeaturedSectionProps {
  selectedGroup: string;
  onSelectGroup: (g: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function FeaturedSection({
  selectedGroup,
  onSelectGroup,
  searchQuery = '',
  onClearSearch,
}: FeaturedSectionProps) {
  const { addToBasket } = useBasket();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [sortBy, setSortBy] = useState<'featured' | 'asc' | 'desc'>('featured');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

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

  const getCategoryForProduct = (p: Product): Category | undefined => {
    return categories.find(
      (c) => c.id === p.categoryId || c.slug === p.categoryId || c.id === p.realmId
    );
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const cat = getCategoryForProduct(p);
      const matchesCategory =
        selectedGroup === 'all' ||
        p.categoryId === selectedGroup ||
        p.realmId === selectedGroup ||
        cat?.groupKey === selectedGroup ||
        cat?.slug === selectedGroup;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        (p.categoryName || cat?.name || '').toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    if (sortBy !== 'featured') {
      list = [...list].sort((a, b) => {
        const x = a.price == null ? Infinity : a.price;
        const y = b.price == null ? Infinity : b.price;
        if (x === y) return 0;
        if (x === Infinity) return 1;
        if (y === Infinity) return -1;
        return sortBy === 'asc' ? x - y : y - x;
      });
    }

    return list;
  }, [products, categories, selectedGroup, searchQuery, sortBy]);

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToBasket(p, 1);
    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1200);
  };

  const handleWishlistToggle = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p);
  };

  const activeChips = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  return (
    <section id="shop" className="py-10 sm:py-14 border-b border-[#e8dcdc] bg-white">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Curated Recommendations Spotlight Cards */}
        {!searchQuery && selectedGroup === 'all' && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span className="text-xs font-bold tracking-wider text-[#7a1c3b] uppercase">
                Featured Recommendations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Spotlight 1: Bouquet Builder */}
              <div className="bg-[#faf6f4] border border-[#e8dcdc] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="inline-block bg-[#fbf3e4] text-[#7a1c3b] text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
                    Bespoke Craft
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#231a1d] mb-2 leading-snug">
                    Custom Handcrafted Bouquets
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6a5b60] leading-relaxed mb-4">
                    Request custom stems, personalized gift boxes, lace ribbons, and photo keepsakes directly with our artisans.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGroup('bouquets')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7a1c3b] hover:text-[#5a1230] group text-left cursor-pointer"
                >
                  <span>Explore Custom Bouquets</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Spotlight 2: Nikah Frames */}
              <div className="bg-[#faf6f4] border border-[#e8dcdc] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="inline-block bg-[#f6e9ee] text-[#7a1c3b] text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
                    Personalised Keepsake
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#231a1d] mb-2 leading-snug">
                    Nikah & Celebration Frames
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6a5b60] leading-relaxed mb-4">
                    Hand-foiled Arabic calligraphy, couples’ names, Islamic calendar dates and Quranic verses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGroup('frames')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7a1c3b] hover:text-[#5a1230] group text-left cursor-pointer"
                >
                  <span>Explore Frames & Plaques</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Spotlight 3: Curated Hampers */}
              <div className="bg-[#faf6f4] border border-[#e8dcdc] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="inline-block bg-[#FDF0F3] text-[#7A1C3B] text-[11px] font-bold px-2 py-0.5 rounded-full mb-3">
                    Curated Hampers
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#231a1d] mb-2 leading-snug">
                    Luxury Gift Boxes
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6a5b60] leading-relaxed mb-4">
                    Thoughtfully assembled with perfumes, anti-tarnish bracelets, chocolates and blind date books.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGroup('gift-hampers')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7a1c3b] hover:text-[#5a1230] group text-left cursor-pointer"
                >
                  <span>View Curated Hampers</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading & Category Filter Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-normal text-xl sm:text-2xl md:text-3xl text-[#231a1d] tracking-tight">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All handcrafted creations'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6a5b60] mt-1">
              {filteredProducts.length} unique keepsake{filteredProducts.length === 1 ? '' : 's'} available to order on WhatsApp
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs sm:text-sm text-[#6a5b60]">
            <label htmlFor="shop-sort" className="font-semibold cursor-pointer">
              Sort:
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'asc' | 'desc')}
              className="h-9 border border-[#e8dcdc] rounded-lg px-2.5 bg-white text-[#231a1d] text-xs sm:text-sm focus:border-[#7a1c3b] focus:outline-none"
            >
              <option value="featured">Featured Picks</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills/Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none" role="group" aria-label="Filter category">
          <button
            type="button"
            onClick={() => onSelectGroup('all')}
            className={`border rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedGroup === 'all'
                ? 'bg-[#7a1c3b] border-[#7a1c3b] text-white shadow-xs'
                : 'bg-white border-[#e8dcdc] text-[#231a1d] hover:border-[#7a1c3b]'
            }`}
          >
            All Items
          </button>
          {activeChips.map((c) => {
            const isSelected = selectedGroup === c.id || selectedGroup === c.groupKey;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectGroup(c.id)}
                className={`border rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#7a1c3b] border-[#7a1c3b] text-white shadow-xs'
                    : 'bg-white border-[#e8dcdc] text-[#231a1d] hover:border-[#7a1c3b]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Empty Search Result */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#faf6f4] rounded-2xl border border-[#e8dcdc]">
            <p className="font-display text-xl text-[#231a1d] mb-2">No matching gifts found</p>
            <p className="text-sm text-[#6a5b60] max-w-md mx-auto mb-5">
              We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Custom pieces can always be crafted upon request!
            </p>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="bg-[#7a1c3b] text-white font-bold text-xs sm:text-sm py-2 px-5 rounded-lg hover:bg-[#5a1230] transition-colors cursor-pointer"
              >
                Clear Search &amp; View All
              </button>
            )}
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((p) => {
              const inWish = isInWishlist(p.id);
              const isAdded = !!addedIds[p.id];
              const hasPhoto =
                p.images &&
                p.images.length > 0 &&
                (p.images[0].startsWith('http') ||
                  p.images[0].startsWith('data:image') ||
                  (!p.images[0].endsWith('.svg') && p.images[0] !== '/images/sunflower-bouquet.svg'));

              return (
                <article
                  key={p.id}
                  className="group flex flex-col bg-white rounded-xl border border-[#ece4e0] hover:border-[#d9c4bc] hover:shadow-[0_8px_24px_rgba(35,26,29,0.08)] transition-all duration-200 overflow-hidden relative"
                >
                  {/* Square Image Box */}
                  <div className="relative aspect-square w-full bg-[#faf7f5] overflow-hidden">
                    <Link href={`/product/${p.slug}`} className="block w-full h-full">
                      {hasPhoto ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-300">
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain drop-shadow-sm"
                            />
                          ) : (
                            <CategoryArt k={p.artCategory || 'bouquet'} colors={p.colors} />
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, p)}
                      aria-label={inWish ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#e8dcdc] flex items-center justify-center text-[#231a1d] hover:text-[#7a1c3b] hover:bg-white shadow-xs transition-transform active:scale-90 cursor-pointer z-10"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          inWish ? 'fill-[#e0607e] text-[#e0607e]' : 'stroke-[1.8]'
                        }`}
                      />
                    </button>

                    {/* Personalisation tag */}
                    {p.isPersonalised && (
                      <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#7a1c3b] border border-[#e8dcdc] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                        Customise
                      </span>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1">
                    <span className="text-[11px] text-[#6a5b60] font-medium uppercase tracking-wider line-clamp-1 mb-1">
                      {p.categoryName || 'Boutique Craft'}
                    </span>

                    <Link
                      href={`/product/${p.slug}`}
                      className="font-medium text-xs sm:text-sm text-[#231a1d] group-hover:text-[#7a1c3b] line-clamp-2 leading-snug transition-colors mb-2"
                    >
                      {p.name}
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2 text-[#c5a059]">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#c5a059] text-[#c5a059]" />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-[#6a5b60] tabular-nums">
                        4.9
                      </span>
                    </div>

                    {/* Price and Add button */}
                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#f0e6e2]">
                      <div className="font-extrabold text-sm sm:text-base text-[#231a1d] tabular-nums">
                        {p.price == null || p.priceType === 'on_request' ? (
                          <span className="text-xs font-semibold text-[#6a5b60]">Price on chat</span>
                        ) : (
                          <>
                            {(p.from || p.priceType === 'from') && (
                              <span className="text-[10px] text-[#6a5b60] font-normal mr-1">from</span>
                            )}
                            ₹{p.price.toLocaleString('en-IN')}
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAdd(e, p)}
                        aria-label={`Add ${p.name} to bag`}
                        className={`h-8 px-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#7a1c3b] text-white'
                            : 'bg-[#faf6f4] text-[#7a1c3b] border border-[#e8dcdc] hover:bg-[#7a1c3b] hover:text-white hover:border-[#7a1c3b]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
