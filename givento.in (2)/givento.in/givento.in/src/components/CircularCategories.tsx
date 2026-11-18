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
    name: 'Personalised Gifts',
    subtext: 'Frames & Plaques',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/nikah-frame.svg',
    groupKey: 'frames',
  },
  {
    id: 'bouquets',
    name: 'Fresh Bouquets',
    subtext: 'Sunflowers & Roses',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/sunflower-bouquet.svg',
    groupKey: 'bouquets',
  },
  {
    id: 'gift-hampers',
    name: 'Gift Hampers',
    subtext: 'Curated Boxes',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/gift-for-her.svg',
    groupKey: 'gift-hampers',
  },
  {
    id: 'stainless-steel-jewellery',
    name: 'Unique Jewellery',
    subtext: 'Anti-tarnish',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/starlight-chain.svg',
    groupKey: 'stainless-steel-jewellery',
  },
  {
    id: 'resin-art',
    name: 'Resin Art & Decor',
    subtext: 'Clocks & Keepsakes',
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/resin-clock.svg',
    groupKey: 'resin-art',
  },
  {
    id: 'hair-accessories',
    name: 'On Sale & Clips',
    subtext: 'Crochet Accessories',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=320&q=80',
    fallbackSvg: '/images/crochet-clips.svg',
    groupKey: 'hair-accessories',
  },
];

export default function CircularCategories({
  selectedGroup,
  onSelectGroup,
  headline = 'Fresh finds fit for cosy season.',
}: CircularCategoriesProps) {
  return (
    <section className="bg-[#fbf4f0] border-b border-[#ebdcd5] pt-6 pb-9 sm:py-10 transition-colors">
      <div className="max-w-[1180px] mx-auto px-4 text-center">
        {/* Editorial Serif Headline (matching reference screenshot) */}
        <h2 className="font-display font-normal text-[1.45rem] sm:text-2xl md:text-3xl text-[#231a1d] tracking-tight mb-6 sm:mb-8 max-w-xl mx-auto leading-snug">
          {headline}
        </h2>

        {/* Circular Categories Grid (2 rows of 3 on mobile, 6 across on desktop) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-5 sm:gap-4 md:gap-6 justify-items-center max-w-4xl mx-auto">
          {CIRCULAR_CATEGORIES.map((item) => {
            const isSelected = selectedGroup === item.groupKey || selectedGroup === item.id;
            return (
              <Link
                key={item.id}
                href={`/category/${item.groupKey}`}
                className="group flex flex-col items-center focus:outline-none cursor-pointer w-full max-w-[110px]"
              >
                {/* Circular Container */}
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden bg-white p-1 transition-all duration-300 relative shadow-xs flex items-center justify-center ${
                    isSelected
                      ? 'ring-2.5 ring-[#7a1c3b] ring-offset-2 scale-105 shadow-md'
                      : 'border border-[#ecdcd4] group-hover:scale-105 group-hover:shadow-md group-hover:border-[#7a1c3b]/50'
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
                  className={`font-body text-xs sm:text-[0.88rem] leading-tight text-center mt-2.5 px-0.5 line-clamp-2 transition-colors ${
                    isSelected
                      ? 'font-bold text-[#7a1c3b]'
                      : 'font-semibold text-[#231a1d] group-hover:text-[#7a1c3b]'
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
