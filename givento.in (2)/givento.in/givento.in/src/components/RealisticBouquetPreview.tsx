'use client';

import React, { useMemo } from 'react';
import { PrototypeWrappingSheet, PrototypeBouquetSize, PrototypeBouquetItem } from '../data/prototypeData';
import { Decoration } from '../types/master';

export interface RealisticBouquetItem {
  id?: string;
  name?: string;
  group?: string;
  shape: string;
  color?: string;
  fresh?: boolean;
}

interface RealisticBouquetPreviewProps {
  sheet: PrototypeWrappingSheet;
  size: PrototypeBouquetSize;
  expandedItems: (PrototypeBouquetItem | RealisticBouquetItem)[];
  selectedDecorations?: string[];
  decorations?: Decoration[];
  recipientName?: string;
  className?: string;
}

export default function RealisticBouquetPreview({
  sheet,
  size,
  expandedItems,
  selectedDecorations = [],
  decorations = [],
  recipientName = '',
  className = '',
}: RealisticBouquetPreviewProps) {
  // Determine sheet styles and textures
  const isBlackGold = sheet.id === 's1' || sheet.name.toLowerCase().includes('black');
  const isPink = sheet.id === 's3' || sheet.name.toLowerCase().includes('pink');
  const isKraft = sheet.id === 's4' || sheet.name.toLowerCase().includes('kraft');
  const isLilac = sheet.id === 's5' || sheet.name.toLowerCase().includes('lilac');
  const isDots = !!sheet.dots || sheet.id === 's2';

  const baseColor = sheet.base || (isBlackGold ? '#1c181b' : isPink ? '#f7cbd6' : isKraft ? '#c29b72' : '#ffffff');
  const trimColor = sheet.trim || (isBlackGold ? '#e5b338' : isPink ? '#ffffff' : isKraft ? '#8e2343' : '#231a1d');

  // Check if fairy lights or sparkles are selected
  const hasFairyLights = selectedDecorations.some((id) => {
    const d = decorations.find((x) => x.id === id);
    return d?.name.toLowerCase().includes('light') || d?.name.toLowerCase().includes('fairy');
  });

  // Calculate tiered positions for up to 15 items
  const placedItems = useMemo(() => {
    const count = expandedItems.length;
    if (count === 0) return [];

    // Separate items by priority (tallest / background to foreground)
    // Photos & tall chocolates in back, necklace & cards in middle, roses & keychains in front
    const sorted = [...expandedItems].sort((a, b) => {
      const getPriority = (item: PrototypeBouquetItem | RealisticBouquetItem) => {
        if (item.shape === 'photo') return 1;
        if (item.shape === 'choc') return 2;
        if (item.shape === 'chain') return 3;
        if (item.shape === 'bracelet') return 4;
        if (item.shape === 'rose') return 5;
        if (item.shape === 'key') return 6;
        if (item.shape === 'card') return 7;
        return 5;
      };
      return getPriority(a) - getPriority(b);
    });

    // 3-tier fan distribution coordinates
    return sorted.map((item, index) => {
      let x = 170;
      let y = 140;
      let rotate = 0;
      let scale = 1;
      let zIndex = index;

      if (count === 1) {
        x = 170;
        y = 150;
        rotate = 0;
        scale = 1.05;
      } else if (count === 2) {
        x = index === 0 ? 138 : 202;
        y = 148;
        rotate = index === 0 ? -7 : 7;
        scale = 1;
      } else if (count === 3) {
        if (index === 0) { x = 125; y = 142; rotate = -10; }
        else if (index === 1) { x = 170; y = 135; rotate = 0; }
        else { x = 215; y = 142; rotate = 10; }
      } else if (count <= 6) {
        // 2 tiers
        const backCount = Math.ceil(count * 0.6);
        const isBack = index < backCount;
        if (isBack) {
          const t = backCount > 1 ? index / (backCount - 1) : 0.5;
          x = 110 + t * 120;
          y = 125 + Math.sin(t * Math.PI) * -12;
          rotate = -14 + t * 28;
          scale = 0.95;
        } else {
          const frontIdx = index - backCount;
          const frontCount = count - backCount;
          const t = frontCount > 1 ? frontIdx / (frontCount - 1) : 0.5;
          x = 130 + t * 80;
          y = 168 + Math.sin(t * Math.PI) * -6;
          rotate = -8 + t * 16;
          scale = 1.02;
          zIndex = 10 + index;
        }
      } else {
        // 3 tiers for grand/medium bouquets (matching Image 4)
        const row1Count = Math.min(5, Math.ceil(count * 0.4));
        const row2Count = Math.min(4, Math.ceil((count - row1Count) * 0.55));
        const row3Count = count - row1Count - row2Count;

        if (index < row1Count) {
          // Back row
          const t = row1Count > 1 ? index / (row1Count - 1) : 0.5;
          x = 95 + t * 150;
          y = 112 + Math.abs(t - 0.5) * 16;
          rotate = -18 + t * 36;
          scale = 0.9;
          zIndex = index;
        } else if (index < row1Count + row2Count) {
          // Mid row
          const midIdx = index - row1Count;
          const t = row2Count > 1 ? midIdx / (row2Count - 1) : 0.5;
          x = 118 + t * 104;
          y = 152 + Math.abs(t - 0.5) * 12;
          rotate = -11 + t * 22;
          scale = 0.98;
          zIndex = 10 + index;
        } else {
          // Front row
          const frontIdx = index - row1Count - row2Count;
          const t = row3Count > 1 ? frontIdx / (row3Count - 1) : 0.5;
          x = 136 + t * 68;
          y = 188 + Math.abs(t - 0.5) * 8;
          rotate = -6 + t * 12;
          scale = 1.04;
          zIndex = 20 + index;
        }
      }

      return {
        item,
        x,
        y,
        rotate,
        scale,
        zIndex,
      };
    });
  }, [expandedItems]);

  return (
    <div className={`relative w-full aspect-[340/420] flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 340 420"
        className="w-full h-full drop-shadow-md"
        role="img"
        aria-label="Realistic Custom Bouquet Preview"
      >
        <defs>
          {/* Specular Lighting & Drop Shadows */}
          <filter id="shadow-item" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#1a0e14" floodOpacity="0.25" />
          </filter>

          <filter id="shadow-wrap" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1a0e14" floodOpacity="0.3" />
          </filter>

          <filter id="shadow-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.18" />
          </filter>

          {/* Gold Metallic Trim Gradient */}
          <linearGradient id="gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5dd8c" />
            <stop offset="35%" stopColor="#d89f2b" />
            <stop offset="70%" stopColor="#ffe9a0" />
            <stop offset="100%" stopColor="#a77218" />
          </linearGradient>

          {/* Satin Ribbon Gold Gradient */}
          <linearGradient id="gold-satin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fedc6e" />
            <stop offset="45%" stopColor="#f5b323" />
            <stop offset="85%" stopColor="#c88711" />
            <stop offset="100%" stopColor="#7a4f02" />
          </linearGradient>

          {/* Satin Ribbon Pink Gradient */}
          <linearGradient id="pink-satin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd8e2" />
            <stop offset="50%" stopColor="#f797b1" />
            <stop offset="100%" stopColor="#c75070" />
          </linearGradient>

          {/* KitKat Red Gloss Gradient */}
          <linearGradient id="kitkat-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c4161f" />
            <stop offset="25%" stopColor="#ee232d" />
            <stop offset="60%" stopColor="#ff454e" />
            <stop offset="85%" stopColor="#dc1c25" />
            <stop offset="100%" stopColor="#9b0e14" />
          </linearGradient>

          {/* Cadbury Purple Foil Gradient */}
          <linearGradient id="dairy-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2c114d" />
            <stop offset="30%" stopColor="#4f2487" />
            <stop offset="65%" stopColor="#6937ab" />
            <stop offset="100%" stopColor="#2c114d" />
          </linearGradient>

          {/* Paper Texture Shading */}
          <linearGradient id="paper-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </linearGradient>

          {/* Bamboo Skewer Stick Pattern */}
          <linearGradient id="bamboo-stick" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cfaf84" />
            <stop offset="50%" stopColor="#ecd7b5" />
            <stop offset="100%" stopColor="#ab8857" />
          </linearGradient>

          {/* Polka Dots Pattern */}
          {isDots && (
            <pattern id="polka-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="2.2" fill={trimColor} opacity="0.85" />
            </pattern>
          )}
        </defs>

        {/* ======================================================== */}
        {/* LAYER 1: REAR CONE WRAPPING FLUTES (BACKDROP) */}
        {/* ======================================================== */}
        <g filter="url(#shadow-wrap)">
          {/* Outer Left Flute */}
          <path
            d="M 68 85 L 140 260 L 105 265 L 42 110 Z"
            fill={baseColor}
            stroke="#000"
            strokeOpacity="0.1"
            strokeWidth="0.8"
          />
          <path d="M 68 85 L 140 260 L 105 265 L 42 110 Z" fill="url(#paper-sheen)" />
          {/* Gold / Trim Rim on Left Flute */}
          <path
            d="M 42 110 L 68 85 L 72 88 L 45 113 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Outer Right Flute */}
          <path
            d="M 272 85 L 298 110 L 235 265 L 200 260 Z"
            fill={baseColor}
            stroke="#000"
            strokeOpacity="0.1"
            strokeWidth="0.8"
          />
          <path d="M 272 85 L 298 110 L 235 265 L 200 260 Z" fill="url(#paper-sheen)" />
          {/* Gold / Trim Rim on Right Flute */}
          <path
            d="M 298 110 L 272 85 L 268 88 L 295 113 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Inner Left Flute */}
          <path
            d="M 108 55 L 155 260 L 125 260 L 78 82 Z"
            fill={baseColor}
            stroke="#000"
            strokeOpacity="0.12"
          />
          <path d="M 108 55 L 155 260 L 125 260 L 78 82 Z" fill="url(#paper-sheen)" />
          <path
            d="M 78 82 L 108 55 L 112 58 L 82 85 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Inner Right Flute */}
          <path
            d="M 232 55 L 262 82 L 215 260 L 185 260 Z"
            fill={baseColor}
            stroke="#000"
            strokeOpacity="0.12"
          />
          <path d="M 232 55 L 262 82 L 215 260 L 185 260 Z" fill="url(#paper-sheen)" />
          <path
            d="M 262 82 L 232 55 L 228 58 L 258 85 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Center Crown Flute */}
          <path
            d="M 170 38 L 218 62 L 170 260 L 122 62 Z"
            fill={baseColor}
            stroke="#000"
            strokeOpacity="0.1"
          />
          <path d="M 170 38 L 218 62 L 170 260 L 122 62 Z" fill="url(#paper-sheen)" />
          {/* Center Flute Top Trim */}
          <path
            d="M 122 62 L 170 38 L 218 62 L 214 66 L 170 43 L 126 66 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Polka Dots overlay if active */}
          {isDots && (
            <path
              d="M 42 110 L 68 85 L 108 55 L 170 38 L 232 55 L 272 85 L 298 110 L 220 260 L 120 260 Z"
              fill="url(#polka-dots)"
              opacity="0.4"
            />
          )}
        </g>

        {/* Soft shadow bed inside the wrap */}
        <ellipse cx="170" cy="205" rx="85" ry="35" fill="#000000" opacity="0.16" filter="blur(8px)" />

        {/* ======================================================== */}
        {/* LAYER 2: FLORIST BAMBOO STICKS / STEMS */}
        {/* ======================================================== */}
        {placedItems.map(({ x, y, rotate }, idx) => (
          <line
            key={`stick-${idx}`}
            x1={x}
            y1={y + 15}
            x2={170 + (x - 170) * 0.25}
            y2={270}
            stroke="url(#bamboo-stick)"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        ))}

        {/* ======================================================== */}
        {/* LAYER 3: REALISTIC ACCESSORIES & PRODUCTS */}
        {/* ======================================================== */}
        {placedItems.map(({ item, x, y, rotate, scale, zIndex }, idx) => {
          const isChoc = item.shape === 'choc';
          const itemName = (item.name || '').toLowerCase();
          const isDairy = itemName.includes('dairy');
          const isFerrero = itemName.includes('ferrero') || itemName.includes('rocher');
          const isPhoto = item.shape === 'photo';
          const isChain = item.shape === 'chain';
          const isBracelet = item.shape === 'bracelet';
          const isRose = item.shape === 'rose';
          const isKey = item.shape === 'key';
          const isCard = item.shape === 'card';

          return (
            <g
              key={`item-${idx}`}
              transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rotate.toFixed(1)}) scale(${scale.toFixed(2)})`}
              filter="url(#shadow-item)"
              style={{ zIndex }}
            >
              {/* ----------------- 1. KITKAT CHOCOLATE (Images 2, 3, 4) ----------------- */}
              {isChoc && !isDairy && !isFerrero && (
                <g transform="translate(-20, -42)">
                  {/* Outer Wrapper with crimped zigzag edges */}
                  <rect x="0" y="4" width="40" height="76" rx="2" fill="url(#kitkat-red)" />
                  {/* Top Crimped zigzag */}
                  <path
                    d="M 0 4 L 4 0 L 8 4 L 12 0 L 16 4 L 20 0 L 24 4 L 28 0 L 32 4 L 36 0 L 40 4"
                    fill="none"
                    stroke="#b81018"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Bottom Crimped zigzag */}
                  <path
                    d="M 0 80 L 4 84 L 8 80 L 12 84 L 16 80 L 20 84 L 24 80 L 28 84 L 32 80 L 36 84 L 40 80"
                    fill="none"
                    stroke="#b81018"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Gold / yellow accent corner banner */}
                  <path d="M 0 6 L 16 6 L 0 22 Z" fill="#facc15" />
                  <rect x="2" y="10" width="8" height="2" fill="#713f12" opacity="0.6" />

                  {/* Iconic White KitKat Oval */}
                  <ellipse cx="20" cy="42" rx="16" ry="11" fill="#ffffff" stroke="#c4161f" strokeWidth="1.2" />
                  {/* KitKat Bold Script */}
                  <text
                    x="20"
                    y="46"
                    textAnchor="middle"
                    fill="#c4161f"
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontWeight="900"
                    fontSize="11"
                    fontStyle="italic"
                    letterSpacing="-0.5"
                  >
                    KitKat
                  </text>

                  {/* Specular light streak across wrapper */}
                  <path
                    d="M 4 8 L 14 6 L 36 72 L 26 74 Z"
                    fill="#ffffff"
                    opacity="0.18"
                  />
                </g>
              )}

              {/* ----------------- 2. DAIRY MILK CHOCOLATE (Image 3) ----------------- */}
              {isDairy && (
                <g transform="translate(-20, -42)">
                  <rect x="0" y="4" width="40" height="76" rx="2" fill="url(#dairy-purple)" />
                  {/* Top & Bottom Crimped Seals */}
                  <path
                    d="M 0 4 L 5 0 L 10 4 L 15 0 L 20 4 L 25 0 L 30 4 L 35 0 L 40 4"
                    fill="none"
                    stroke="#230d3d"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M 0 80 L 5 84 L 10 80 L 15 84 L 20 80 L 25 84 L 30 80 L 35 84 L 40 80"
                    fill="none"
                    stroke="#230d3d"
                    strokeWidth="1.8"
                  />
                  {/* Gold Cadbury swirl script */}
                  <text
                    x="20"
                    y="26"
                    textAnchor="middle"
                    fill="#f6d365"
                    fontFamily="'Caveat', cursive, serif"
                    fontWeight="700"
                    fontSize="10"
                  >
                    Cadbury
                  </text>
                  {/* Dairy Milk Block text */}
                  <text
                    x="20"
                    y="42"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontFamily="Arial, sans-serif"
                    fontWeight="800"
                    fontSize="7"
                    letterSpacing="0.4"
                  >
                    DAIRY MILK
                  </text>
                  <circle cx="20" cy="56" r="6" fill="#facc15" opacity="0.8" />
                  <path d="M 5 6 L 15 6 L 35 72 L 25 72 Z" fill="#ffffff" opacity="0.14" />
                </g>
              )}

              {/* ----------------- 3. FERRERO ROCHER CHOCOLATE ----------------- */}
              {isFerrero && (
                <g transform="translate(-16, -20)">
                  <circle cx="16" cy="16" r="16" fill="url(#gold-foil)" stroke="#8e5a0e" strokeWidth="1" />
                  <circle cx="16" cy="16" r="13" fill="#dfa233" />
                  <ellipse cx="14" cy="12" rx="4" ry="2" fill="#ffffff" opacity="0.6" />
                  {/* Pleated dark brown paper cup base */}
                  <path d="M 4 24 Q 16 32 28 24 L 24 32 Q 16 35 8 32 Z" fill="#451a03" />
                </g>
              )}

              {/* ----------------- 4. POLAROID PHOTO PRINT (Images 1 & 2) ----------------- */}
              {isPhoto && (
                <g transform="translate(-28, -38)">
                  {/* Physical Photo White Frame (classic thick bottom border) */}
                  <rect
                    x="0"
                    y="0"
                    width="56"
                    height="68"
                    rx="2"
                    fill="#ffffff"
                    stroke="#e2d8d8"
                    strokeWidth="1"
                    filter="url(#shadow-soft)"
                  />
                  {/* Glossy Photo Picture Area (Outdoor sunlit portrait silhouette) */}
                  <rect x="4" y="4" width="48" height="46" fill="#f3eae5" />
                  {/* Sky & warm sunshine gradient */}
                  <rect x="4" y="4" width="48" height="24" fill="#9bc5e2" opacity="0.75" />
                  <circle cx="44" cy="12" r="5" fill="#fef08a" opacity="0.9" />
                  {/* Warm greenery & girl silhouette (matching Reference 1!) */}
                  <path d="M 4 28 Q 28 18 52 28 L 52 50 L 4 50 Z" fill="#3f724d" />
                  <ellipse cx="28" cy="31" r="5" fill="#e0607e" />
                  <path d="M 23 36 C 23 32 33 32 33 36 L 36 50 L 20 50 Z" fill="#e0607e" />

                  {/* Cute Wooden Peg or Heart Pin (top corner) */}
                  <circle cx="6" cy="6" r="3" fill="#f43f5e" />

                  {/* Handwritten script caption at bottom */}
                  <text
                    x="28"
                    y="60"
                    textAnchor="middle"
                    fill="#3f3337"
                    fontFamily="'Caveat', cursive, sans-serif"
                    fontWeight="700"
                    fontSize="9"
                  >
                    Forever ✨
                  </text>

                  {/* Glossy sheen reflection overlay */}
                  <path d="M 4 4 L 22 4 L 4 26 Z" fill="#ffffff" opacity="0.4" />
                </g>
              )}

              {/* ----------------- 5. STAINLESS STEEL NECKLACE (Image 1) ----------------- */}
              {isChain && (
                <g transform="translate(-25, -34)">
                  {/* Boutique White Jewellery Card */}
                  <rect
                    x="0"
                    y="0"
                    width="50"
                    height="62"
                    rx="3"
                    fill="#ffffff"
                    stroke="#ecdcdc"
                    strokeWidth="1"
                    filter="url(#shadow-soft)"
                  />
                  {/* Pink Ribbon/Border Pattern on Card (Image 1) */}
                  <rect x="3" y="3" width="44" height="56" rx="2" fill="none" stroke="#fbcfe8" strokeWidth="0.8" />
                  <path d="M 22 10 Q 25 7 28 10 Q 25 13 22 10 Z" fill="#f472b6" />

                  {/* Metallic Gold Curb Chain Loop */}
                  <path
                    d="M 12 18 Q 25 40 38 18"
                    fill="none"
                    stroke="url(#gold-foil)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  {/* Polished Gold Heart / Star Pendant */}
                  <path
                    d="M 25 38 C 21 34 18 36 18 39 C 18 42 25 46 25 46 C 25 46 32 42 32 39 C 32 36 29 34 25 38 Z"
                    fill="url(#gold-foil)"
                    stroke="#a77218"
                    strokeWidth="0.6"
                    filter="url(#shadow-soft)"
                  />
                  <circle cx="23" cy="38" r="1.2" fill="#ffffff" />
                </g>
              )}

              {/* ----------------- 6. STAINLESS STEEL BRACELET (Image 1) ----------------- */}
              {isBracelet && (
                <g transform="translate(-26, -26)">
                  {/* Jewellery Backing Card */}
                  <rect x="0" y="0" width="52" height="52" rx="4" fill="#fffaf8" stroke="#ebdcd5" strokeWidth="1" />
                  {/* Gold Twisted Wire Bangle */}
                  <circle
                    cx="26"
                    cy="26"
                    r="19"
                    fill="none"
                    stroke="url(#gold-foil)"
                    strokeWidth="3.2"
                    strokeDasharray="4 1.5"
                  />
                  <ellipse cx="18" cy="15" rx="3" ry="1.5" fill="#ffffff" opacity="0.8" transform="rotate(-30 18 15)" />
                </g>
              )}

              {/* ----------------- 7. SATIN ROSE (Image 2) ----------------- */}
              {isRose && (
                <g transform="translate(-22, -22)">
                  {/* Multi-layered Velvet Satin Rose Petals */}
                  <circle cx="22" cy="22" r="22" fill="#991b1b" />
                  <path
                    d="M 7 17 C 8 8 20 6 26 10 C 33 5 40 12 37 22 C 40 30 32 38 23 37 C 15 40 6 32 7 22 Z"
                    fill="#be123c"
                  />
                  <path
                    d="M 12 18 C 14 12 24 11 28 16 C 33 19 32 28 26 31 C 20 33 13 28 12 21 Z"
                    fill="#e11d48"
                  />
                  {/* Rose Center Swirl */}
                  <path
                    d="M 19 20 C 18 17 25 16 26 19 C 27 22 22 25 21 23 Z"
                    fill="#fda4af"
                  />
                  <circle cx="22" cy="21" r="2" fill="#ffe4e6" />
                </g>
              )}

              {/* ----------------- 8. RESIN NAME KEYCHAIN ----------------- */}
              {isKey && (
                <g transform="translate(-16, -34)">
                  {/* Metal Keyring at top */}
                  <circle cx="16" cy="8" r="7" fill="none" stroke="url(#gold-foil)" strokeWidth="2.2" />
                  <line x1="16" y1="15" x2="16" y2="20" stroke="url(#gold-foil)" strokeWidth="2" />
                  {/* Clear Resin Bar with Gold Flakes */}
                  <rect
                    x="6"
                    y="20"
                    width="20"
                    height="46"
                    rx="3"
                    fill="#ffffff"
                    fillOpacity="0.82"
                    stroke="url(#gold-foil)"
                    strokeWidth="1.2"
                  />
                  {/* Embedded 24k Gold Flakes */}
                  <circle cx="11" cy="26" r="2.2" fill="#facc15" />
                  <circle cx="19" cy="33" r="1.8" fill="#facc15" />
                  <circle cx="13" cy="42" r="2.5" fill="#facc15" />
                  <circle cx="18" cy="52" r="2.2" fill="#facc15" />
                  {/* Arabic letter or initial */}
                  <text
                    x="16"
                    y="45"
                    textAnchor="middle"
                    fill="#a16207"
                    fontWeight="800"
                    fontSize="13"
                    fontFamily="serif"
                  >
                    G
                  </text>
                </g>
              )}

              {/* ----------------- 9. HANDWRITTEN GIFT CARD (Image 1) ----------------- */}
              {isCard && (
                <g transform="translate(-26, -30)">
                  <rect
                    x="0"
                    y="0"
                    width="52"
                    height="48"
                    rx="3"
                    fill="#fefcf6"
                    stroke="#ebdcd5"
                    strokeWidth="1"
                    filter="url(#shadow-soft)"
                  />
                  <path d="M 26 6 L 46 6" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
                  <text
                    x="26"
                    y="22"
                    textAnchor="middle"
                    fill="#7a1c3b"
                    fontFamily="'Caveat', cursive, sans-serif"
                    fontWeight="700"
                    fontSize="10"
                  >
                    {recipientName ? `For ${recipientName}` : 'Happy Birthday'}
                  </text>
                  <text
                    x="26"
                    y="34"
                    textAnchor="middle"
                    fill="#6a5b60"
                    fontFamily="'Caveat', cursive, sans-serif"
                    fontWeight="600"
                    fontSize="8"
                  >
                    with love &amp; joy 💖
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ======================================================== */}
        {/* LAYER 4: FAIRY LIGHT GLOW PARTICLES (IF SELECTED) */}
        {/* ======================================================== */}
        {hasFairyLights && (
          <g>
            {[
              [120, 110],
              [170, 95],
              [210, 120],
              [140, 150],
              [190, 160],
              [160, 190],
              [130, 200],
            ].map(([fx, fy], idx) => (
              <g key={`light-${idx}`}>
                <circle cx={fx} cy={fy} r="10" fill="#fef08a" opacity="0.35" filter="blur(3px)" />
                <circle cx={fx} cy={fy} r="3" fill="#ffffff" />
                <circle cx={fx} cy={fy} r="1.5" fill="#fef08a" />
              </g>
            ))}
          </g>
        )}

        {/* ======================================================== */}
        {/* LAYER 5: FOREGROUND PLEATED COLLAR WRAP */}
        {/* ======================================================== */}
        <g filter="url(#shadow-wrap)">
          {/* Main Cone Body Flap (Holds items tightly in front) */}
          <path
            d="M 170 375 L 75 190 Q 170 215 265 190 Z"
            fill={baseColor}
            stroke="#000000"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
          <path d="M 170 375 L 75 190 Q 170 215 265 190 Z" fill="url(#paper-sheen)" />

          {/* Left Pleated Fold Flap */}
          <path
            d="M 170 375 L 85 198 Q 120 185 170 205 Z"
            fill={baseColor}
            stroke="#000000"
            strokeOpacity="0.14"
          />
          <path d="M 170 375 L 85 198 Q 120 185 170 205 Z" fill="url(#paper-sheen)" />
          {/* Gold / Trim Rim on Left Pleat */}
          <path
            d="M 85 198 Q 120 185 170 205 L 170 209 Q 120 189 85 202 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Right Pleated Fold Flap */}
          <path
            d="M 170 375 L 255 198 Q 220 185 170 205 Z"
            fill={baseColor}
            stroke="#000000"
            strokeOpacity="0.14"
          />
          <path d="M 170 375 L 255 198 Q 220 185 170 205 Z" fill="url(#paper-sheen)" />
          {/* Gold / Trim Rim on Right Pleat */}
          <path
            d="M 255 198 Q 220 185 170 205 L 170 209 Q 220 189 255 202 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />

          {/* Front Collar Gold Rim */}
          <path
            d="M 75 190 Q 170 215 265 190 L 265 194 Q 170 219 75 194 Z"
            fill={isBlackGold ? 'url(#gold-foil)' : trimColor}
          />
        </g>

        {/* ======================================================== */}
        {/* LAYER 6: REALISTIC SATIN RIBBON BOW (Image 4 & Image 1) */}
        {/* ======================================================== */}
        <g filter="url(#shadow-wrap)">
          {/* Ribbon Waist Wrap */}
          <path
            d="M 134 260 Q 170 266 206 260 L 204 274 Q 170 280 136 274 Z"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.15"
          />

          {/* Ribbon Tail (Left) */}
          <path
            d="M 166 270 Q 145 305 130 338 L 148 335 L 158 318 L 168 274 Z"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.12"
          />

          {/* Ribbon Tail (Right) */}
          <path
            d="M 174 270 Q 195 305 210 338 L 192 335 L 182 318 L 172 274 Z"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.12"
          />

          {/* Bow Loop (Left) */}
          <path
            d="M 170 268 C 148 245 118 250 120 268 C 122 284 150 278 170 270 Z"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.15"
          />
          {/* Left loop inner shadow */}
          <ellipse cx="138" cy="266" rx="9" ry="5" fill="#000000" opacity="0.22" transform="rotate(-15 138 266)" />

          {/* Bow Loop (Right) */}
          <path
            d="M 170 268 C 192 245 222 250 220 268 C 218 284 190 278 170 270 Z"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.15"
          />
          {/* Right loop inner shadow */}
          <ellipse cx="202" cy="266" rx="9" ry="5" fill="#000000" opacity="0.22" transform="rotate(15 202 266)" />

          {/* Center Bow Knot */}
          <ellipse
            cx="170"
            cy="269"
            rx="11"
            ry="8.5"
            fill={isPink ? 'url(#pink-satin)' : 'url(#gold-satin)'}
            stroke="#000000"
            strokeOpacity="0.2"
          />
          <ellipse cx="168" cy="267" rx="4" ry="2" fill="#ffffff" opacity="0.5" />
        </g>

        {/* Empty Bouquet Prompt (when 0 items selected) */}
        {expandedItems.length === 0 && (
          <g filter="url(#shadow-soft)">
            <rect
              x="85"
              y="110"
              width="170"
              height="58"
              rx="8"
              fill="#ffffff"
              fillOpacity="0.94"
              stroke="#e8dcdc"
              strokeDasharray="4 4"
            />
            <text
              x="170"
              y="134"
              textAnchor="middle"
              fill="#7a1c3b"
              fontFamily="sans-serif"
              fontWeight="800"
              fontSize="12"
            >
              Your Bouquet is Ready ✨
            </text>
            <text
              x="170"
              y="152"
              textAnchor="middle"
              fill="#6a5b60"
              fontFamily="sans-serif"
              fontWeight="500"
              fontSize="10"
            >
              Add chocolates, photos or jewellery below
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
