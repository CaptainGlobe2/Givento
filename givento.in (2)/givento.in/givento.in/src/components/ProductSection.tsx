'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Product, Category } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../data/sampleData';
import { db } from '../lib/database';
import { CategoryArt } from './PrototypeArt';
import { useWishlist } from '../context/WishlistContext';

interface ProductSectionProps {
  selectedGroup: string;
  onSelectGroup: (g: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function ProductSection({
  selectedGroup,
  onSelectGroup,
  searchQuery = '',
  onClearSearch,
}: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Sync with live database and compute real-time sales ranking from db.getOrders()
  useEffect(() => {
    let active = true;
    Promise.all([db.getProducts(), db.getCategories(), db.getOrders()]).then(([prods, cats, orders]) => {
      if (!active) return;
      if (prods && prods.length > 0) setProducts(prods);
      if (cats && cats.length > 0) setCategories(cats);
      if (orders && orders.length > 0) {
        const counts: Record<string, number> = {};
        orders.forEach((o) => {
          if (o.status !== 'Cancelled') {
            o.items?.forEach((it) => {
              const qty = it.quantity || 1;
              if (it.productId) {
                counts[it.productId] = (counts[it.productId] || 0) + qty;
              }
              if (it.productName) {
                const normName = it.productName.trim().toLowerCase();
                counts[normName] = (counts[normName] || 0) + qty;
              }
            });
          }
        });
        setSalesCounts(counts);
      }
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

  // Filter and dynamically rank products by purchase count
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
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

    // Dynamic Sales Ranking: products with highest purchase count appear first
    return list.sort((a, b) => {
      const countA =
        (salesCounts[a.id] || 0) +
        (salesCounts[a.slug] || 0) +
        (salesCounts[a.name.trim().toLowerCase()] || 0);
      const countB =
        (salesCounts[b.id] || 0) +
        (salesCounts[b.slug] || 0) +
        (salesCounts[b.name.trim().toLowerCase()] || 0);

      if (countB !== countA) {
        return countB - countA;
      }
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, categories, selectedGroup, searchQuery, salesCounts]);

  const activeChips = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  const handleHeartClick = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p);
  };

  return (
    <section id="shop" className="py-12 sm:py-16 bg-[#FDFBF7] border-b border-[#EFE8E1]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Header Matching Reference: Pill "MOST LOVED", Title "Best Sellers", Right "VIEW ALL →" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase mb-1.5">
              Most Loved
            </span>
            <h2 className="font-display font-normal text-2xl sm:text-3xl md:text-4xl text-[#1c1917] tracking-tight">
              Best Sellers
            </h2>
          </div>
          <a
            href="#shop"
            onClick={(e) => {
              e.preventDefault();
              onSelectGroup('all');
              if (onClearSearch) onClearSearch();
              const el = document.getElementById('shop');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-semibold tracking-wider text-[#1c1917] hover:text-[#7A1C3B] uppercase inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <span>→</span>
          </a>
        </div>

        {/* Minimalist Category Filter Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 mb-8 scrollbar-none border-b border-[#EFE8E1]">
          <button
            type="button"
            onClick={() => onSelectGroup('all')}
            className={`pb-2 text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              selectedGroup === 'all'
                ? 'border-[#1c1917] text-[#1c1917] font-bold'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            All Pieces
          </button>
          {activeChips.map((c) => {
            const isSelected = selectedGroup === c.id || selectedGroup === c.groupKey;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectGroup(c.id)}
                className={`pb-2 text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                  isSelected
                    ? 'border-[#1c1917] text-[#1c1917] font-bold'
                    : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Product Grid: Clean Cream Cards, Full-Bleed Image, Floating Circular Heart, Name, Price, Amber Stars */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1]">
            <p className="font-display text-lg text-[#1c1917] mb-1">
              No matching pieces found
            </p>
            <p className="text-xs text-[#78716c] mb-4">
              Try choosing another category or clearing your search.
            </p>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="text-xs font-bold text-[#7a1c3b] hover:underline underline-offset-4 cursor-pointer"
              >
                View all items
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {filteredProducts.map((p) => {
              const inWish = isInWishlist(p.id);
              const palette = p.colors || ['#e0a93a', '#7cc4a6', '#e0607e'];
              const hasUploadedPhoto =
                p.images &&
                p.images.length > 0 &&
                (p.images[0].startsWith('http') ||
                  p.images[0].startsWith('/uploads') ||
                  p.images[0].startsWith('data:image') ||
                  (!p.images[0].endsWith('.svg') && p.images[0] !== '/images/sunflower-bouquet.svg'));

              // Review count based on item
              const reviewCount = 28 + ((p.id.charCodeAt(p.id.length - 1) * 3) % 25);

              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group flex flex-col bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] p-3 transition-all duration-300 hover:shadow-md hover:border-[#DFD5CB] cursor-pointer"
                >
                  {/* Square Image Container with Full Image Area and Top-Right Round Heart Badge */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#EFE9DF] mb-3 flex items-center justify-center">
                    {/* Delicate Outline Heart in White Circular Badge (Matching Reference Screenshot) */}
                    <button
                      type="button"
                      onClick={(e) => handleHeartClick(e, p)}
                      aria-label={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                      className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#1c1917] hover:text-[#e0607e] shadow-xs z-10 transition-transform active:scale-125 cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                          inWish
                            ? 'fill-[#e0607e] text-[#e0607e]'
                            : 'stroke-[1.4] text-[#1c1917]'
                        }`}
                      />
                    </button>

                    {/* Image Fills the Full Image Container Cleanly */}
                    {p.images && p.images.length > 0 && p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src =
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full p-3 flex items-center justify-center bg-[#FAF7F2]">
                        <CategoryArt k={p.artCategory || 'bouquet'} colors={palette} />
                      </div>
                    )}
                  </div>

                  {/* Product Title (Clean, Prominent, Matching Reference) */}
                  <h3 className="text-sm sm:text-base font-medium text-[#1c1917] truncate mb-1 group-hover:text-[#7a1c3b] transition-colors">
                    {p.name}
                  </h3>

                  {/* Price */}
                  <div className="text-base sm:text-lg font-bold text-[#1c1917] mb-1.5 tabular-nums">
                    {p.price == null || p.priceType === 'on_request' ? (
                      <span className="text-xs font-normal text-[#78716c]">Price on chat</span>
                    ) : (
                      <>
                        {(p.from || p.priceType === 'from') && (
                          <span className="text-xs text-[#78716c] font-normal mr-1">from</span>
                        )}
                        ₹{p.price.toLocaleString('en-IN')}
                      </>
                    )}
                  </div>

                  {/* 5 Amber/Gold Rating Stars & Review Count (Matching Reference: ★★★★★ (31)) */}
                  <div className="flex items-center gap-1 text-[#C59A34] text-xs font-medium mt-auto">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className="w-3.5 h-3.5 fill-[#C59A34] text-[#C59A34]"
                        />
                      ))}
                    </div>
                    <span className="text-[#78716c] font-normal ml-1 tabular-nums">
                      ({reviewCount})
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
