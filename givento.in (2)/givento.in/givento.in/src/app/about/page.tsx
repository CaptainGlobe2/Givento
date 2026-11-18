'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { InstagramIcon } from '../../components/Icons';
import { Sparkles, Heart, ArrowLeft, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10 w-full space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {/* Story Sheet */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-12 shadow-xs space-y-8 relative overflow-hidden">
          <div className="text-center space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] font-semibold uppercase tracking-wider text-[#8C827A]">
              <Sparkles className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>Our Studio Story</span>
            </div>
            <h1 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#1C1917] tracking-tight">
              About Givento.in
            </h1>
            <p className="text-sm sm:text-base text-[#78716C] max-w-lg mx-auto">
              Handcrafted gifts made with soul, archival paper, gold leaf, and genuine care.
            </p>
          </div>

          {/* Story body */}
          <div className="space-y-6 text-sm text-[#57534E] leading-relaxed">
            <div className="p-6 bg-[#FAF7F2]/60 rounded-2xl border border-[#EFE8E1] space-y-3">
              <h2 className="font-display font-normal text-xl text-[#1C1917]">
                How it all began
              </h2>
              <p>
                Givento started late at night on a desk piled high with textured Korean crepe paper, silicone molds, gold leaf tweezers, and a glue gun. We were tired of walking through gift stores and seeing the exact same mass-produced plastic mugs and plastic flowers everywhere.
              </p>
              <p>
                We wanted gifts that feel like opening a handwritten letter from someone who truly knows you. Everlasting sunflowers that stay on study tables for years without wilting, Nikah frames with real pressed gold leaf and Quranic verses, and crystal resin letters embedded with Arabic calligraphy and pearls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-[#EFE8E1] space-y-2">
                <div className="font-display font-normal text-base text-[#7A1C3B] flex items-center gap-2">
                  <span>🌻</span>
                  <span>Forever Everlasting</span>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Every flower petal is shaped and rolled by hand using heavyweight treated paper that resists moisture and retains vibrant warmth forever.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#EFE8E1] space-y-2">
                <div className="font-display font-normal text-base text-[#7A1C3B] flex items-center gap-2">
                  <span>✨</span>
                  <span>Personalisation with Care</span>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Arabic names, wedding vows, or photos — we don&apos;t just print a template; we carefully align each letter and check proofs before wrapping.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E5DACD] space-y-3 text-center sm:text-left">
              <h3 className="font-sans text-xs font-bold text-[#7A1C3B] uppercase tracking-wider">
                Our Promise to You:
              </h3>
              <p className="font-display italic text-base sm:text-lg text-[#1C1917] leading-relaxed">
                “No factory assembly lines. No fake reviews. No generic cardboard boxes. Every parcel leaving our studio is wrapped with floral tissue, tied with satin ribbon, and hand-stamped with our signature Givento wax seal.”
              </p>
              <div className="text-xs text-[#8C827A] font-semibold text-right">
                — From the Givento Workshop Team (@givento.in)
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-[#EFE8E1] flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://instagram.com/givento.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] text-[#1C1917] font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition"
            >
              <InstagramIcon className="w-4 h-4 text-[#7A1C3B]" />
              <span>Watch Making Reels @givento.in</span>
            </a>

            <Link
              href="/category/all"
              className="px-6 py-3 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs sm:text-sm shadow-xs transition"
            >
              Explore the Collections 🌻
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
  );
}
