'use client';

import React from 'react';
import Link from 'next/link';

interface CollectionItem {
  id: string;
  title: string;
  image: string;
  categoryGroup: string;
  searchTerm?: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'necklaces',
    title: 'NECKLACES →',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'chain',
  },
  {
    id: 'rings',
    title: 'RINGS →',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'ring',
  },
  {
    id: 'bracelets',
    title: 'BRACELETS →',
    image: 'https://images.unsplash.com/photo-1611591475152-47354c414614?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'bracelet',
  },
  {
    id: 'earrings',
    title: 'EARRINGS →',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'earring',
  },
];

interface FeaturedCollectionsProps {
  onSelectCollection?: (groupKey: string, searchTerm?: string) => void;
}

export default function FeaturedCollections({ onSelectCollection }: FeaturedCollectionsProps) {
  const handleClick = (item: CollectionItem, e: React.MouseEvent) => {
    if (onSelectCollection) {
      e.preventDefault();
      onSelectCollection(item.categoryGroup, item.searchTerm);
      const el = document.getElementById('shop');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#EFE8E1]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Curated For You Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[11px] sm:text-xs tracking-[0.25em] font-medium text-[#8C827A] uppercase mb-1">
            Anti-Tarnish &amp; Waterproof
          </p>
          <h2 className="font-display font-normal text-2xl sm:text-3xl md:text-4xl text-[#1c1917] tracking-tight">
            Jewellery
          </h2>

          {/* Delicate Center Ornament (Matching Reference) */}
          <div className="flex items-center justify-center gap-3 my-2.5">
            <span className="h-px w-8 sm:w-12 bg-[#E2D6C8]" />
            <span className="text-[#C59A34] text-[10px] sm:text-xs">◆</span>
            <span className="h-px w-8 sm:w-12 bg-[#E2D6C8]" />
          </div>
        </div>

        {/* 4 Arch-Topped Cards Grid (Matching Reference Exactly) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={`/category/${col.categoryGroup}${col.searchTerm ? `?q=${col.searchTerm}` : ''}`}
              className="group flex flex-col cursor-pointer transition-transform duration-300 active:scale-[0.99]"
            >
              {/* Arch Shaped Image Container */}
              <div className="w-full aspect-[3/3.8] rounded-t-[70px] sm:rounded-t-[90px] md:rounded-t-[105px] overflow-hidden bg-[#ECE4DA] border-t border-x border-[#E0D5C7] relative shadow-xs">
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Bottom Brand Maroon Banner Button */}
              <div className="w-full bg-[#7A1C3B] group-hover:bg-[#5A1230] text-white py-3 sm:py-3.5 px-3 text-center transition-colors duration-200 rounded-b-sm shadow-xs">
                <span className="text-[11px] sm:text-xs md:text-[13px] font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-1.5">
                  {col.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
