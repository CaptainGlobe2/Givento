import React from 'react';
import Link from 'next/link';
import { BrandLogoSvg } from './PrototypeArt';

export default function Footer() {
  return (
    <footer className="bg-[#5a1230] text-[#e9d6dd] mt-5 pt-10 pb-7">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* 4 Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-7">
          {/* Brand Info */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-inherit no-underline">
              <BrandLogoSvg className="w-8 h-8 flex-none" />
              <div>
                <b className="font-display font-normal text-[1.6rem] text-white leading-none block">
                  Givento
                </b>
                <small className="block text-[0.68rem] text-[#cdb2bc] font-semibold tracking-wide mt-0.5">
                  Gifts and keepsakes
                </small>
              </div>
            </Link>
            <p className="font-body text-[0.9rem] text-[#e9d6dd] mt-3 leading-relaxed">
              Bouquets, frames, hampers, resin keepsakes and jewellery, from Adirampattinam, Tamil Nadu.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-body font-extrabold text-[0.9rem] text-white mb-2.5">Shop</h4>
            <div className="flex flex-col gap-1 text-[0.9rem]">
              <Link href="/category/all" className="hover:text-white hover:underline transition-colors py-0.5">
                All collections
              </Link>
              <Link href="/category/bouquets" className="hover:text-white hover:underline transition-colors py-0.5">
                Bouquet studio
              </Link>
              <Link href="/custom-order" className="hover:text-white hover:underline transition-colors py-0.5">
                Custom handcrafted orders
              </Link>
              <Link href="/cart" className="hover:text-white hover:underline transition-colors py-0.5">
                Shopping bag
              </Link>
            </div>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-body font-extrabold text-[0.9rem] text-white mb-2.5">Help</h4>
            <div className="flex flex-col gap-1 text-[0.9rem]">
              <Link href="/#how" className="hover:text-white hover:underline transition-colors py-0.5">
                How to order
              </Link>
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
            <h4 className="font-body font-extrabold text-[0.9rem] text-white mb-2.5">Contact</h4>
            <div className="flex flex-col gap-1.5 text-[0.9rem]">
              <a
                href="https://www.instagram.com/givento.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition-colors py-0.5 flex items-center gap-1.5"
              >
                <span>@givento.in on Instagram</span>
              </a>
              <p className="m-0 text-[#e9d6dd]">
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
        <div className="border-t border-[rgba(255,255,255,0.18)] mt-7 pt-4 text-[0.8rem] text-[#cdb2bc] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Givento.in. Handcrafted with love in Adirampattinam, Tamil Nadu.</span>
          <span>Prototype preview. Products, prices and wording come from the Instagram page.</span>
        </div>
      </div>
    </footer>
  );
}
