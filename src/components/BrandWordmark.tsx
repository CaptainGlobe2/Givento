'use client';

import React, { useId } from 'react';

interface BrandWordmarkProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

export default function BrandWordmark({
  variant = 'light',
  size = 'md',
  className = '',
}: BrandWordmarkProps) {
  const uid = useId().replace(/:/g, '');
  const isLight = variant === 'light';
  const isSmall = size === 'sm';

  const foilClass = isLight ? 'givento-foil-light' : 'givento-foil-dark';
  const goldAccent = isLight ? 'text-[#F7D983]' : 'text-[#B98A2E]';
  const goldMain = isLight ? '#F7D983' : '#B98A2E';
  const goldSoft = isLight ? '#FFF4D2' : '#7A1C3B';

  const crescentGradId = `givento-crescent-${uid}`;
  const arcGradId = `givento-arc-${uid}`;
  const ribbonGradId = `givento-ribbon-${uid}`;

  return (
    <span
      className={`group relative inline-flex items-center select-none leading-none active:scale-95 transition-transform duration-200 font-brand ${
        isSmall ? 'gap-2 text-[22px]' : 'gap-2 sm:gap-2.5 text-[23px] sm:text-[28px]'
      } ${className}`}
    >
      {/* Subtle Ambient Candlelight Aura (on burgundy backgrounds) */}
      {isLight && (
        <span
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-1.5 rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(247, 217, 131, 0.16) 0%, rgba(247, 217, 131, 0) 72%)',
          }}
        />
      )}

      {/* Main Signature Wordmark with Custom Botanical-Ribbon Filigree */}
      <span className="relative inline-flex items-baseline font-semibold tracking-[0.02em]">
        {/* Architectural G cradled by a bespoke gold filigree crescent */}
        <span className="relative inline-block leading-none mr-[0.5px]">
          <svg
            viewBox="0 0 28 30"
            fill="none"
            aria-hidden="true"
            className="absolute -left-[0.22em] -bottom-[0.08em] w-[1.12em] h-[1.16em] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-6"
          >
            <defs>
              <linearGradient id={crescentGradId} x1="2" y1="26" x2="22" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={goldMain} stopOpacity="0.95" />
                <stop offset="65%" stopColor={goldSoft} stopOpacity="0.7" />
                <stop offset="100%" stopColor={goldMain} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Outer delicate filigree crescent cradling the G */}
            <path
              d="M17.5 3.5C9.5 4.2 3.2 10.5 3.8 18.2C4.3 24.4 9.6 28.4 16.5 27.6"
              stroke={`url(#${crescentGradId})`}
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            {/* Tiny jewel pearl accent at crescent tail */}
            <circle cx="17.8" cy="3.6" r="1.35" fill={goldMain} />
            <circle cx="16.8" cy="27.5" r="1" fill={goldSoft} opacity="0.85" />
          </svg>

          <span className={`relative z-10 font-bold text-[1.08em] leading-none ${foilClass}`}>
            G
          </span>
        </span>

        {/* Dotless i crowned with an 8-ray faceted studio star + calligraphy ribbon bridge */}
        <span className="relative inline-block leading-none">
          <span className={foilClass}>{'\u0131'}</span>

          {/* Multi-facet Atelier North Star replacing dot */}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 -top-[0.04em] w-[0.44em] h-[0.44em] pointer-events-none givento-star-twinkle group-hover:rotate-90 group-hover:scale-125 transition-transform duration-500"
          >
            <path
              d="M10 0.8L11.7 7.6L18.8 10L11.7 12.4L10 19.2L8.3 12.4L1.2 10L8.3 7.6L10 0.8Z"
              fill={goldMain}
            />
            <path
              d="M10 4.5L13.5 10L10 15.5L6.5 10L10 4.5Z"
              fill={goldSoft}
              opacity="0.7"
            />
          </svg>

          {/* Hairline Silk Thread Arch sweeping delicately across 'iven' toward 't' */}
          <svg
            viewBox="0 0 72 16"
            fill="none"
            aria-hidden="true"
            className="absolute left-[0.22em] -top-[0.14em] w-[2.7em] h-[0.6em] pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          >
            <defs>
              <linearGradient id={arcGradId} x1="0" y1="8" x2="72" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={goldMain} stopOpacity="0.85" />
                <stop offset="50%" stopColor={goldSoft} stopOpacity="0.65" />
                <stop offset="100%" stopColor={goldMain} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M2 10.5C22 1.5 48 1.5 68 8.5"
              stroke={`url(#${arcGradId})`}
              strokeWidth="1.05"
              strokeLinecap="round"
              strokeDasharray="1.5 2.5"
            />
            <circle cx="44" cy="4.2" r="0.9" fill={goldMain} opacity="0.85" />
          </svg>
        </span>

        {/* Upright sculpted middle into silky italic cadence */}
        <span className={foilClass}>ven</span>
        <span className={`italic font-semibold pr-[2.5px] ${foilClass}`}>to</span>
      </span>

      {/* Diamond-Beaded Center Hairline Divider */}
      <span
        aria-hidden="true"
        className="relative inline-flex flex-col items-center justify-center shrink-0 h-5"
      >
        <span
          className={`w-[1px] flex-1 bg-gradient-to-b ${
            isLight ? 'from-transparent to-[#F7D983]/75' : 'from-transparent to-[#B98A2E]/70'
          }`}
        />
        <span
          className="w-[4px] h-[4px] rotate-45 my-[1.5px] transition-transform duration-300 group-hover:rotate-[135deg]"
          style={{ backgroundColor: goldMain }}
        />
        <span
          className={`w-[1px] flex-1 bg-gradient-to-t ${
            isLight ? 'from-transparent to-[#F7D983]/75' : 'from-transparent to-[#B98A2E]/70'
          }`}
        />
      </span>

      {/* Asymmetric Stacked .in Domain Stamp + Hand-Tied Gift Ribbon Bow */}
      <span className="relative inline-flex flex-col items-center justify-center leading-none gap-[2.5px]">
        <span
          className={`italic font-semibold tracking-[0.06em] ${
            isSmall ? 'text-[11px]' : 'text-[11px] sm:text-[13px]'
          } ${goldAccent}`}
        >
          .in
        </span>

      {/* Delicate Sculpted Silk Bow Knot beneath .in */}
        <svg
          viewBox="0 0 28 11"
          fill="none"
          aria-hidden="true"
          className={`overflow-visible givento-ribbon-breathe transition-transform duration-300 group-hover:scale-110 ${
            isSmall ? 'w-5 h-[7px]' : 'w-[22px] sm:w-6 h-[8px]'
          }`}
        >
          <defs>
            <linearGradient id={ribbonGradId} x1="0" y1="5" x2="28" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={goldMain} stopOpacity="0.65" />
              <stop offset="50%" stopColor={goldSoft} stopOpacity="1" />
              <stop offset="100%" stopColor={goldMain} stopOpacity="0.65" />
            </linearGradient>
          </defs>
          {/* Left ribbon loop */}
          <path
            d="M14 5.5C11 1.5 5 1.8 5.2 4.8C5.4 7.3 10.6 7 14 5.5Z"
            stroke={`url(#${ribbonGradId})`}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Right ribbon loop */}
          <path
            d="M14 5.5C17 1.5 23 1.8 22.8 4.8C22.6 7.3 17.4 7 14 5.5Z"
            stroke={`url(#${ribbonGradId})`}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Trailing delicate ribbon tails */}
          <path
            d="M12.5 6.2L9.5 10M15.5 6.2L18.5 10"
            stroke={goldMain}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Center knot */}
          <circle cx="14" cy="5.5" r="1.45" fill={goldMain} />
        </svg>
      </span>
    </span>
  );
}
