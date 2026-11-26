'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '../context/BasketContext';
import { db } from '../lib/database';
import { CustomizationOption } from '../types/master';
import { Product } from '../types';
import { Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FrameOptionGroup {
  styles: CustomizationOption[];
  sizes: CustomizationOption[];
  finishes: CustomizationOption[];
}

export default function FrameBuilder() {
  const router = useRouter();
  const { addToBasket } = useBasket();

  // Dynamic Options from DB
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedStyleId, setSelectedStyleId] = useState<string>('frm-stl-nikah');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('frm-sz-sm');
  const [selectedFinishId, setSelectedFinishId] = useState<string>('frm-fin-gld');
  const [namesText, setNamesText] = useState<string>('Faris & Amina');
  const [dateText, setDateText] = useState<string>('12th December 2026');
  const [verseText, setVerseText] = useState<string>(
    'And We created you in pairs — Surah An-Naba 78:8'
  );
  const [includePhoto, setIncludePhoto] = useState<boolean>(false);
  const [giftWrap, setGiftWrap] = useState<boolean>(true);
  const [artisanNotes, setArtisanNotes] = useState<string>('');

  // Price animation
  const prevTotalRef = useRef<number | null>(null);
  const [deltaChip, setDeltaChip] = useState<{ text: string; isNeg: boolean } | null>(null);
  const [isBumping, setIsBumping] = useState(false);
  const [btnText, setBtnText] = useState('Add to bag');

  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await db.getCustomizationOptions('frame');
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load frame customization options:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  // Grouped options
  const grouped = useMemo<FrameOptionGroup>(() => {
    return {
      styles: options.filter((o) => o.groupName === 'occasion_style' && o.isActive),
      sizes: options.filter((o) => o.groupName === 'frame_size' && o.isActive),
      finishes: options.filter((o) => o.groupName === 'border_finish' && o.isActive),
    };
  }, [options]);

  // Selected Option Objects
  const currentStyle = useMemo(() => {
    return grouped.styles.find((o) => o.id === selectedStyleId) || grouped.styles[0];
  }, [grouped.styles, selectedStyleId]);

  const currentSize = useMemo(() => {
    return grouped.sizes.find((o) => o.id === selectedSizeId) || grouped.sizes[0];
  }, [grouped.sizes, selectedSizeId]);

  const currentFinish = useMemo(() => {
    return grouped.finishes.find((o) => o.id === selectedFinishId) || grouped.finishes[0];
  }, [grouped.finishes, selectedFinishId]);

  // Total price calculation
  const calculatedTotal = useMemo(() => {
    let tot = currentStyle?.priceModifier || 899;
    tot += currentSize?.priceModifier || 0;
    tot += currentFinish?.priceModifier || 0;
    if (giftWrap) tot += 40; // Boutique wax-seal wrap
    return tot;
  }, [currentStyle, currentSize, currentFinish, giftWrap]);

  // Price animation bump
  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = calculatedTotal;
    if (prev !== null && calculatedTotal !== prev) {
      const diff = calculatedTotal - prev;
      let bTimer: ReturnType<typeof setTimeout> | undefined;
      let cTimer: ReturnType<typeof setTimeout> | undefined;
      const startTimer = setTimeout(() => {
        setDeltaChip({
          text: (diff > 0 ? '+' : '−') + '₹' + Math.abs(diff),
          isNeg: diff < 0,
        });
        setIsBumping(true);
        bTimer = setTimeout(() => setIsBumping(false), 450);
        cTimer = setTimeout(() => setDeltaChip(null), 1000);
      }, 0);
      return () => {
        clearTimeout(startTimer);
        if (bTimer) clearTimeout(bTimer);
        if (cTimer) clearTimeout(cTimer);
      };
    }
  }, [calculatedTotal]);

  // Add to Bag
  const handleAddToBag = () => {
    const selectedOptionIds = [
      currentStyle?.id,
      currentSize?.id,
      currentFinish?.id,
    ].filter(Boolean) as string[];

    const customFrameProduct: Product = {
      id: `frame-custom-${Date.now()}`,
      slug: 'custom-keepsake-frame',
      name: `${currentStyle?.name || 'Keepsake Frame'} (${namesText || 'Personalised'})`,
      realmId: 'frames',
      realmName: 'Frames',
      categoryId: 'frames',
      categoryName: 'Frames',
      priceType: 'fixed',
      price: calculatedTotal,
      shortDescription: `${currentSize?.name}, ${currentFinish?.name} with custom calligraphy.`,
      description: `Bespoke handcrafted celebration frame. Theme: ${currentStyle?.name}, Size: ${currentSize?.name}, Finish: ${currentFinish?.name}.`,
      images: ['/images/nikah-frame.svg'],
      inStock: true,
      isPersonalised: true,
      stockQuantity: 20,
    };

    const personalisationData: Record<string, string> = {
      'Celebration Theme': currentStyle?.name || '',
      'Frame Size': currentSize?.name || '',
      'Border Finish': currentFinish?.name || '',
      'Couple / Recipient Names': namesText.trim() || 'Not specified',
      'Celebration Date': dateText.trim() || 'Not specified',
      'Verse / Inscription': verseText.trim() || 'Standard studio verse',
      'Photo Inclusion': includePhoto ? 'Yes (Customer sending photo via WhatsApp)' : 'No photo',
      'Wax-Sealed Gift Wrap': giftWrap ? 'Yes (+₹40)' : 'No',
      ...(artisanNotes.trim() ? { 'Special Instructions': artisanNotes.trim() } : {}),
    };

    addToBasket(
      customFrameProduct,
      1,
      { 'Finish': currentFinish?.name || '', 'Size': currentSize?.name || '' },
      personalisationData
    );

    router.push('/cart');
  };

  // Border Finish Styling Map
  const borderFinishStyle = useMemo(() => {
    if (selectedFinishId === 'frm-fin-blk') {
      return {
        outerBorder: '#1c1917',
        innerBorder: '#44403c',
        shadow: '0 8px 24px rgba(0,0,0,0.18)',
      };
    }
    if (selectedFinishId === 'frm-fin-wd') {
      return {
        outerBorder: '#8c593b',
        innerBorder: '#d6a374',
        shadow: '0 8px 24px rgba(140,89,59,0.22)',
      };
    }
    if (selectedFinishId === 'frm-fin-chm') {
      return {
        outerBorder: '#c48f8f',
        innerBorder: '#f2d4d4',
        shadow: '0 8px 24px rgba(196,143,143,0.25)',
      };
    }
    // Vintage Gold
    return {
      outerBorder: '#c5a059',
      innerBorder: '#fbf3e4',
      shadow: '0 8px 24px rgba(185,138,46,0.25)',
    };
  }, [selectedFinishId]);

  return (
    <section id="frame-builder" className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-7 items-start">
        {/* Left Column: Numbered Configuration Steps */}
        <div className="flex flex-col gap-4.5 min-w-0">
          {/* STEP 1: Occasion / Celebration Theme */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                1
              </span>
              <span>Choose your celebration theme</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Hand-foiled calligraphy frames celebrating milestones and sacred moments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {grouped.styles.map((stl) => {
                const isSelected = selectedStyleId === stl.id;
                return (
                  <button
                    key={stl.id}
                    type="button"
                    onClick={() => setSelectedStyleId(stl.id)}
                    className={`relative flex items-center justify-between text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <b className="font-bold text-[0.88rem] text-[#231a1d]">{stl.name}</b>
                    <span className="font-bold text-[0.86rem] text-[#7a1c3b] whitespace-nowrap">
                      ₹{stl.priceModifier}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Frame Size */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                2
              </span>
              <span>Choose frame size</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              All frames feature acrylic glass and dual stand/wall hanging mount.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {grouped.sizes.map((sz) => {
                const isSelected = selectedSizeId === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setSelectedSizeId(sz.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </span>
                    )}
                    <b className="font-bold text-[0.9rem] text-[#231a1d]">{sz.name}</b>
                    <span className="text-[0.78rem] text-[#7a1c3b] font-semibold">
                      {sz.priceModifier > 0 ? `+₹${sz.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Border Finish */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                3
              </span>
              <span>Select frame border finish</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {grouped.finishes.map((fin) => {
                const isSelected = selectedFinishId === fin.id;
                return (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => setSelectedFinishId(fin.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <b className="font-bold text-[0.84rem] text-[#231a1d] leading-snug">{fin.name}</b>
                    <span className="text-[0.76rem] text-[#7a1c3b] font-semibold">
                      {fin.priceModifier > 0 ? `+₹${fin.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Personalisation (Names, Date, Verse, Photo) */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                4
              </span>
              <span>Personalisation details</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Proofs are shared with you on WhatsApp for approval before final framing.
            </p>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="frameNames" className="block text-xs font-bold text-[#231a1d] mb-1">
                    Couple / Recipient Names:
                  </label>
                  <input
                    id="frameNames"
                    type="text"
                    value={namesText}
                    onChange={(e) => setNamesText(e.target.value)}
                    placeholder="e.g. Faris & Amina"
                    className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white px-3 py-2 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="frameDate" className="block text-xs font-bold text-[#231a1d] mb-1">
                    Celebration Date:
                  </label>
                  <input
                    id="frameDate"
                    type="text"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    placeholder="e.g. 12th December 2026"
                    className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white px-3 py-2 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="frameVerse" className="block text-xs font-bold text-[#231a1d] mb-1">
                  Verse / Blessing / Special Quote:
                </label>
                <textarea
                  id="frameVerse"
                  rows={2}
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  placeholder="Enter custom verse or choose from recommendations below"
                  className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white p-3 text-xs text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all resize-none"
                />
              </div>

              {/* Sample Verse suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6a5b60]">
                <span className="text-[11px] font-semibold">Suggested verses:</span>
                {[
                  'And We created you in pairs (78:8)',
                  'Surah Ar-Rum 30:21',
                  'Ayatul Kursi & Barakah',
                  'Together is our favourite place to be',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setVerseText(sample)}
                    className="px-2 py-0.5 rounded-full bg-[#faf6f4] border border-[#e8dcdc] hover:border-[#7a1c3b] text-[#231a1d] text-[11px] transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Include Photo Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-[8px] bg-[#faf6f4] border border-[#e8dcdc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePhoto}
                  onChange={(e) => setIncludePhoto(e.target.checked)}
                  className="mt-0.5 rounded text-[#7a1c3b]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#231a1d] block">
                    Include printed studio photo inside frame (Free)
                  </span>
                  <span className="text-[#6a5b60] block mt-0.5">
                    After ordering, simply send your high-resolution photo on WhatsApp or Instagram DM with your order number.
                  </span>
                </div>
              </label>

              {/* Gift Wrap with Wax Seal */}
              <label className="flex items-start gap-2.5 p-3 rounded-[8px] bg-[#faf6f4] border border-[#e8dcdc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="mt-0.5 rounded text-[#7a1c3b]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#231a1d] block">
                    Boutique Gift Wrapping with Burgundy Wax Seal (+₹40)
                  </span>
                  <span className="text-[#6a5b60] block mt-0.5">
                    Hand-wrapped in textured paper, tied with gold satin ribbon and stamped with real hot wax.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Visual Plaque Preview & Summary */}
        <aside
          aria-label="Frame customizer summary"
          className="order-first lg:order-none sticky top-28 flex flex-col gap-3.5 bg-white border border-[#e8dcdc] rounded-[14px] p-5 shadow-[0_8px_28px_rgba(90,18,48,0.08)]"
        >
          <div className="flex justify-between items-baseline gap-2.5">
            <h3 className="font-display font-normal text-[1.4rem] text-[#231a1d] m-0">
              Live Frame Studio
            </h3>
            <span className="text-[0.82rem] text-[#6a5b60] font-semibold">
              Artisan Plaque
            </span>
          </div>

          {/* Frame Artwork Preview Render */}
          <div className="bg-[#faf6f4] rounded-[10px] p-5 flex items-center justify-center min-h-[260px] border border-[#e8dcdc]">
            <div
              className="w-full max-w-[280px] bg-[#fffdf9] p-5 rounded-[4px] text-center transition-all duration-300 relative"
              style={{
                border: `8px solid ${borderFinishStyle.outerBorder}`,
                boxShadow: borderFinishStyle.shadow,
              }}
            >
              {/* Inner Decorative Inset Border */}
              <div
                className="p-4 border"
                style={{ borderColor: borderFinishStyle.innerBorder }}
              >
                {/* Islamic Bismillah / Botanical Ornament */}
                <span className="block text-[#c5a059] text-lg font-display mb-1">
                  ﷽
                </span>

                {/* Names */}
                <h4 className="font-display text-lg font-normal text-[#7a1c3b] tracking-wide leading-snug">
                  {namesText || 'Faris & Amina'}
                </h4>

                {/* Decorative Divider */}
                <div className="w-16 h-0.5 bg-[#c5a059]/60 mx-auto my-2" />

                {/* Date */}
                <span className="block font-mono text-xs font-semibold text-[#6a5b60] tracking-wider mb-2">
                  {dateText || '12th December 2026'}
                </span>

                {/* Verse / Blessing */}
                <p className="font-display italic text-xs text-[#231a1d] leading-relaxed m-0 line-clamp-3">
                  “{verseText || 'And We created you in pairs'}”
                </p>

                {includePhoto && (
                  <span className="inline-flex items-center gap-1 mt-2.5 text-[10px] font-bold text-[#7a1c3b] bg-[#f6e9ee] px-2 py-0.5 rounded-full">
                    <ImageIcon className="w-2.5 h-2.5" />
                    <span>Photo Print Included</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="m-0 text-[0.82rem] text-[#6a5b60]">
            We share a digital typography preview on WhatsApp for your review before crafting starts.
          </p>

          {/* Live Rolling Total Price */}
          <div
            className={`relative flex items-center justify-between gap-3 py-2.5 border-y border-[#e8dcdc] font-extrabold text-[2.2rem] leading-[1.1] text-[#7a1c3b] ${
              isBumping ? 'bump' : ''
            }`}
          >
            <span className="text-[0.9rem] text-[#6a5b60] font-bold">Total</span>
            <span className="inline-flex items-baseline tabular-nums">
              <span className="text-xl mr-1 text-[#7a1c3b]">₹</span>
              <span>{calculatedTotal.toLocaleString('en-IN')}</span>
            </span>

            {deltaChip && (
              <span className={`delta ${deltaChip.isNeg ? 'neg' : ''}`}>
                {deltaChip.text}
              </span>
            )}
          </div>

          {/* Itemized Selection Breakdown */}
          <ul className="list-none m-0 p-0 flex flex-col text-[0.86rem]">
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Theme: {currentStyle?.name}</span>
              <span className="font-bold tabular-nums">₹{currentStyle?.priceModifier || 899}</span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Size: {currentSize?.name}</span>
              <span className="font-bold tabular-nums">
                {currentSize?.priceModifier ? `+₹${currentSize.priceModifier}` : 'Included'}
              </span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Finish: {currentFinish?.name}</span>
              <span className="font-bold tabular-nums">
                {currentFinish?.priceModifier ? `+₹${currentFinish.priceModifier}` : 'Included'}
              </span>
            </li>
            {giftWrap && (
              <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc] text-[#7a1c3b]">
                <span>Wax-Sealed Boutique Wrap</span>
                <span className="font-bold tabular-nums">+₹40</span>
              </li>
            )}
          </ul>

          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={handleAddToBag}
            className="btn-boutique block w-full py-3.5 text-base cursor-pointer"
          >
            {btnText}
          </button>
        </aside>
      </div>
    </section>
  );
}
