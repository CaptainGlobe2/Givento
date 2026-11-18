'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { InstagramIcon } from '../../components/Icons';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full space-y-4">
        {/* 1. Top Navigation Bar (Matching Image 1: Back on Left, Status/Action on Right) */}
        <div className="flex items-center justify-between pb-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:text-[#5A1230] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
          <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
            Studio Profile
          </span>
        </div>

        {/* 2. Main Profile Sheet (Matching Image 1 Layout & Component Alignment) */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Block: Title, Subtitle, and Status Badge Pill */}
          <div className="text-center space-y-2.5">
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Givento Studio
            </h1>

            <p className="text-[11px] sm:text-xs text-[#78716C] max-w-xs mx-auto leading-relaxed">
              Handcrafted in Adirampattinam, Tamil Nadu · Established 2023
            </p>

            <div className="pt-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#E8F5ED] border border-[#C3E6D0] text-[11px] font-semibold text-[#2C7A54]">
                Artisan Atelier
              </span>
            </div>
          </div>

          {/* 3. Four Circular Action Buttons (Matching Image 1: Text, Call, Email, Add Note / Instagram) */}
          <div className="grid grid-cols-4 gap-2 pt-2 pb-1 text-center">
            {/* WhatsApp / Text */}
            <a
              href="https://wa.me/919344013255?text=Hello%20Givento!%20Connecting%20from%20your%20About%20page"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#5A1230] group-hover:scale-105 active:scale-95 transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-[#57534E] group-hover:text-[#1C1917] mt-1.5 transition-colors">
                Text
              </span>
            </a>

            {/* Phone Call */}
            <a
              href="tel:9344013255"
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#5A1230] group-hover:scale-105 active:scale-95 transition-all">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-[#57534E] group-hover:text-[#1C1917] mt-1.5 transition-colors">
                Call
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:hello@givento.in"
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#5A1230] group-hover:scale-105 active:scale-95 transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-[#57534E] group-hover:text-[#1C1917] mt-1.5 transition-colors">
                Email
              </span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/givento.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#5A1230] group-hover:scale-105 active:scale-95 transition-all">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-[#57534E] group-hover:text-[#1C1917] mt-1.5 transition-colors">
                Instagram
              </span>
            </a>
          </div>

          {/* 4. Narrative / Bio Text (Matching Image 1 Centered Intro Paragraph) */}
          <p className="text-xs sm:text-sm text-[#78716C] text-center leading-relaxed max-w-sm mx-auto pt-1">
            Givento is an independent handcrafted atelier dedicated to creating everlasting paper flower blooms, bespoke Nikah contract plaques, preserved floral resin keepsakes, and anti-tarnish stainless steel jewellery.
          </p>

          {/* 5. "Details" Section (Matching Image 1 Section Header & Stacked Detail Rows) */}
          <div className="border-t border-[#EFE8E1] pt-6 space-y-4">
            <h2 className="font-bold text-base text-[#1C1917]">
              Details
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm divide-y divide-[#EFE8E1]/60">
              {/* Email Address */}
              <div className="pt-2 first:pt-0 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Email Address
                </span>
                <a
                  href="mailto:hello@givento.in"
                  className="block font-medium text-[#7A1C3B] hover:underline"
                >
                  hello@givento.in
                </a>
              </div>

              {/* Studio Location */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Studio Workshop Address
                </span>
                <span className="block font-semibold text-[#1C1917] leading-snug">
                  East Coast Road, Adirampattinam, Thanjavur District, Tamil Nadu 614701, India
                </span>
              </div>

              {/* Artisan Team */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Makers &amp; Craft Collective
                </span>
                <span className="block font-semibold text-[#1C1917]">
                  Handcrafted by local women artisans
                </span>
              </div>

              {/* Specialties */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Craft Specialties
                </span>
                <span className="block font-semibold text-[#1C1917] leading-snug">
                  Preserved Floral Resin, Everlasting Crepe Bouquets, Nikah Keepsake Frames &amp; Anti-Tarnish Jewellery
                </span>
              </div>

              {/* WhatsApp Support */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Direct WhatsApp Support
                </span>
                <a
                  href="https://wa.me/919344013255"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-semibold text-[#1C1917] hover:text-[#7A1C3B] transition-colors"
                >
                  +91 93440 13255
                </a>
              </div>

              {/* Packaging */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Packaging &amp; Presentation
                </span>
                <span className="block font-semibold text-[#1C1917] leading-snug">
                  Zero plastic mass production. Every parcel wrapped in floral tissue, tied with satin ribbon, and stamped with our wax seal.
                </span>
              </div>

              {/* Dispatch */}
              <div className="pt-3 space-y-0.5">
                <span className="block text-[11px] font-medium text-[#78716C]">
                  Delivery Coverage
                </span>
                <span className="block font-semibold text-[#1C1917]">
                  Pan-India Express Dispatch via Bluedart &amp; DTDC with live tracking
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Storefront Action */}
          <div className="pt-4 border-t border-[#EFE8E1]">
            <Link
              href="/category/all"
              className="w-full py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
            >
              <span>Explore Handcrafted Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}