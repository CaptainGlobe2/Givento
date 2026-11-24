'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogoSvg } from './PrototypeArt';

export default function Footer() {
  const pathname = usePathname();

  // Only render on /about page per user request:
  // "remove this in every page execept about page .in about page improve the layout and everything look awesome buddy."
  if (pathname !== '/about') {
    return null;
  }

  return (
    <footer className="bg-[#5a1230] text-[#e9d6dd] mt-12 pt-12 pb-8 border-t border-[#7A1C3B]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* 4 Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 text-inherit no-underline">
              <BrandLogoSvg className="w-8 h-8 flex-none" />
              <div>
                <b className="font-heading font-normal text-2xl text-white leading-none block">
                  Givento
                </b>
                <small className="block text-[0.68rem] text-[#cdb2bc] font-semibold tracking-[0.2em] uppercase mt-1">
                  Gifts and keepsakes
                </small>
              </div>
            </Link>
            <p className="font-body text-xs sm:text-sm text-[#e9d6dd]/90 leading-relaxed max-w-sm">
              Bouquets, frames, hampers, resin keepsakes and jewellery, handcrafted with devotion in Adirampattinam, Tamil Nadu.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-heading font-normal text-sm text-white uppercase tracking-wider mb-3">Shop</h4>
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
              <Link href="/category/all" className="hover:text-white hover:underline transition-colors py-0.5">
                All collections
              </Link>
              <Link href="/category/bouquets" className="hover:text-white hover:underline transition-colors py-0.5">
                Bouquet studio
              </Link>
              <Link href="/category/stainless-steel-jewellery" className="hover:text-white hover:underline transition-colors py-0.5">
                Stainless Steel Jewellery
              </Link>
              <Link href="/category/frames" className="hover:text-white hover:underline transition-colors py-0.5">
                Frames &amp; Plaques
              </Link>
              <Link href="/cart" className="hover:text-white hover:underline transition-colors py-0.5">
                Shopping bag
              </Link>
            </div>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-heading font-normal text-sm text-white uppercase tracking-wider mb-3">Help</h4>
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
              <Link href="/about" className="hover:text-white hover:underline transition-colors py-0.5">
                About our studio
              </Link>
              <Link href="/track" className="hover:text-white hover:underline transition-colors py-0.5">
                Track your parcel
              </Link>
              <Link href="/contact" className="hover:text-white hover:underline transition-colors py-0.5">
                Contact &amp; Support
              </Link>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-heading font-normal text-sm text-white uppercase tracking-wider mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <a
                href="https://www.instagram.com/givento.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition-colors py-0.5 flex items-center gap-1.5"
              >
                <span>@givento.in on Instagram</span>
              </a>
              <p className="m-0 text-[#e9d6dd]/90">
                Studio Desk: Adirampattinam, TN
              </p>
              <div className="pt-1">
                <Link
                  href="/admin"
                  className="text-xs text-[#cdb2bc] hover:text-[#f8eed6] underline"
                >
                  Artisan Admin Room →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-white/15 mt-8 pt-5 text-xs text-[#cdb2bc] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Givento.in. Handcrafted with love in Adirampattinam, Tamil Nadu.</span>
          <span>Made for thoughtful celebrations.</span>
        </div>
      </div>
    </footer>
  );
}
