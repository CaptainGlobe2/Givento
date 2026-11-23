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
  tintClass: string;
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
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85',
    tintClass: 'bg-[#FCECEE]',
    pillColor: '#7A1C3B',
  },
  {
    id: 'slide-2',
    badge: 'Handcrafted Blooms',
    titleLine1: 'Everlasting Bouquets',
    titleLine2: 'Handcrafted with Love',
    ctaText: 'Shop Now',
    ctaLink: '/category/bouquets',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=85',
    tintClass: 'bg-[#EAF3E4]',
    pillColor: '#4A6B3D',
  },
  {
    id: 'slide-3',
    badge: 'Curated Luxury',
    titleLine1: 'Aesthetic Gift Hampers',
    titleLine2: 'for Every Celebration',
    ctaText: 'Shop Now',
    ctaLink: '/category/gift-hampers',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85',
    tintClass: 'bg-[#FAF2E6]',
    pillColor: '#8E6728',
  },
  {
    id: 'slide-4',
    badge: 'Anti-Tarnish',
    titleLine1: 'Stainless Steel Luxury',
    titleLine2: 'Everyday Jewellery',
    ctaText: 'Shop Now',
    ctaLink: '/category/stainless-steel-jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85',
    tintClass: 'bg-[#F5EDF6]',
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

  return (
    <section
      aria-label="Hero Banner"
      className="w-full bg-[#FAF7F2] pt-2 pb-4 px-3 sm:px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Rounded Hero Banner Card - Full-bleed background image with crystal-clear overlay */}
        <div className="relative w-full rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#EFE8E1] shadow-md bg-white">
          {/* Slides Container */}
          <div className="relative min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex items-center">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === current;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* 1. Awesome High-Resolution Background Image covering entire card */}
                  <img
                    src={slide.image}
                    alt={`${slide.titleLine1} ${slide.titleLine2}`}
                    className="absolute inset-0 w-full h-full object-cover object-right sm:object-center transform scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
                  />

                  {/* 2. Soft Gradient Overlay on Left: Keeps text 100% readable while revealing full image on right */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 via-45% sm:via-40% to-transparent pointer-events-none" />

                  {/* 3. Subtle ambient warmth overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />

                  {/* 4. Left Content: Badge + 2-Line Headline + Shop Now CTA */}
                  <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] px-6 sm:px-10 md:px-14 py-8 sm:py-10 flex items-center z-10">
                    <div className="max-w-[68%] sm:max-w-[55%] md:max-w-md space-y-3 sm:space-y-4 md:space-y-5 text-left">
                      {/* Black Pill Badge */}
                      <div>
                        <span className="inline-flex items-center px-3.5 sm:px-4 py-1 rounded-full bg-[#1C1917] text-white text-[10px] sm:text-xs font-semibold tracking-wide shadow-2xs">
                          {slide.badge}
                        </span>
                      </div>

                      {/* Clean 2-Line Bold Headline */}
                      <h2 className="font-heading font-medium text-xl sm:text-3xl md:text-4xl lg:text-[2.65rem] text-[#1C1917] tracking-tight leading-[1.12]">
                        {slide.titleLine1} <br />
                        {slide.titleLine2}
                      </h2>

                      {/* Large Pill CTA Button with White Circular Arrow Disk */}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C1917] hover:text-[#7A1C3B] backdrop-blur-xs border border-[#EFE8E1] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C1917] hover:text-[#7A1C3B] backdrop-blur-xs border border-[#EFE8E1] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Center White Notch with Indicator Pills */}
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
