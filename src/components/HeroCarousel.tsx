'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  bgGradient: string;
  ambientLightColor: string;
  pillColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    badge: 'Limited Offer',
    titleLine1: 'First Purchase Enjoy',
    titleLine2: 'a Special Offer',
    ctaText: 'Shop Now',
    ctaLink: '/category/all',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    bgGradient: 'from-[#FCECEE] via-[#F8DEE5] to-[#F2CDD7]',
    ambientLightColor: 'bg-white/40',
    pillColor: '#7A1C3B',
  },
  {
    id: 'slide-2',
    badge: 'Limited Offer',
    titleLine1: 'Everlasting Bouquets',
    titleLine2: 'Handcrafted with Love',
    ctaText: 'Shop Now',
    ctaLink: '/category/bouquets',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    bgGradient: 'from-[#EAF3E4] via-[#DEECD5] to-[#D2E4C6]',
    ambientLightColor: 'bg-white/45',
    pillColor: '#4A6B3D',
  },
  {
    id: 'slide-3',
    badge: 'Curated Luxury',
    titleLine1: 'Aesthetic Gift Hampers',
    titleLine2: 'for Every Celebration',
    ctaText: 'Shop Now',
    ctaLink: '/category/gift-hampers',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    bgGradient: 'from-[#FAF2E6] via-[#F5E6CE] to-[#EDD7B5]',
    ambientLightColor: 'bg-white/40',
    pillColor: '#8E6728',
  },
  {
    id: 'slide-4',
    badge: 'Anti-Tarnish',
    titleLine1: 'Stainless Steel Luxury',
    titleLine2: 'Everyday Jewellery',
    ctaText: 'Shop Now',
    ctaLink: '/category/stainless-steel-jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
    bgGradient: 'from-[#F5EDF6] via-[#ECDEED] to-[#E1CCE3]',
    ambientLightColor: 'bg-white/40',
    pillColor: '#6B386C',
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

  const activeSlide = SLIDES[current];

  return (
    <section
      aria-label="Hero Banner"
      className="w-full bg-[#FAF7F2] pt-2 pb-4 px-3 sm:px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Rounded Hero Banner Card - EXACT match to reference layout */}
        <div className="relative w-full rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#EFE8E1] shadow-xs">
          {/* Slides Container */}
          <div className="relative min-h-[290px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === current;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out bg-gradient-to-br ${slide.bgGradient} ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Organic ambient light circles matching reference */}
                  <div className={`absolute -top-12 -right-12 w-80 h-80 rounded-full blur-3xl pointer-events-none ${slide.ambientLightColor}`} />
                  <div className="absolute top-1/3 left-1/4 w-60 h-60 rounded-full bg-white/25 blur-2xl pointer-events-none" />

                  {/* Inner Layout: Left Column Text & Right Column Seamless Image */}
                  <div className="relative w-full h-full min-h-[290px] sm:min-h-[340px] md:min-h-[380px] px-6 sm:px-10 md:px-14 py-7 sm:py-9 flex items-center justify-between z-10">
                    {/* LEFT COLUMN: Badge + Headline + Large CTA Button (Exact Reference Match) */}
                    <div className="max-w-[62%] sm:max-w-[58%] md:max-w-md space-y-3 sm:space-y-4 md:space-y-5 text-left z-10">
                      {/* 1. Solid Black Pill Badge */}
                      <div>
                        <span className="inline-flex items-center px-3.5 sm:px-4 py-1 rounded-full bg-[#1C1917] text-white text-[10px] sm:text-xs font-semibold tracking-wide shadow-2xs">
                          {slide.badge}
                        </span>
                      </div>

                      {/* 2. Bold Clean Headline (Exact 2 lines) */}
                      <h2 className="font-heading font-medium text-xl sm:text-3xl md:text-4xl lg:text-[2.65rem] text-[#1C1917] tracking-tight leading-[1.12]">
                        {slide.titleLine1} <br />
                        {slide.titleLine2}
                      </h2>

                      {/* 3. Big Pill CTA Button with Circular Disk holding Arrow (Exact Reference Match) */}
                      <div className="pt-1">
                        <Link
                          href={slide.ctaLink}
                          className="inline-flex items-center gap-3.5 sm:gap-4 pl-5 sm:pl-6 pr-1.5 sm:pr-2 py-1.5 sm:py-2 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white font-medium text-xs sm:text-base transition-all duration-300 shadow-md group cursor-pointer active:scale-95"
                        >
                          <span className="font-semibold tracking-tight">{slide.ctaText}</span>
                          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#1C1917] flex items-center justify-center group-hover:scale-105 group-hover:rotate-45 transition-transform duration-300 shadow-xs">
                            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Seamless Product Presentation standing directly on card floor (No box/border!) */}
                    <div className="absolute right-2 sm:right-6 md:right-10 top-0 bottom-0 w-[45%] sm:w-[46%] md:w-[44%] flex items-end justify-center pointer-events-none pb-3 sm:pb-5">
                      <div className="relative w-full h-full max-h-[250px] sm:max-h-[300px] md:max-h-[340px] flex items-end justify-center">
                        {/* Soft contact shadow at bottom */}
                        <div className="absolute bottom-2 inset-x-4 h-6 bg-black/15 rounded-full blur-md" />

                        {/* Product visual seamlessly feathered into the scene */}
                        <img
                          src={slide.image}
                          alt={`${slide.titleLine1} ${slide.titleLine2}`}
                          style={{
                            WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 65% 55%, black 60%, transparent 100%)',
                            maskImage: 'radial-gradient(ellipse 90% 90% at 65% 55%, black 60%, transparent 100%)',
                          }}
                          className="relative z-10 max-h-full w-auto object-contain rounded-3xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] transform hover:scale-105 transition-transform duration-700 ease-out"
                        />
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

          {/* EXACT REFERENCE NOTCH: White Pill Tab carved into the bottom edge */}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-white px-4 sm:px-5 py-1 sm:py-1.5 rounded-t-2xl shadow-xs flex items-center gap-2 border-t border-x border-[#EFE8E1]/80">
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
                        ? 'w-7 sm:w-8 h-2 rounded-full'
                        : 'w-2 h-2 rounded-full bg-[#D5CCC3] hover:bg-[#7A1C3B]/60'
                    }`}
                    style={isActive ? { backgroundColor: slide.pillColor } : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
