'use client';

import React from 'react';
import { REVIEWS } from '../data/sampleData';
import { Heart, Star } from 'lucide-react';

export default function LoveNotes() {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDEBF0] border border-[#2D1527] text-xs font-heading text-[#7A1C30] shadow-ink-sm rotate-1">
          <Heart className="w-3.5 h-3.5 fill-[#7A1C30]" />
          <span>from customer dm&apos;s &amp; letters</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl text-[#2D1527]">
          Scrapbook of Love Notes
        </h2>
        <p className="font-body text-sm sm:text-base text-[#5E3C57]">
          Sweet messages left by sisters, besties, and couples after unboxing their parcels.
        </p>
      </div>

      {/* Grid of Scrapbook review cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REVIEWS.map((review) => {
          const tiltClass =
            review.tiltDeg < -1.5
              ? '-rotate-2'
              : review.tiltDeg < 0
              ? '-rotate-1'
              : review.tiltDeg > 1.5
              ? 'rotate-2'
              : 'rotate-1';

          return (
            <div
              key={review.id}
              className={`relative bg-white border-2 border-[#2D1527] rounded-2xl p-5 shadow-ink transition-transform duration-200 hover:rotate-0 hover:scale-[1.02] flex flex-col justify-between ${tiltClass}`}
              style={{ backgroundColor: review.accentColor }}
            >
              {/* Washi tape at top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FEF08A]/75 border border-[#2D1527]/30 rotate-1 pointer-events-none" />

              <div className="pt-2 space-y-2">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  ))}
                </div>

                {/* Comment */}
                <p className="font-handwriting text-base sm:text-lg text-[#2D1527] leading-snug">
                  “{review.comment}”
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-4 pt-3 border-t border-[#2D1527]/15">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs text-[#2D1527]">
                    {review.author}
                  </span>
                  <span className="font-body text-[10px] text-[#5E3C57]">
                    {review.city}
                  </span>
                </div>
                <div className="text-[10px] font-handwriting text-[#7A1C30] font-bold mt-0.5 truncate">
                  Ordered: {review.productPurchased}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
