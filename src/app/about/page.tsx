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
  Heart,
  PackageCheck,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-14 sm:space-y-20">
        {/* 1. Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C827A]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span>Our Story</span>
        </div>

        {/* 2. Editorial Studio Header (Human, grounded, elegant) */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F6E9EE] border border-[#ECD1DC] text-[#7A1C3B] text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#7A1C3B] animate-pulse" />
            <span>Studio in Adirampattinam, Tamil Nadu</span>
          </div>

          <h1 className="font-heading font-normal text-3xl sm:text-5xl md:text-[3.25rem] text-[#1C1917] tracking-tight leading-[1.15]">
            Gifts made by hand, meant to be kept forever.
          </h1>

          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-3xl font-light">
            We started Givento with a simple realization: fresh bouquets wilt within twenty-four hours, and factory gifts quickly end up forgotten in drawers. We wanted to build something warmer—keepsakes handcrafted with real patience, celebrating life&apos;s most meaningful milestones.
          </p>
        </section>

        {/* 3. Visual Storytelling: The Workshop Origins */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE8E1] shadow-2xs">
          <div className="md:col-span-6 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block">
              How Givento Began
            </span>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] leading-snug">
              From a home dining table in coastal Tamil Nadu.
            </h2>
            <div className="space-y-3 text-sm text-[#78716C] leading-relaxed">
              <p>
                In 2023, our founder folded the first set of Italian crepe paper roses for a cousin&apos;s wedding in Adirampattinam. The bride loved that months later, the flowers were still blooming on her dressing table, vibrant and intact.
              </p>
              <p>
                Friends asked for their own arrangements. Soon, we were learning to foil metallic lettering onto gold Nikah certificates, preserve real pressed botanicals inside crystal resin clocks, and select waterproof, anti-tarnish jewellery that sisters and friends could wear every day without turning green.
              </p>
              <p>
                Today, Givento remains an intimate, hands-on craft studio. Every bouquet is shaped petal-by-petal, every frame is aligned by eye, and every parcel is hand-tied with double satin ribbon.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-32 sm:h-40 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
                  alt="Handmade Everlasting Bouquets"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EFE8E1]">
                <p className="font-heading font-medium text-xs text-[#1C1917]">4–6 Hours per Bouquet</p>
                <p className="text-[10px] text-[#78716C] mt-0.5">Individually rolled petals on floral wire.</p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EFE8E1]">
                <p className="font-heading font-medium text-xs text-[#1C1917]">Gold Foil &amp; Glass Frames</p>
                <p className="text-[10px] text-[#78716C] mt-0.5">350 GSM archival stock &amp; Quranic verses.</p>
              </div>
              <div className="h-32 sm:h-40 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                  alt="Custom Framed Keepsakes"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. What We Make — Four Studio Collections */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EFE8E1] pb-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block">
                The Workshop
              </span>
              <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] mt-1">
                What we make with our hands
              </h2>
            </div>
            <Link
              href="/category/all"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1C3B] hover:text-[#5A1230] transition-colors"
            >
              <span>Explore all creations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Bouquets */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8E1] flex flex-col justify-between space-y-3 hover:border-[#7A1C3B]/40 transition">
              <div className="space-y-2.5">
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                  <img
                    src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
                    alt="Paper Flower Bouquets"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-heading font-medium text-base text-[#1C1917]">
                  Everlasting Bouquets
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Sculpted from heavy Italian crepe paper and fine satin ribbon. No water needed, never wilts, and stays pristine for years.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider block pt-2 border-t border-[#FAF7F2]">
                Custom Colors on Request
              </span>
            </div>

            {/* 2. Frames */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8E1] flex flex-col justify-between space-y-3 hover:border-[#7A1C3B]/40 transition">
              <div className="space-y-2.5">
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                    alt="Nikah & Memory Frames"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-heading font-medium text-base text-[#1C1917]">
                  Nikah &amp; Keepsake Frames
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Gold-foiled wedding plaques, Quranic ayah prints, and memory collages custom framed with real glass fronts.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider block pt-2 border-t border-[#FAF7F2]">
                Personalized Names &amp; Dates
              </span>
            </div>

            {/* 3. Jewellery */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8E1] flex flex-col justify-between space-y-3 hover:border-[#7A1C3B]/40 transition">
              <div className="space-y-2.5">
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                  <img
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"
                    alt="Anti-Tarnish Jewellery"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-heading font-medium text-base text-[#1C1917]">
                  Everyday Jewellery
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  316L stainless steel with 18k PVD gold coating. Hypoallergenic, shower-safe, sweatproof, and resistant to tarnishing.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider block pt-2 border-t border-[#FAF7F2]">
                Waterproof &amp; Skin-Safe
              </span>
            </div>

            {/* 4. Hampers & Resin */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8E1] flex flex-col justify-between space-y-3 hover:border-[#7A1C3B]/40 transition">
              <div className="space-y-2.5">
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1]">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
                    alt="Curated Hampers"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-heading font-medium text-base text-[#1C1917]">
                  Curated Hampers
                </h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Bundled gift boxes layered with butter paper, scented botanical tea lights, handwritten notes, and hand-stamped wax seals.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wider block pt-2 border-t border-[#FAF7F2]">
                Ready to Gift Directly
              </span>
            </div>
          </div>
        </section>

        {/* 5. Workshop Principles (Real Human Craft) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE8E1] space-y-8">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block">
              How We Work
            </span>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] mt-1">
              No assembly lines. No plastic fluff.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <Heart className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">
                Made Slow &amp; In-House
              </h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                We craft each order individually right here in our Adirampattinam studio. We don&apos;t dropship or outsource to large factories.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <PackageCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">
                Handwritten &amp; Wax-Sealed
              </h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                If you write a gift note for your loved one, we pen it by hand on textured cream cardstock and seal it with melted wax before closing the box.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h4 className="font-heading font-medium text-base text-[#1C1917]">
                Safe Pan-India Courier
              </h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Every frame and delicate bouquet is cushioned with multi-layer protective padding and packed in heavy corrugated boxes to reach you intact.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Studio Reach & Direct Contact (Real Human Touch) */}
        <section className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8E1]">
            <div>
              <h3 className="font-heading font-normal text-xl sm:text-2xl text-[#1C1917]">
                Get in touch with the studio
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Have a custom idea, a tight wedding deadline, or special wording? Reach out to us directly.
              </p>
            </div>

            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              <span>Browse All Gifts</span>
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
                <span className="block text-[#8C827A] text-[10px] uppercase font-bold">WhatsApp Direct</span>
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
        </section>
      </main>

      {/* Boutique Footer (rendered exclusively on /about page) */}
      <Footer />
    </div>
  );
}
