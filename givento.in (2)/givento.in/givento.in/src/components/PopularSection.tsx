'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/sampleData';
import { db } from '../lib/database';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';
import { CategoryArt } from './PrototypeArt';

interface PopularSectionProps {
  onSelectGroup?: (groupKey: string) => void;
}

export default function PopularSection({ onSelectGroup }: PopularSectionProps) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const { addToBasket } = useBasket();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    db.getProducts().then((prods) => {
      if (active && prods && prods.length > 0) {
        setProducts(prods);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Filter 6-8 popular/bestseller products
  const popularProducts = products
    .filter((p) => p.featured || p.badge === 'Bestseller' || p.badge === 'Popular')
    .slice(0, 8);

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

  return (
    <section id="popular" className="py-8 sm:py-12 border-b border-[#e8dcdc] bg-white">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-baseline mb-6 sm:mb-8">
          <div>
            <h2 className="font-display font-normal text-xl sm:text-2xl md:text-3xl text-[#231a1d] tracking-tight">
              Popular gifts right now
            </h2>
            <p className="text-xs sm:text-sm text-[#6a5b60] mt-1">
              Trending hand-poured crafts, bouquets & bespoke keepsakes
            </p>
          </div>
          <Link
            href="/#shop"
            className="text-xs sm:text-sm font-bold text-[#7a1c3b] hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>See all</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Product Grid (2 columns on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {popularProducts.map((p) => {
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
                {/* Image Container with Floating Wishlist */}
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

                  {/* Badge */}
                  {p.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#7a1c3b] border border-[#e8dcdc] px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs">
                      {p.badge}
                    </span>
                  )}

                  {/* Wishlist Heart Button */}
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
                </div>

                {/* Details */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1">
                  {/* Category / Subtitle */}
                  <span className="text-[11px] text-[#6a5b60] font-medium uppercase tracking-wider line-clamp-1 mb-1">
                    {p.categoryName || 'Boutique Craft'}
                  </span>

                  {/* Product Title */}
                  <Link
                    href={`/product/${p.slug}`}
                    className="font-medium text-xs sm:text-sm text-[#231a1d] group-hover:text-[#7a1c3b] line-clamp-2 leading-snug transition-colors mb-2"
                  >
                    {p.name}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2 text-[#b98a2e]">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#b98a2e] text-[#b98a2e]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-[#6a5b60] tabular-nums">
                      4.9 ({18 + (p.name.length * 3)})
                    </span>
                  </div>

                  {/* Price & Add Button */}
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
                          ? 'bg-[#2c7a54] text-white'
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
      </div>
    </section>
  );
}
