'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/sampleData';
import { db } from '../lib/database';
import { useBasket } from '../context/BasketContext';

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addToBasket } = useBasket();

  // Load products from live database
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

  // Quick 1-tap add to bag
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addToBasket(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1400);
  };

  // Scroll carousel left/right on desktop
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-4 pb-10 sm:pb-14 bg-white border-b border-[#EFE8E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header: "New Arrivals" on Left, "See all" on Right (Matching Reference Screenshot) */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] font-sans">
            New Arrivals
          </h2>

          <div className="flex items-center gap-3">
            <Link
              href="/category/all"
              className="text-xs sm:text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors font-sans"
            >
              See all
            </Link>

            {/* Desktop Carousel Arrow Controls */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full border border-[#E7E5E4] hover:bg-[#FAF7F2] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full border border-[#E7E5E4] hover:bg-[#FAF7F2] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Carousel (Portrait Cards Matching User Reference Screenshot) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {products.map((p) => {
            const isAdded = !!addedIds[p.id];
            const priceDisplay =
              typeof p.price === 'number'
                ? `${p.from ? 'from ' : ''}₹${p.price.toLocaleString('en-IN')}`
                : typeof p.priceFrom === 'number'
                ? `from ₹${p.priceFrom.toLocaleString('en-IN')}`
                : 'Price on chat';

            const mainImage =
              p.images?.[0] ||
              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={p.id}
                className="group flex flex-col w-[155px] sm:w-[195px] md:w-[220px] shrink-0 snap-start select-none"
              >
                {/* Image Card Container with Rounded Corners & Floating "+" Button */}
                <div className="relative aspect-[3/3.8] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F5F2EB] shadow-2xs">
                  <Link href={`/product/${p.slug}`} className="block w-full h-full">
                    <img
                      src={mainImage}
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
                  </Link>

                  {/* Floating Quick Add "+" Button (Top-Right as in Reference Screenshot) */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, p)}
                    aria-label={isAdded ? 'Added to bag' : `Add ${p.name} to bag`}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-xs transition-all active:scale-90 z-10 cursor-pointer ${
                      isAdded
                        ? 'bg-[#7A1C3B] text-white scale-105'
                        : 'bg-white/95 backdrop-blur-xs text-[#1C1917] hover:bg-[#1C1917] hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <Check className="w-4 h-4 stroke-[2.8]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>

                {/* Below Card: Title & Price (Matching Reference Font Hierarchy) */}
                <Link href={`/product/${p.slug}`} className="block group mt-2.5">
                  <h3 className="font-medium text-xs sm:text-sm text-[#57534E] truncate leading-snug group-hover:text-[#7A1C3B] transition-colors">
                    {p.name}
                  </h3>
                  <div className="font-bold text-xs sm:text-sm text-[#1C1917] mt-0.5 tabular-nums">
                    {priceDisplay}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
