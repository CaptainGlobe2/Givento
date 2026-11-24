'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  categoryGroup: string;
  searchTerm?: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'necklaces',
    title: 'Necklaces',
    subtitle: 'Anti-tarnish chains',
    tag: '18k Finish',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'chain',
  },
  {
    id: 'rings',
    title: 'Rings',
    subtitle: 'Adjustable stone bands',
    tag: 'Waterproof',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'ring',
  },
  {
    id: 'bracelets',
    title: 'Bracelets',
    subtitle: 'Charm & dewdrop anklets',
    tag: 'Anti-Tarnish',
    image: 'https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=600&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'bracelet',
  },
  {
    id: 'earrings',
    title: 'Earrings',
    subtitle: 'Hypoallergenic drops',
    tag: 'Trending',
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
    <section className="py-8 sm:py-14 bg-[#FAF7F2] border-b border-[#EFE8E1]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-8 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#B98A2E]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#7A1C3B] uppercase">
                Anti-Tarnish · Waterproof
              </span>
            </div>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
              Jewellery Collection
            </h2>
          </div>

          <Link
            href="/category/stainless-steel-jewellery"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1C3B] hover:text-[#5A1230] group transition self-start sm:self-auto"
          >
            <span>View All Jewellery</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Category Cards: Compact 2x2 on Mobile, 4-in-a-row on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={`/category/${col.categoryGroup}${col.searchTerm ? `?q=${col.searchTerm}` : ''}`}
              onClick={(e) => handleClick(col, e)}
              className="group relative h-36 sm:h-52 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EFE8E1] bg-[#ECE4DA] shadow-xs hover:shadow-md transition-all duration-300 active:scale-[0.98] flex flex-col justify-between p-3 sm:p-4"
            >
              {/* Background Image */}
              <img
                src={col.image}
                alt={col.title}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80';
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay for Crisp Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/85 transition-colors" />

              {/* Top Tag Badge */}
              <div className="relative z-10 flex justify-end">
                <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#7A1C3B] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-2xs border border-white/60">
                  {col.tag}
                </span>
              </div>

              {/* Bottom Info & Arrow */}
              <div className="relative z-10 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-heading font-medium text-sm sm:text-lg text-white tracking-wide group-hover:text-[#F8EED6] transition-colors leading-tight">
                    {col.title}
                  </h3>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-xs group-hover:bg-[#7A1C3B] text-white flex items-center justify-center transition-all shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-white/80 line-clamp-1 font-body">
                  {col.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
