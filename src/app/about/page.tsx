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
  Heart,
  ShieldCheck,
  Package,
  MapPin,
  Clock,
  Flower2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* 1. Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C827A]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span>About Givento Studio</span>
        </div>

        {/* 2. Hero Story Header */}
        <div className="relative rounded-3xl overflow-hidden bg-[#7A1C3B] text-white p-8 sm:p-14 md:p-16 shadow-lg">
          {/* Subtle Ambient Background Texture */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-[#F8EED6]">
              <Sparkles className="w-3.5 h-3.5 text-[#B98A2E]" />
              <span>Independent Handcrafted Atelier · Est. 2023</span>
            </div>

            <h1 className="font-heading font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
              Thoughtful gifts crafted to last forever.
            </h1>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-body">
              Born along the historic coastal town of Adirampattinam, Tamil Nadu, Givento is a female-led artisan collective dedicated to turning moments of love, gratitude, and celebration into timeless keepsakes.
            </p>
          </div>
        </div>

        {/* 3. Artisan Photo Grid: What We Make */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase">
              Our Craft Specialties
            </span>
            <h2 className="font-heading font-normal text-2xl sm:text-4xl text-[#1C1917] tracking-tight">
              Four Pillars of Givento
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C]">
              Every piece is hand-assembled, personalized, and packaged individually in our studio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8E1] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#7A1C3B]/30 transition-all">
              <div className="h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
                  alt="Everlasting Bouquets"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider">Everlasting</span>
                <h3 className="font-heading font-medium text-lg text-[#1C1917]">Floral Bouquets</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Italian crepe paper and satin flower arrangements that bloom forever without watering.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8E1] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#7A1C3B]/30 transition-all">
              <div className="h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                  alt="Nikah & Celebration Frames"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider">Sacred Milestones</span>
                <h3 className="font-heading font-medium text-lg text-[#1C1917]">Nikah &amp; Keepsake Frames</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Custom gold-foil marriage vows, Quranic verse plaques, and polaroid baby birth frames.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8E1] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#7A1C3B]/30 transition-all">
              <div className="h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"
                  alt="Anti-Tarnish Jewellery"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider">Everyday Luxury</span>
                <h3 className="font-heading font-medium text-lg text-[#1C1917]">Waterproof Jewellery</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  18k gold finish stainless steel chains, adjustable stone rings, and delicate charm anklets.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8E1] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#7A1C3B]/30 transition-all">
              <div className="h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
                  alt="Curated Gift Boxes"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider">Celebration</span>
                <h3 className="font-heading font-medium text-lg text-[#1C1917]">Curated Gift Hampers</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Boutique hampers tied with double satin ribbon, wax-sealed card notes, and luxury surprises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Atelier Values: Why Givento is Special */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE8E1] shadow-xs space-y-8">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block mb-1">
              Our Ethos
            </span>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
              Small batch. Personal touch. Zero mass production.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">Local Artisan Hands</h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Handcrafted by local women artisans in Adirampattinam who bring care, focus, and warmth to every bloom and resin mold.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">Signature Boutique Wrap</h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Every order arrives in boutique tissue, hand-tied ribbon, and an optional personalized wax-sealed message card.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">Pan-India Express Safe Dispatch</h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Carefully cushioned and sealed to withstand interstate courier transit, reaching your recipient safely.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Contact & Studio Connect Card */}
        <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8E1]">
            <div>
              <h3 className="font-heading font-normal text-xl sm:text-2xl text-[#1C1917]">
                Connect with Givento Studio
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                We are always available on WhatsApp and phone for custom queries and orders.
              </p>
            </div>

            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs shadow-xs transition"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Phone */}
            <a
              href="tel:9344013255"
              className="p-4 bg-white rounded-2xl border border-[#EFE8E1] hover:border-[#7A1C3B] transition flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7A1C3B] flex items-center justify-center shrink-0 group-hover:bg-[#7A1C3B] group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[#8C827A] text-[10px] uppercase font-bold">Call Studio</span>
                <span className="font-mono font-bold text-[#1C1917]">+91 93440 13255</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919344013255"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-[#EFE8E1] hover:border-[#25D366] transition flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[#8C827A] text-[10px] uppercase font-bold">WhatsApp</span>
                <span className="font-mono font-bold text-[#1C1917]">+91 93440 13255</span>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:hello@givento.in"
              className="p-4 bg-white rounded-2xl border border-[#EFE8E1] hover:border-[#7A1C3B] transition flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7A1C3B] flex items-center justify-center shrink-0 group-hover:bg-[#7A1C3B] group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[#8C827A] text-[10px] uppercase font-bold">Email Desk</span>
                <span className="font-medium text-[#1C1917]">hello@givento.in</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/givento.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-[#EFE8E1] hover:border-[#7A1C3B] transition flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7A1C3B] flex items-center justify-center shrink-0 group-hover:bg-[#7A1C3B] group-hover:text-white transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[#8C827A] text-[10px] uppercase font-bold">Instagram</span>
                <span className="font-medium text-[#1C1917]">@givento.in</span>
              </div>
            </a>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs text-[#78716C]">
            <MapPin className="w-4 h-4 text-[#7A1C3B] shrink-0" />
            <span>Studio Workshop: East Coast Road, Adirampattinam, Thanjavur District, Tamil Nadu 614701, India</span>
          </div>
        </div>
      </main>

      {/* Boutique Footer (rendered exclusively on /about page) */}
      <Footer />
    </div>
  );
}
