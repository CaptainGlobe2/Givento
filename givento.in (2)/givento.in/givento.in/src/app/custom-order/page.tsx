'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '../../lib/database';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Sparkles,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Gift,
  Heart,
  Send,
} from 'lucide-react';

export default function CustomOrderPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Wedding Favours / Nikah');
  const [quantity, setQuantity] = useState(30);
  const [eventDate, setEventDate] = useState('');
  const [craftPreferences, setCraftPreferences] = useState('Resin Keychains + Mini Bouquets');
  const [colorTheme, setColorTheme] = useState('Sage green, blush & gold');
  const [budgetRange, setBudgetRange] = useState('₹5,000 – ₹10,000');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `req-${Date.now()}`,
      customerName: name,
      customerPhone: phone,
      eventType: `${eventType} (${craftPreferences})`,
      quantity: Number(quantity),
      budgetRange,
      notes: `Event Date: ${eventDate} | Theme: ${colorTheme} | Notes: ${notes}`,
      status: 'New' as const,
      createdAt: new Date().toISOString(),
    };

    // Save into database / storage
    try {
      const saved = JSON.parse(localStorage.getItem('givento_db_requests') || '[]');
      saved.unshift(newReq);
      localStorage.setItem('givento_db_requests', JSON.stringify(saved));
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const waRequestUrl = `https://wa.me/919344013255?text=${encodeURIComponent(
    `Hello Givento! 🌸\n` +
      `I'd like to discuss a *Custom Bulk Order* for my event:\n\n` +
      `*Name:* ${name || 'Friend'}\n` +
      `*Event:* ${eventType}\n` +
      `*Quantity:* ${quantity} units\n` +
      `*Event Date:* ${eventDate || 'Upcoming'}\n` +
      `*Theme / Colors:* ${colorTheme}\n` +
      `*Crafts Desired:* ${craftPreferences}\n` +
      `*Budget Range:* ${budgetRange}\n` +
      (notes ? `*Notes:* ${notes}\n` : '') +
      `\nPlease let me know your custom bulk options & sample proofs! ✨`
  )}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-4">
            <div className="w-20 h-20 bg-[#FDF0F3] rounded-full border border-[#FADDE3] flex items-center justify-center mx-auto text-3xl shadow-xs">
              🎀
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-[#E8F5ED] border border-[#C3E6D0] text-xs font-bold text-[#2C7A54] uppercase tracking-wider">
              Custom Inquiry Received! ✨
            </div>

            <h1 className="font-display font-normal text-3xl text-[#1C1917] tracking-tight">
              Thank You, {name}!
            </h1>

            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed max-w-md mx-auto">
              We have noted your event details for {quantity} units of {eventType}. Our maker will review your color theme and message you on WhatsApp ({phone}) with sample ideas and discounted tier pricing.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={waRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1db954] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat Now on WhatsApp</span>
              </a>

              <Link
                href="/category/all"
                className="px-5 py-3 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs transition"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#EFE8E1] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] font-semibold uppercase tracking-wider text-[#8C827A]">
                <Sparkles className="w-3.5 h-3.5 text-[#7A1C3B]" />
                <span>Bespoke Celebrations &amp; Return Gifts</span>
              </div>
              <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
                Custom Bulk &amp; Wedding Favours Request
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Planning a wedding, baby shower, Nikah, birthday party, or corporate event? Tell us what you envision, and we will tailor custom boxes, tags, and bulk tiers!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="font-display font-normal text-lg text-[#1C1917] border-b border-[#EFE8E1] pb-2">
                  1. Your Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Your Name <span className="text-[#B3261E]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Khan"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      WhatsApp Phone Number <span className="text-[#B3261E]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Event & Craft Specifications */}
              <div className="bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="font-display font-normal text-lg text-[#1C1917] border-b border-[#EFE8E1] pb-2">
                  2. Event &amp; Gift Vision
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Occasion / Celebration:
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    >
                      <option value="Wedding Favours / Nikah">Wedding Favours / Nikah</option>
                      <option value="Bridesmaid Proposal Hampers">Bridesmaid Proposal Hampers</option>
                      <option value="Birthday Return Gifts">Birthday Return Gifts</option>
                      <option value="Baby Shower / Welcome">Baby Shower / Newborn Welcome</option>
                      <option value="Corporate / Festive Gifting">Corporate / Festive Gifting</option>
                      <option value="Other Bespoke Gift">Other Bespoke Request</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Estimated Quantity:
                    </label>
                    <input
                      type="number"
                      min={5}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Event Date (or needed by):
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="e.g. 20 December 2026"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Expected Budget Range:
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    >
                      <option value="Under ₹3,000">Under ₹3,000</option>
                      <option value="₹3,000 – ₹7,000">₹3,000 – ₹7,000</option>
                      <option value="₹7,000 – ₹15,000">₹7,000 – ₹15,000</option>
                      <option value="₹15,000 – ₹30,000">₹15,000 – ₹30,000</option>
                      <option value="₹30,000+">₹30,000+</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Craft Elements You Prefer:
                    </label>
                    <input
                      type="text"
                      value={craftPreferences}
                      onChange={(e) => setCraftPreferences(e.target.value)}
                      placeholder="e.g. Gold flake Arabic keychains, scented candles, and mini rose bouquets"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Color Palette / Theme Details:
                    </label>
                    <input
                      type="text"
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      placeholder="e.g. Peach, ivory, gold ribbons with custom thank-you tags"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Specific Notes or Instagram Reference:
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Paste an Instagram reel link or describe what you want written on the tags..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-end pt-2">
                <a
                  href={waRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 bg-white border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                  <span>Send via WhatsApp First</span>
                </a>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Custom Request</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
