'use client';

import React from 'react';
import Link from 'next/link';
import { HeroArtwork } from './PrototypeArt';
import { Check } from 'lucide-react';

export default function Hero() {
  return (
    <div className="bg-[#faf6f4] border-b border-[#e8dcdc]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-7 lg:gap-10 items-center py-8 lg:py-11">
          {/* Left Column: Heading, description & CTAs */}
          <div>
            <h1 className="font-display font-normal text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.01em] text-[#231a1d] mb-4">
              Bouquets, hampers and keepsakes for the people you love.
            </h1>
            <p className="font-body text-[1.05rem] text-[#6a5b60] max-w-[50ch] mb-6 leading-relaxed">
              Personalised frames, resin keepsakes, stainless steel jewellery and bouquets from Adirampattinam. Pick what you like and order on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#shop"
                className="btn-boutique"
              >
                Shop gifts
              </Link>
              <Link
                href="#builder"
                className="btn-boutique alt"
              >
                Build your own bouquet
              </Link>
            </div>
          </div>

          {/* Right Column: Layered Hero Artwork */}
          <div className="w-full max-w-[520px] mx-auto lg:max-w-none">
            <HeroArtwork />
          </div>
        </div>

        {/* Trust Indicators Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 border-t border-[#e8dcdc] py-4.5">
          <div className="flex gap-2.5 items-start text-[0.86rem] font-semibold text-[#231a1d] leading-[1.35]">
            <Check className="w-5 h-5 flex-none text-[#b98a2e] mt-0.5" />
            <span>Personalised on request, with names, dates and photos</span>
          </div>
          <div className="flex gap-2.5 items-start text-[0.86rem] font-semibold text-[#231a1d] leading-[1.35]">
            <Check className="w-5 h-5 flex-none text-[#b98a2e] mt-0.5" />
            <span>Build your own bouquet from wrapping sheets in stock</span>
          </div>
          <div className="flex gap-2.5 items-start text-[0.86rem] font-semibold text-[#231a1d] leading-[1.35]">
            <Check className="w-5 h-5 flex-none text-[#b98a2e] mt-0.5" />
            <span>Order on WhatsApp or Instagram, no account needed</span>
          </div>
          <div className="flex gap-2.5 items-start text-[0.86rem] font-semibold text-[#231a1d] leading-[1.35]">
            <Check className="w-5 h-5 flex-none text-[#b98a2e] mt-0.5" />
            <span>Delivery or pickup, confirmed with you on chat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
