'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function WelcomeModal({ forceOpen, onClose }: WelcomeModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener('open-welcome-modal', handleCustomOpen);

    // Auto-open onboarding dialog only on the Storefront Home page so direct links (product, cart, category) are never obscured
    if (forceOpen !== undefined || pathname !== '/') {
      return () => {
        window.removeEventListener('open-welcome-modal', handleCustomOpen);
      };
    }

    try {
      const hasSeen = localStorage.getItem('givento_welcomed_v2');
      if (!hasSeen) {
        // Show after a brief delay for smooth appearance on first open
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('open-welcome-modal', handleCustomOpen);
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('open-welcome-modal', handleCustomOpen);
    };
  }, [forceOpen, pathname]);

  const effectiveOpen = forceOpen !== undefined ? forceOpen : isOpen;

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('givento_welcomed_v2', 'true');
    } catch {
      // ignore
    }
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {effectiveOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Givento Studio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
        >
          {/* Modal Container matching layout and brand styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm sm:max-w-md max-h-[92dvh] overflow-y-auto bg-[#FAF7F2] rounded-[32px] sm:rounded-[36px] border border-[#EFE8E1] shadow-2xl flex flex-col p-5 sm:p-8 text-center select-none"
          >
        {/* Artistic minimalist doodle background lines */}
        <div className="absolute top-4 left-4 w-24 h-24 opacity-30 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="stroke-[#7A1C3B]">
            <path d="M10,30 Q30,5 50,30 T90,30" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M15,45 Q40,25 65,50" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="absolute bottom-6 left-3 w-28 h-28 opacity-25 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="stroke-[#B98A2E]">
            <path d="M20,80 C10,50 40,30 30,10 C50,25 70,60 50,90 Z" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Top Header: Close / Skip button */}
        <div className="flex items-center justify-between w-full mb-3 z-10">
          <span className="text-[11px] font-semibold text-[#8C827A] tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B98A2E]" />
            <span>Givento Studio</span>
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close welcome"
            className="w-8 h-8 rounded-full bg-white/90 border border-[#EFE8E1] flex items-center justify-center text-[#78716C] hover:text-[#7A1C3B] shadow-2xs hover:bg-white active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staggered Floating Product Cards (Matching Image 4 Layout) */}
        <div className="relative w-full h-44 sm:h-52 my-3 flex items-center justify-center">
          {/* Card 1: Left Tilted (Crochet Sunflower Bouquet) */}
          <div className="absolute left-2 sm:left-4 top-2 w-28 sm:w-32 aspect-3/4 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white -rotate-6 transform hover:rotate-0 transition-transform duration-300 bg-white">
            <img
              src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80"
              alt="Handmade flower bouquet"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/sunflower-bouquet.svg';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent text-white text-[9px] font-bold text-center">
              Bouquets 🌻
            </div>
          </div>

          {/* Card 2: Center Main (Luxury Bespoke Gift Hamper) */}
          <div className="relative z-10 w-36 sm:w-44 aspect-3/4 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white transform hover:scale-105 transition-transform duration-300 bg-white">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80"
              alt="Luxury bespoke gift hamper"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/gift-for-her.svg';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-bold text-center">
              Gift Hampers 🎀
            </div>
          </div>

          {/* Card 3: Right Tilted (Stainless Steel Jewellery & Keepsakes) */}
          <div className="absolute right-2 sm:right-4 top-2 w-28 sm:w-32 aspect-3/4 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white rotate-6 transform hover:rotate-0 transition-transform duration-300 bg-white">
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80"
              alt="Anti-tarnish jewellery & keepsakes"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/starlight-chain.svg';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent text-white text-[9px] font-bold text-center">
              Jewellery ✨
            </div>
          </div>
        </div>

        {/* Headline & Description (Content tailored to website per instruction) */}
        <div className="space-y-2 mt-2 px-2 z-10">
          <h2 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight leading-tight">
            Start Finding Your <br />
            <span className="italic font-display text-[#7A1C3B]">Cherished &amp; Handcrafted</span> <br />
            Gifting Style
          </h2>

          <p className="text-xs text-[#78716C] max-w-xs mx-auto leading-relaxed">
            Everlasting crochet bouquets, personalised resin memories, and curated gift hampers handcrafted with love in Adiram.
          </p>
        </div>

        {/* Pagination Indicator Dots (Matching Image 4) */}
        <div className="flex items-center justify-center gap-1.5 my-4">
          <span className="w-2 h-2 rounded-full bg-[#D5CCC3]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C3B]" />
          <span className="w-2 h-2 rounded-full bg-[#D5CCC3]" />
        </div>

        {/* CTA "Get Started" Button with Artistic Loop Oval (Matching Image 4) */}
        <div className="relative inline-flex items-center justify-center mt-1 mb-2 z-10">
          <div className="relative group">
            {/* Hand-drawn oval contour ring */}
            <svg
              className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none stroke-[#7A1C3B]/40 group-hover:stroke-[#7A1C3B] transition-colors"
              viewBox="0 0 170 65"
              fill="none"
            >
              <path
                d="M12,32 C12,14 40,6 85,6 C135,6 160,16 160,32 C160,48 130,58 85,58 C35,58 6,48 12,32"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>

            <button
              type="button"
              onClick={handleDismiss}
              className="relative px-9 py-3 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white font-heading font-medium text-sm sm:text-base tracking-wide shadow-md active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        <p className="text-[10px] text-[#A39992] mt-1">
          Hand-packed with love · Pan-India delivery 🌸
        </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
