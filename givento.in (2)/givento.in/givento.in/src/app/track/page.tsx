'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/database';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Search, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

export default function TrackPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    const cleanId = orderId.trim().toUpperCase().replace(/^#/, '');
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanId && !cleanPhone) {
      setError('Please enter your Order Number or your WhatsApp Mobile Number.');
      setIsSearching(false);
      return;
    }

    const orders = await db.getOrders();
    const found = orders.find((o) => {
      const matchId = cleanId && (o.id.toUpperCase() === cleanId || o.id.toUpperCase() === `GVN-${cleanId}`);
      const matchPhone = cleanPhone && o.customerPhone.replace(/\D/g, '').includes(cleanPhone);
      if (cleanId && cleanPhone) return matchId && matchPhone;
      return matchId || matchPhone;
    });

    if (found) {
      router.push(`/order/${found.id}`);
    } else {
      setIsSearching(false);
      setError(
        `No parcel found matching ${cleanId ? '#' + cleanId : ''} ${cleanPhone ? 'phone: ' + cleanPhone : ''}. Please check the details from your WhatsApp confirmation.`
      );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-20 md:pb-0 font-sans">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 sm:px-6 py-12 relative z-10 w-full flex flex-col justify-center">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {/* Tracking Lookup Box */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 relative overflow-hidden">
          <div className="text-center space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase">
              Live Parcel Tracking
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Track Your Order
            </h1>
            <p className="font-sans text-xs text-[#78716C] max-w-sm mx-auto leading-relaxed">
              Enter your Order Number or WhatsApp Mobile Number to view live workshop crafting, packing, and courier dispatch updates.
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1C1917]">
                Order Number
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. GVN-849201"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#7A1C3B] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1C1917]">
                Or WhatsApp / Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9344013255"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#7A1C3B] focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Locating parcel...' : 'Check Status'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#EFE8E1] text-center">
            <span className="text-[11px] text-[#78716C]">
              No password or account required. Every order placed on WhatsApp or Web is tracked in real-time.
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
