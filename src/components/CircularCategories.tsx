'use client';

import React from 'react';
import Link from 'next/link';

export interface CircularCategoryItem {
  id: string;
  name: string;
  subtext?: string;
  image: string;
  fallbackSvg?: string;
  groupKey: string;
}

interface CircularCategoriesProps {
  selectedGroup: string;
  onSelectGroup: (groupKey: string) => void;
  headline?: string;
}

export const CIRCULAR_CATEGORIES: CircularCategoryItem[] = [
  {
    id: 'frames',
    name: 'Frames',
    subtext: 'Frames & Plaques',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/nikah-frame.svg',
    groupKey: 'frames',
  },
  {
    id: 'bouquets',
    name: 'Bouquets',
    subtext: 'Sunflowers & Roses',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/sunflower-bouquet.svg',
    groupKey: 'bouquets',
  },
  {
    id: 'gift-hampers',
    name: 'Hampers',
    subtext: 'Curated Boxes',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/gift-for-her.svg',
    groupKey: 'gift-hampers',
  },
  {
    id: 'stainless-steel-jewellery',
    name: 'Jewellery',
    subtext: 'Anti-tarnish',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/starlight-chain.svg',
    groupKey: 'stainless-steel-jewellery',
  },
  {
    id: 'resin-art',
    name: 'Resin Art',
    subtext: 'Clocks & Keepsakes',
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/resin-clock.svg',
    groupKey: 'resin-art',
  },
  {
    id: 'hair-accessories',
    name: 'Hair Clips',
    subtext: 'Crochet Accessories',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/crochet-clips.svg',
    groupKey: 'hair-accessories',
  },
];

export default function CircularCategories({
  selectedGroup,
  onSelectGroup,
  headline,
}: CircularCategoriesProps) {
  return (
    <section className="bg-white pt-5 pb-3 sm:pt-7 sm:pb-4 border-b border-[#EFE8E1]/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {headline && (
          <h2 className="font-display font-normal text-xl sm:text-2xl text-[#1C1917] tracking-tight mb-4 text-center">
            {headline}
          </h2>
        )}

        {/* Circular Categories Row: Horizontal Scrolling (Matching Reference Screenshot Top Bar) */}
        <div className="flex items-center gap-4 sm:gap-7 overflow-x-auto scrollbar-none pb-2 justify-start sm:justify-center">
          {CIRCULAR_CATEGORIES.map((item) => {
            const isSelected = selectedGroup === item.groupKey || selectedGroup === item.id;
            return (
              <Link
                key={item.id}
                href={`/category/${item.groupKey}`}
                className="group flex flex-col items-center shrink-0 focus:outline-none cursor-pointer w-[68px] sm:w-[84px]"
              >
                {/* Circular Avatar Container */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#FAF7F2] p-0.5 transition-all duration-300 relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-[#7A1C3B] ring-offset-2 scale-105 shadow-sm'
                      : 'ring-1 ring-[#EFE8E1] group-hover:scale-105 group-hover:ring-[#7A1C3B]/50'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      if (item.fallbackSvg) {
                        (e.target as HTMLImageElement).src = item.fallbackSvg;
                      }
                    }}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`font-sans text-xs sm:text-[13px] leading-tight text-center mt-2 truncate w-full transition-colors ${
                    isSelected
                      ? 'font-bold text-[#7A1C3B]'
                      : 'font-medium text-[#57534E] group-hover:text-[#1C1917]'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
