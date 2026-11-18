'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { MapPin, Phone, ArrowLeft, Send, Mail, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waUrl = `https://wa.me/919344013255?text=${encodeURIComponent(
      `Hello Givento! 🌸\n` +
        `Name: ${name}\n` +
        `Contact: ${phoneOrEmail}\n` +
        `Message: ${message}`
    )}`;
    window.open(waUrl, '_blank');
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-20 md:pb-0">
      <Navbar />

      {/* 1. Hero Header (Matching Image 2: Dark Atmospheric Hero with Centered Header & Subtext) */}
      <section className="relative w-full bg-[#1C1917] text-white py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Image with Dark Tint Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80)',
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1917]/70 via-[#1C1917]/90 to-[#1C1917]" />

        <div className="relative z-10 max-w-xl mx-auto text-center space-y-3">
          <h1 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed max-w-md mx-auto">
            We&apos;re here to help! From bespoke keepsake inquiries to courier tracking updates, feel free to connect with our studio.
          </p>
        </div>
      </section>

      {/* 2. Main Content (Matching Image 2 Layout: Stacked Location Cards + "SEND US MESSAGE" Form Card) */}
      <main className="flex-1 max-w-xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 w-full space-y-4 pb-12">
        {/* Back Link */}
        <div className="flex items-center justify-between pb-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:text-[#5A1230] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
          <span className="text-[11px] text-[#78716C] font-medium">
            Studio Hours: 9 AM – 8 PM IST
          </span>
        </div>

        {/* Location Card 1 (Matching "USA" card in Image 2) */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="font-bold text-xs sm:text-[13px] tracking-wider text-[#1C1917] uppercase">
            ADIRAMPATTINAM STUDIO
          </h2>

          <div className="space-y-2 text-xs sm:text-sm text-[#57534E]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#7A1C3B] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                East Coast Road, Adirampattinam, Thanjavur District, 614701, Tamil Nadu, India.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <Phone className="w-4 h-4 text-[#7A1C3B] shrink-0" />
              <a
                href="tel:9344013255"
                className="font-medium hover:text-[#7A1C3B] transition-colors"
              >
                +91 93440 13255
              </a>
            </div>
          </div>
        </div>

        {/* Location Card 2 (Matching "INDIA" card in Image 2) */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="font-bold text-xs sm:text-[13px] tracking-wider text-[#1C1917] uppercase">
            PAN-INDIA DISPATCH &amp; CONCIERGE
          </h2>

          <div className="space-y-2 text-xs sm:text-sm text-[#57534E]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#7A1C3B] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Daily express dispatch across 19,000+ pincodes via Bluedart, DTDC &amp; Speed Post.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <Mail className="w-4 h-4 text-[#7A1C3B] shrink-0" />
              <a
                href="mailto:hello@givento.in"
                className="font-medium hover:text-[#7A1C3B] transition-colors"
              >
                hello@givento.in
              </a>
            </div>
          </div>
        </div>

        {/* 3. Form Card (Matching "SEND US MESSAGE" section in Image 2) */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-xs sm:text-[13px] tracking-wider text-[#1C1917] uppercase">
            SEND US MESSAGE
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Input */}
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] focus:ring-1 focus:ring-[#7A1C3B] transition"
              />
            </div>

            {/* Email / WhatsApp Input */}
            <div>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="WhatsApp Number or E-mail id"
                className="w-full px-4 py-3 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] focus:ring-1 focus:ring-[#7A1C3B] transition"
              />
            </div>

            {/* Message Textarea */}
            <div>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message or custom order inquiry..."
                className="w-full px-4 py-3 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] focus:ring-1 focus:ring-[#7A1C3B] transition resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>

            {sent && (
              <div className="p-3 bg-[#E8F5ED] border border-[#C3E6D0] rounded-xl text-center text-xs text-[#2C7A54] font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2C7A54]" />
                <span>Message opened on WhatsApp! Talk to you shortly ✨</span>
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}