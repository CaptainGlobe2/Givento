'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { InstagramIcon } from './Icons';

export default function ExpoSection() {
  return (
    <section id="expos" className="py-10 sm:py-16 bg-[#FAF7F2] border-b border-[#EFE8E1]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-3 border-b border-[#EFE8E1]">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C3B]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#7A1C3B] uppercase">
                Studio Stalls &amp; Exhibitions
              </span>
            </div>
            <h2 className="font-heading font-normal text-2xl sm:text-3xl md:text-4xl text-[#1C1917] tracking-tight">
              Meet Us at Local Expos
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#78716C] mt-1 max-w-xl">
              We love setting up pop-up studio stalls at community fairs and exhibitions across Tamil Nadu so you can touch the petals, try on jewellery, and see custom frames in person.
            </p>
          </div>

          <a
            href="https://www.instagram.com/givento.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:text-[#5A1230] group transition self-start sm:self-auto"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>@givento.in on Instagram</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* 2 Expo Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Upcoming Stall */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE8E1] hover:border-[#7A1C3B]/30 shadow-2xs space-y-4 flex flex-col justify-between transition"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#F6E9EE] text-[#7A1C3B] text-[10px] font-bold tracking-wider uppercase">
                  Upcoming Pop-Up
                </span>
                <span className="text-xs text-[#8C827A] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#7A1C3B]" />
                  <span>Next Exhibition</span>
                </span>
              </div>

              <h3 className="font-heading font-medium text-xl text-[#1C1917]">
                Adirai Handcraft &amp; Boutique Fair
              </h3>

              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Catch our full range of waterproof stainless steel chains, custom gold-foiled Nikah celebration frames, and everlasting crepe paper flower bouquets live at our booth.
              </p>
            </div>

            <div className="pt-3 border-t border-[#FAF7F2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8C827A]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7A1C3B]" />
                <span>Adirampattinam, Tamil Nadu</span>
              </div>
              <a
                href="https://wa.me/919344013255?text=Hi%20Givento!%20When%20is%20your%20next%20expo%20stall?"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#7A1C3B] hover:underline active:scale-95 transition-transform"
              >
                Inquire Stall Dates →
              </a>
            </div>
          </motion.div>

          {/* Card 2: Studio Workshop Desk */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.38, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE8E1] hover:border-[#7A1C3B]/30 shadow-2xs space-y-4 flex flex-col justify-between transition"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#F3ECE2] text-[#8C827A] text-[10px] font-bold tracking-wider uppercase">
                  Permanent Workshop
                </span>
                <span className="text-xs text-[#8C827A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7A1C3B]" />
                  <span>Workshop Desk</span>
                </span>
              </div>

              <h3 className="font-heading font-medium text-xl text-[#1C1917]">
                Direct Studio Visits &amp; Pickups
              </h3>

              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Can&apos;t wait for an expo? You are always welcome to pick up orders directly or consult on custom bridal frames and everlasting bouquets at our studio workspace.
              </p>
            </div>

            <div className="pt-3 border-t border-[#FAF7F2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8C827A]">
              <span className="text-[#8C827A]">
                East Coast Road, Adirampattinam
              </span>
              <a
                href="tel:9344013255"
                className="font-bold text-[#7A1C3B] hover:underline active:scale-95 transition-transform"
              >
                Call Studio Desk →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
