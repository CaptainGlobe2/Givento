'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  bgGradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    badge: 'Limited Offer',
    title: 'First Purchase Enjoy a Special Offer',
    subtitle: 'Handcrafted floral bouquets, personalised resin keepsakes, and curated luxury gift boxes.',
    ctaText: 'Shop Now',
    ctaLink: '/category/all',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#FCECEE] via-[#FAF1E8] to-[#FBE9ED]',
  },
  {
    id: 'slide-2',
    badge: 'Handmade Blooms',
    title: 'Everlasting Bouquets Handcrafted with Love',
    subtitle: 'Fresh paper blooms, crochet sunflowers, and bespoke floral wraps made in Adiram.',
    ctaText: 'Explore Bouquets',
    ctaLink: '/category/bouquets',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#FFF0F3] via-[#FAF5EE] to-[#FDF0EC]',
  },
  {
    id: 'slide-3',
    badge: 'Curated Luxury',
    title: 'Aesthetic Gift Hampers for Every Celebration',
    subtitle: 'Artisanal rigid gift boxes with wax-sealed calligraphy envelopes and keepsake touches.',
    ctaText: 'Discover Hampers',
    ctaLink: '/category/gift-hampers',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#F9F4EB] via-[#FCF8F2] to-[#F4ECE3]',
  },
  {
    id: 'slide-4',
    badge: 'Anti-Tarnish',
    title: 'Stainless Steel Luxury Everyday Jewellery',
    subtitle: 'Waterproof, hypoallergenic dainty chains, kada, twisted rings, and mehandi hand chains.',
    ctaText: 'Shop Jewellery',
    ctaLink: '/category/stainless-steel-jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#FAF0F4] via-[#F8F2EC] to-[#FBF1F5]',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      aria-label="Hero Banner"
      className="w-full bg-[#FAF7F2] py-2 sm:py-3.5 px-3 sm:px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Rounded Hero Banner Card matching Reference Photo Layout */}
        <div className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden border border-[#EFE8E1] shadow-xs">
          {/* Slides Container */}
          <div className="relative min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === current;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex items-center bg-gradient-to-br ${slide.bgGradient} ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Product Image Layer (Soft translucent blend behind the card) */}
                  <div className="absolute right-0 top-0 bottom-0 w-3/4 sm:w-3/5 overflow-hidden pointer-events-none opacity-20 sm:opacity-25 mix-blend-multiply">
                    <img
                      src={slide.image}
                      alt=""
                      className="w-full h-full object-cover scale-110 blur-[1px] transform origin-right"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAF1E8] via-[#FAF1E8]/60 to-transparent" />
                  </div>

                  {/* Ambient subtle glow decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#7A1C3B]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#B98A2E]/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative w-full h-full px-4 sm:px-8 md:px-12 py-5 sm:py-8 flex items-center justify-between gap-3 sm:gap-6 z-10">
                    {/* Left Side: Badge, Title, Subtitle, CTA Button */}
                    <div className="flex-1 max-w-[62%] sm:max-w-[60%] md:max-w-md space-y-2 sm:space-y-3.5 text-left z-10">
                      {/* Black pill badge matching Reference */}
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#1C1917] text-white text-[9px] sm:text-xs font-semibold tracking-wide uppercase shadow-2xs">
                          {slide.badge}
                        </span>
                      </div>

                      {/* Main Headline */}
                      <h1 className="font-heading font-medium text-lg sm:text-2xl md:text-3xl lg:text-[2.35rem] text-[#1C1917] tracking-tight leading-[1.2]">
                        {slide.title}
                      </h1>

                      {/* Short Subtitle */}
                      <p className="text-[11px] sm:text-xs md:text-sm text-[#78716C] leading-relaxed line-clamp-2">
                        {slide.subtitle}
                      </p>

                      {/* CTA Pill Button with Arrow In Circle (Exact Reference Shape!) */}
                      <div className="pt-1">
                        <Link
                          href={slide.ctaLink}
                          className="inline-flex items-center gap-2 sm:gap-3 pl-3.5 sm:pl-5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white font-bold text-[11px] sm:text-xs md:text-sm transition-all duration-300 shadow-md group cursor-pointer active:scale-95"
                        >
                          <span>{slide.ctaText}</span>
                          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-[#1C1917] flex items-center justify-center group-hover:scale-105 group-hover:rotate-45 transition-transform duration-200 shadow-xs">
                            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Side: Visible Product Image Card on Mobile and Desktop */}
                    <div className="flex shrink-0 items-center justify-end z-10 pr-1 sm:pr-0">
                      <div className="relative w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white/95 bg-white transform hover:scale-105 transition-transform duration-500">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left / Right Carousel Controls */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1C1917] hover:text-[#7A1C3B] backdrop-blur-xs border border-[#EFE8E1] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1C1917] hover:text-[#7A1C3B] backdrop-blur-xs border border-[#EFE8E1] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Centered Pagination Pill (Matching Reference Dots with Active Pill) */}
          <div className="absolute bottom-3 left-1/2 -translate-y-0 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-2xs">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-6 h-2 rounded-full bg-[#7A1C3B]'
                      : 'w-2 h-2 rounded-full bg-[#D5CCC3] hover:bg-[#7A1C3B]/60'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
