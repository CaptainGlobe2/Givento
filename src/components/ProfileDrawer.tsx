'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Package,
  Heart,
  ShoppingBag,
  MessageCircle,
  HelpCircle,
  Shield,
  Store,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-300 font-sans"
        aria-label="Profile and Account Drawer"
      >
        {/* Header (Matching Home Page Typography & Warm Cream Palette) */}
        <div className="p-5 border-b border-[#EFE8E1] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase mb-1">
              Givento Studio
            </span>
            <h2 className="font-display font-normal text-2xl text-[#1C1917] tracking-tight leading-tight">
              Welcome, Guest
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Handcrafted in Adirampattinam, Tamil Nadu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
            aria-label="Close profile drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Links List */}
        <div className="p-4 space-y-2.5 flex-1 bg-[#FAF7F2]/30">
          {/* 1. Track Orders */}
          <Link
            href="/track"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <b className="text-sm font-semibold text-[#1C1917] block">Track My Order</b>
                <span className="text-xs text-[#78716C]">Live courier &amp; crafting status</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 2. My Wishlist */}
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6E9EE] text-[#E0607E] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <b className="text-sm font-semibold text-[#1C1917] block">My Wishlist</b>
                <span className="text-xs text-[#78716C]">
                  {wishlistCount} saved keepsake{wishlistCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 3. Shopping Bag */}
          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBF3E4] text-[#C5A059] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <b className="text-sm font-semibold text-[#1C1917] block">Shopping Cart</b>
                <span className="text-xs text-[#78716C]">
                  {itemCount} item{itemCount === 1 ? '' : 's'} in bag
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 4. WhatsApp Concierge */}
          <a
            href="https://wa.me/919344013255?text=Hi%20Givento!%20I%20have%20a%20question%20about%20custom%20gifts."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF0F3] text-[#7A1C3B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <b className="text-sm font-semibold text-[#1C1917] block">WhatsApp Concierge</b>
                <span className="text-xs text-[#78716C]">Direct chat: +91 93440 13255</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* 5. Custom Handcrafted Orders */}
          <Link
            href="/custom-order"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3ECE2] text-[#8C827A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <b className="text-sm font-semibold text-[#1C1917] block">Custom Gift Orders</b>
                <span className="text-xs text-[#78716C]">Personalised bouquets &amp; frames</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="h-px bg-[#EFE8E1] my-3" />

          {/* Additional Links */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event('open-welcome-modal'));
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5 text-[#44403C]">
                <Sparkles className="w-4 h-4 text-[#7A1C3B]" />
                Explore Welcome Story
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            </button>

            <Link
              href="/faq"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white hover:shadow-2xs transition-all"
            >
              <span className="flex items-center gap-2.5 text-[#44403C]">
                <HelpCircle className="w-4 h-4 text-[#7A1C3B]" />
                Help &amp; FAQs
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            </Link>

            <Link
              href="/delivery"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white hover:shadow-2xs transition-all"
            >
              <span className="flex items-center gap-2.5 text-[#44403C]">
                <Shield className="w-4 h-4 text-[#7A1C3B]" />
                Delivery &amp; Customer Support
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            </Link>

            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white transition-colors"
            >
              <span className="flex items-center gap-2.5 text-[#44403C]">
                <MapPin className="w-4 h-4 text-[#8C827A]" />
                About Our Adiram Studio
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            </Link>
          </div>
        </div>

        {/* Footer with Admin Portal link */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EFE8E1] text-center">
          <Link
            href="/admin/login"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#7A1C3B] font-semibold transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Admin Sign In</span>
          </Link>
          <p className="text-[11px] text-[#A8A29E] mt-1">
            © Givento.in · Handcrafted with love
          </p>
        </div>
      </aside>
    </div>
  );
}
