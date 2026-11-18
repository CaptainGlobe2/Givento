'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { InstagramIcon, WhatsAppIcon } from '../../components/Icons';
import { MapPin, Mail, MessageCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waUrl = `https://wa.me/919344013255?text=${encodeURIComponent(
      `Hello Givento! 🌸\n` +
        `My name is ${name} (${phone}).\n` +
        `Message: ${message}`
    )}`;
    window.open(waUrl, '_blank');
    setSent(true);
  };

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

        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 relative overflow-hidden">
          <div className="text-center space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] font-semibold uppercase tracking-wider text-[#8C827A]">
              <Sparkles className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>We Love Hearing From You</span>
            </div>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Contact Our Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto">
              Whether you have a custom photo frame question or want to collaborate at an expo, drop us a line!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Contact Information Cards */}
            <div className="space-y-3 text-xs">
              {/* WhatsApp Direct */}
              <a
                href="https://wa.me/919344013255?text=Hi%20Givento!%20Connecting%20from%20your%20website"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-[#FAF7F2]/60 border border-[#EFE8E1] hover:border-[#DFD5CB] rounded-2xl shadow-2xs flex items-start gap-3.5 transition block"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center flex-shrink-0 text-[#25D366]">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-normal text-base text-[#1C1917]">WhatsApp Studio Chat</h3>
                  <p className="text-[#57534E] mt-0.5 font-medium">+91 93440 13255</p>
                  <span className="text-xs text-[#7A1C3B] font-semibold">
                    Fastest reply · Usually replies within an hour ✨
                  </span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/givento.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-[#FAF7F2]/60 border border-[#EFE8E1] hover:border-[#DFD5CB] rounded-2xl shadow-2xs flex items-start gap-3.5 transition block"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FDF0F3] border border-[#FADDE3] flex items-center justify-center flex-shrink-0 text-[#7A1C3B]">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-normal text-base text-[#1C1917]">Instagram DM</h3>
                  <p className="text-[#57534E] mt-0.5 font-medium">@givento.in</p>
                  <span className="text-xs text-[#7A1C3B] font-semibold">
                    Tag us in your unboxing videos!
                  </span>
                </div>
              </a>

              {/* Studio Location */}
              <div className="p-4 bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center flex-shrink-0 text-[#7A1C3B]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-normal text-base text-[#1C1917]">Workshop Studio</h3>
                  <p className="text-[#57534E] mt-0.5">
                    Adirampattinam &amp; Kozhikode Corridor, India
                  </p>
                  <span className="text-[11px] text-[#8C827A]">
                    * Visits by appointment &amp; pop-up expos
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center flex-shrink-0 text-[#7A1C3B]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-normal text-base text-[#1C1917]">Studio Email</h3>
                  <p className="text-[#57534E] mt-0.5 font-medium">hello@givento.in</p>
                </div>
              </div>
            </div>

            {/* Quick Message Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl p-6 shadow-2xs space-y-4 text-xs"
            >
              <h3 className="font-display font-normal text-lg text-[#1C1917] border-b border-[#EFE8E1] pb-2">
                Send a Note to the Maker
              </h3>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#1C1917]">Your Name <span className="text-[#B3261E]">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#1C1917]">WhatsApp Phone <span className="text-[#B3261E]">*</span></label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9845012345"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#1C1917]">Your Note / Question <span className="text-[#B3261E]">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about a custom bouquet size, Arabic spelling, or expo dates..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message on WhatsApp</span>
              </button>

              {sent && (
                <div className="p-3 bg-[#E8F5ED] border border-[#C3E6D0] rounded-xl text-center text-xs text-[#2C7A54] font-semibold">
                  Message launched on WhatsApp! Talk to you shortly ✨
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
