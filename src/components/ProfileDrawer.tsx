'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
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
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBasket } from '../context/BasketContext';
import { useWishlist } from '../context/WishlistContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, displayName, customerEmail, customerPhone, signOut } = useAuth();
  const { itemCount } = useBasket();
  const { wishlistCount } = useWishlist();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.96 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.96 }}
            transition={{ type: 'spring', damping: 34, stiffness: 360, mass: 0.85 }}
            className="relative w-[88vw] sm:w-full max-w-sm rounded-l-3xl sm:rounded-none bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto font-sans"
            aria-label="Profile and Account Drawer"
          >
            {/* Header (Matching Home Page Typography & Warm Cream Palette) */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.04 }}
              className="p-5 border-b border-[#EFE8E1] bg-[#FAF7F2] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase mb-1">
                    {user ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Customer Account</span>
                      </>
                    ) : (
                      <span>Givento Studio</span>
                    )}
                  </span>
                  <h2 className="font-display font-normal text-2xl text-[#1C1917] tracking-tight leading-tight truncate">
                    Welcome, {displayName}
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5 truncate">
                    {user
                      ? `${customerEmail}${customerPhone ? ` · +91 ${customerPhone}` : ''}`
                      : 'Handcrafted in Adirampattinam, Tamil Nadu'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:bg-[#FAF7F2] hover:rotate-90 active:scale-90 transition-all duration-200 cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close profile drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:border-[#7A1C3B] text-center transition"
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                    className="py-2 px-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-[#B3261E] hover:bg-rose-100 inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Customer Sign In / Register</span>
                </Link>
              )}
            </motion.div>

            {/* Quick Links List */}
            <div className="p-4 space-y-2.5 flex-1 bg-[#FAF7F2]/30">
              {[
                {
                  href: '/track',
                  title: 'Track My Order',
                  subtitle: 'Live courier & crafting status',
                  icon: Package,
                  iconBoxClass: 'bg-[#F6E9EE] text-[#7A1C3B]',
                  external: false,
                },
                {
                  href: '/wishlist',
                  title: 'My Wishlist',
                  subtitle: `${wishlistCount} saved keepsake${wishlistCount === 1 ? '' : 's'}`,
                  icon: Heart,
                  iconBoxClass: 'bg-[#F6E9EE] text-[#E0607E]',
                  external: false,
                },
                {
                  href: '/cart',
                  title: 'Shopping Cart',
                  subtitle: `${itemCount} item${itemCount === 1 ? '' : 's'} in bag`,
                  icon: ShoppingBag,
                  iconBoxClass: 'bg-[#FBF3E4] text-[#C5A059]',
                  external: false,
                },
                {
                  href: 'https://wa.me/919344013255?text=Hi%20Givento!%20I%20have%20a%20question%20about%20custom%20gifts.',
                  title: 'WhatsApp Concierge',
                  subtitle: 'Direct chat: +91 93440 13255',
                  icon: MessageCircle,
                  iconBoxClass: 'bg-[#FDF0F3] text-[#7A1C3B]',
                  external: true,
                },
              ].map((item, idx) => {
                const IconComp = item.icon;
                const cardClass =
                  'flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-xs transition-all group cursor-pointer';
                const cardInner = (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${item.iconBoxClass}`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <b className="text-sm font-semibold text-[#1C1917] block">{item.title}</b>
                        <span className="text-xs text-[#78716C]">{item.subtitle}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A8A29E] group-hover:translate-x-0.5 transition-transform" />
                  </>
                );

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.26, delay: 0.05 + idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cardClass}
                      >
                        {cardInner}
                      </a>
                    ) : (
                      <Link href={item.href} onClick={onClose} className={cardClass}>
                        {cardInner}
                      </Link>
                    )}
                  </motion.div>
                );
              })}

              <div className="h-px bg-[#EFE8E1] my-3" />

              {/* Additional Links */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.24 }}
                className="space-y-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event('open-welcome-modal'));
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white active:scale-[0.98] transition-all cursor-pointer text-left"
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
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white hover:shadow-2xs active:scale-[0.98] transition-all"
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
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white hover:shadow-2xs active:scale-[0.98] transition-all"
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#1C1917] hover:bg-white active:scale-[0.98] transition-all"
                >
                  <span className="flex items-center gap-2.5 text-[#44403C]">
                    <MapPin className="w-4 h-4 text-[#8C827A]" />
                    About Our Adiram Studio
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                </Link>
              </motion.div>
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
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
