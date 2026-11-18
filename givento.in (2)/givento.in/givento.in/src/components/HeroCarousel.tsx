'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

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
    badge: 'HANDCRAFTED WITH LOVE',
    title: 'Everlasting Bouquets & Keepsake Gifts',
    subtitle: 'Thoughtfully packaged in Adirampattinam with fresh paper blooms, custom Polaroid memories and bespoke gift wraps.',
    ctaText: 'Explore Bouquets',
    ctaLink: '#shop',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#FAF2EB] via-[#FDF8F3] to-[#F5ECE2]',
  },
  {
    id: 'slide-2',
    badge: 'PERSONALISED MEMORIES',
    title: 'Bespoke Keepsakes & Nikah Frames',
    subtitle: 'Preserved flower resin blocks, Spotify plaques, handmade Nikah contract frames, and custom anniversary gifts.',
    ctaText: 'Explore Keepsakes',
    ctaLink: '#shop',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#FDF3F5] via-[#FFF9FA] to-[#FBE8EC]',
  },
  {
    id: 'slide-3',
    badge: 'ANTI-TARNISH & WATERPROOF',
    title: 'Stainless Steel Luxury Jewellery',
    subtitle: 'Everyday elegance: dainty chains, twisted rings, kada, tennis bracelets and mehandi hand chains that never tarnish.',
    ctaText: 'Shop Jewellery',
    ctaLink: '#shop',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#F9F6EE] via-[#FDFCF8] to-[#F4EEDC]',
  },
  {
    id: 'slide-4',
    badge: 'CURATED LUXURY',
    title: 'Gift Hampers For Her & Him',
    subtitle: 'Aesthetic gift boxes crafted for birthdays, anniversaries, weddings and every little celebration that matters.',
    ctaText: 'Discover Hampers',
    ctaLink: '#shop',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#F0F7F4] via-[#F8FCFA] to-[#E3F0EB]',
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
    <div
      className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-[#EFE8E1]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured Highlights"
    >
      {/* Slides Container */}
      <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-center">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex items-center ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              } bg-gradient-to-r ${slide.bgGradient}`}
            >
              <div className="max-w-[1180px] mx-auto px-4 sm:px-6 w-full py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Text Content */}
                <div className="md:col-span-7 lg:col-span-6 space-y-3 sm:space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD5] text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#7A1C3B] uppercase shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#C59A34]" />
                    <span>{slide.badge}</span>
                  </div>

                  <h1 className="font-display font-normal text-2xl sm:text-4xl md:text-[2.65rem] text-[#1C1917] tracking-tight leading-[1.15]">
                    {slide.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#665E57] max-w-lg leading-relaxed mx-auto md:mx-0">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white text-xs sm:text-sm font-medium tracking-wide shadow-xs transition-colors duration-200 cursor-pointer"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Visual Imagery */}
                <div className="md:col-span-5 lg:col-span-6 flex justify-center md:justify-end">
                  <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-2 border-white/70">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#1C1917] shadow-sm flex items-center justify-center border border-[#E8DFD5] transition-all hover:scale-105 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#1C1917] shadow-sm flex items-center justify-center border border-[#E8DFD5] transition-all hover:scale-105 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Navigation Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, dotIdx) => {
          const isActive = dotIdx === current;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                isActive ? 'w-6 bg-[#1C1917]' : 'w-2 bg-[#D1C7BA] hover:bg-[#A89E90]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
