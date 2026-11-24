'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  PackageCheck,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C827A]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span>Delivery &amp; Customer Support</span>
        </div>

        {/* Hero Section with Animation */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6E9EE] border border-[#ECD1DC] text-[#7A1C3B] text-xs font-semibold">
            <Truck className="w-3.5 h-3.5 animate-bounce" />
            <span>Safe Pan-India Studio Dispatch</span>
          </div>

          <h1 className="font-heading font-normal text-3xl sm:text-5xl text-[#1C1917] tracking-tight leading-tight">
            How your gifts are packed and delivered.
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed font-light">
            Every bouquet, framed memory, and piece of jewellery is hand-crafted, carefully inspected, and packed in heavy corrugated boxes so it reaches your recipient in pristine condition.
          </p>
        </section>

        {/* 4-Step Animated Journey */}
        <section className="space-y-6">
          <div className="border-b border-[#EFE8E1] pb-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block">
              The Journey
            </span>
            <h2 className="font-heading font-normal text-2xl text-[#1C1917] mt-0.5">
              From our studio table to your doorstep
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EFE8E1] space-y-3 hover:border-[#7A1C3B]/30 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="font-heading font-medium text-base text-[#1C1917]">
                Studio Crafting
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                1–2 business days. Flowers are hand-folded, frames are personalized, and jewellery is polished.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EFE8E1] space-y-3 hover:border-[#7A1C3B]/30 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="font-heading font-medium text-base text-[#1C1917]">
                Deluxe Packaging
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Butter paper, protective bubble cushioning, hand-tied satin ribbon, and a wax-sealed handwritten note.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EFE8E1] space-y-3 hover:border-[#7A1C3B]/30 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="font-heading font-medium text-base text-[#1C1917]">
                Courier Dispatch
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Dispatched via DTDC, Professional, or India Post. Live tracking ID is sent to your WhatsApp immediately.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-5 border border-[#EFE8E1] space-y-3 hover:border-[#7A1C3B]/30 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="font-heading font-medium text-base text-[#1C1917]">
                Safe Arrival
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Delivered safely to the recipient&apos;s hands, ready to bring smiles and unboxing joy.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Rates & Timelines Table */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8E1] space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7A1C3B] uppercase block">
              Transit Estimates
            </span>
            <h3 className="font-heading font-normal text-xl sm:text-2xl text-[#1C1917]">
              Delivery Rates by Region
            </h3>
          </div>

          <div className="divide-y divide-[#EFE8E1] text-xs sm:text-sm">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <b className="text-[#1C1917] block font-medium">Adirampattinam Local Studio Pickup</b>
                <span className="text-[#8C827A] text-xs">East Coast Road, Adirampattinam</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#7A1C3B]">FREE</span>
                <span className="block text-[11px] text-[#8C827A]">Ready in 24 hrs</span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <b className="text-[#1C1917] block font-medium">Tamil Nadu Express</b>
                <span className="text-[#8C827A] text-xs">Chennai, Coimbatore, Madurai, Trichy, Salem, etc.</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#1C1917]">₹50 <span className="text-[10px] text-[#8C827A] font-normal">(Free over ₹899)</span></span>
                <span className="block text-[11px] text-[#8C827A]">2 – 3 business days</span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <b className="text-[#1C1917] block font-medium">Rest of India</b>
                <span className="text-[#8C827A] text-xs">Bangalore, Mumbai, Delhi, Hyderabad, Kolkata, etc.</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#1C1917]">₹70 <span className="text-[10px] text-[#8C827A] font-normal">(Free over ₹999)</span></span>
                <span className="block text-[11px] text-[#8C827A]">4 – 6 business days</span>
              </div>
            </div>
          </div>
        </section>

        {/* 100% Safe Transit Guarantee */}
        <section className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-lg text-[#1C1917]">
                100% Damage-Free Guarantee
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                We take full responsibility for our gifts while they are on the road.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            In the rare event that your package arrives damaged, take a quick photo of the box and item within 24 hours of delivery and send it to our studio WhatsApp at <strong>+91 93440 13255</strong>. We will send an immediate free replacement or issue a full refund without arguments.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/919344013255"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Delivery Desk</span>
            </a>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#EFE8E1] text-[#1C1917] text-xs font-semibold hover:border-[#7A1C3B] transition"
            >
              <span>Track Existing Order</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
