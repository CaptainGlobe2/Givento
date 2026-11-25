'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

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
    subtitle: '18k gold plated chains',
    tag: 'Anti-Tarnish',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'chain',
  },
  {
    id: 'rings',
    title: 'Rings',
    subtitle: 'Adjustable crystal bands',
    tag: 'Waterproof',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'ring',
  },
  {
    id: 'bracelets',
    title: 'Bracelets',
    subtitle: 'Charm & dewdrop anklets',
    tag: 'Daily Wear',
    image: 'https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=700&q=80',
    categoryGroup: 'stainless-steel-jewellery',
    searchTerm: 'bracelet',
  },
  {
    id: 'earrings',
    title: 'Earrings',
    subtitle: 'Hypoallergenic huggies',
    tag: 'Skin Safe',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=80',
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C3B]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#7A1C3B] uppercase">
                Waterproof · 18k PVD Finish
              </span>
            </div>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl md:text-4xl text-[#1C1917] tracking-tight">
              Jewellery Collection
            </h2>
          </div>

          <Link
            href="/category/stainless-steel-jewellery"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:text-[#5A1230] group transition self-start sm:self-auto"
          >
            <span>View All Jewellery</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Aesthetic Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {COLLECTIONS.map((col, idx) => {
            const targetHref = col.searchTerm
              ? `/category/${col.categoryGroup}?q=${encodeURIComponent(col.searchTerm)}`
              : `/category/${col.categoryGroup}`;
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.38, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={targetHref}
                  onClick={(e) => handleClick(col, e)}
                  className="group relative block rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1] hover:border-[#7A1C3B]/40 hover:shadow-md transition-all duration-300"
                >
                {/* Image with Aesthetic Overlay */}
                <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-[#F2EAE1]">
                  <img
                    src={col.image}
                    alt={col.title}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/starlight-chain.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />

                  {/* Subtle Multi-stage Gradient for Perfect Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 group-hover:from-black/85 transition-colors" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#1C1917] uppercase shadow-xs">
                      {col.tag}
                    </span>
                  </div>

                  {/* Top Right Arrow Pill */}
                  <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#1C1917] opacity-80 group-hover:opacity-100 group-hover:bg-[#7A1C3B] group-hover:text-white transition-all shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>

                  {/* Bottom Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 text-white z-10 space-y-0.5">
                    <h3 className="font-heading font-medium text-base sm:text-lg leading-tight tracking-tight text-white group-hover:text-[#F8EED6] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 font-light truncate">
                      {col.subtitle}
                    </p>
                  </div>
                </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
