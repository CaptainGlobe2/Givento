'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Phone,
  Package,
  Truck,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'orders' | 'delivery' | 'custom' | 'care';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'orders',
    q: 'How does ordering work on Givento?',
    a: 'We keep things simple and personal. You can browse our collection, add items to your bag, and submit your delivery details. We confirm stock and dispatch schedule with you directly on WhatsApp before packing. No upfront online payment gateway friction.',
  },
  {
    category: 'orders',
    q: 'How do I pay for my order?',
    a: 'Once we verify your items and custom details on WhatsApp (+91 93440 13255), we send our studio UPI QR code or bank transfer details. You pay directly with Google Pay, PhonePe, or Paytm once you are completely satisfied with the order preview.',
  },
  {
    category: 'custom',
    q: 'Can I personalize a bouquet or Nikah frame with names and dates?',
    a: 'Absolutely! That is our specialty. For Nikah and memory frames, you can send bride & groom names, Islamic dates, and custom Quranic verses. For everlasting bouquets, you can request specific flower combinations and ribbon colors.',
  },
  {
    category: 'custom',
    q: 'Can I include a handwritten card for the recipient?',
    a: 'Yes, every gift hamper or keepsake can include a handwritten note. We hand-write your custom message on heavy textured cream cardstock and seal it with authentic melted wax.',
  },
  {
    category: 'delivery',
    q: 'How long does delivery take?',
    a: 'Within Tamil Nadu (including Chennai, Coimbatore, Madurai, Trichy), packages typically arrive within 2 to 3 business days. Across other states in India, standard transit takes 4 to 6 business days via DTDC or Professional Couriers. Urgent date requests can be accommodated via Express.',
  },
  {
    category: 'delivery',
    q: 'What if my glass frame or bouquet gets damaged in transit?',
    a: 'We pack each item with multi-layer bubble wrap, protective corner guards, and rigid 5-ply corrugated boxes. In the rare event of transit damage, simply send us an unboxing photo within 24 hours on WhatsApp and we will dispatch a free replacement immediately or issue a full refund without hassle.',
  },
  {
    category: 'delivery',
    q: 'Can I pick up my order in person in Adirampattinam?',
    a: 'Yes! Local pickups from our workshop desk along East Coast Road in Adirampattinam are completely free. Simply select or mention studio pickup when confirming your order.',
  },
  {
    category: 'care',
    q: 'How do I take care of paper flowers and resin keepsakes?',
    a: 'Our everlasting bouquets are made of premium Italian crepe paper and satin. Keep them away from direct moisture, water spray, and prolonged intense sunlight. Lightly dust with a soft makeup brush once a month. Resin trays and clocks can be wiped gently with a microfibre cloth.',
  },
  {
    category: 'care',
    q: 'Is your stainless steel jewellery truly waterproof?',
    a: 'Yes. All our chains, rings, and bracelets are crafted from 316L medical-grade stainless steel with 18k PVD gold vacuum plating. They will not rust, turn skin green, or tarnish when exposed to normal water or sweat.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = selectedCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-10">
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
          <span>Help &amp; FAQs</span>
        </div>

        {/* Header */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6E9EE] border border-[#ECD1DC] text-[#7A1C3B] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Studio Answers &amp; Support</span>
          </div>

          <h1 className="font-heading font-normal text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed font-light">
            Everything you need to know about placing custom orders, delivery timelines, packaging, and how we craft our keepsakes in Adirampattinam.
          </p>
        </section>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-[#EFE8E1] pb-4">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'orders', label: 'Ordering & Payment' },
            { id: 'custom', label: 'Customization & Cards' },
            { id: 'delivery', label: 'Shipping & Delivery' },
            { id: 'care', label: 'Product Care' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#7A1C3B] text-white shadow-xs'
                  : 'bg-white border border-[#EFE8E1] text-[#57534E] hover:border-[#7A1C3B]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-[#EFE8E1] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FAF7F2]/50 transition-colors"
                >
                  <span className="font-heading font-medium text-sm sm:text-base text-[#1C1917]">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#F6E9EE] text-[#7A1C3B]' : 'bg-[#FAF7F2] text-[#8C827A]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#57534E] leading-relaxed border-t border-[#FAF7F2] animate-in fade-in duration-200">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Need Personal Help Callout */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xs">
          <div className="space-y-1 max-w-lg">
            <h3 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
              Still have a specific question?
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              We are real people working in our Adirampattinam studio. Message us anytime for quick answers and custom photo previews.
            </p>
          </div>

          <a
            href="https://wa.me/919344013255?text=Hello%20Givento!%20I%20have%20a%20question%20about%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold transition shadow-xs shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </section>
      </main>
    </div>
  );
}
