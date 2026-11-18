'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '../context/BasketContext';
import { db } from '../lib/database';
import { CustomizationOption } from '../types/master';
import { Product } from '../types';
import { Check, Gift, Sparkles, Plus, Minus } from 'lucide-react';

interface HamperOptionGroup {
  boxStyles: CustomizationOption[];
  ribbonColors: CustomizationOption[];
}

interface HamperItemChoice {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description: string;
}

const DEFAULT_HAMPER_TREATS: HamperItemChoice[] = [
  {
    id: 'hmp-it-ferrero',
    name: 'Ferrero Rocher Hazelnut (4-pack)',
    price: 199,
    category: 'Sweets',
    description: 'Gold-wrapped whole hazelnut chocolates in crisp wafer shell.',
  },
  {
    id: 'hmp-it-keychain',
    name: 'Personalised Arabic Resin Keychain',
    price: 249,
    category: 'Keepsake',
    description: 'Custom resin initial or Arabic calligraphy with gold flakes.',
  },
  {
    id: 'hmp-it-candle',
    name: 'English Rose Scented Soy Candle',
    price: 299,
    category: 'Home & Fragrance',
    description: 'Hand-poured floral soy wax candle in frosted glass jar.',
  },
  {
    id: 'hmp-it-bracelet',
    name: 'Dainty Stainless Steel Bracelet',
    price: 299,
    category: 'Jewellery',
    description: 'Anti-tarnish, water-resistant minimalist gold chain bracelet.',
  },
  {
    id: 'hmp-it-polaroid',
    name: 'Polaroid Memory Photo Prints (Set of 3)',
    price: 149,
    category: 'Keepsake',
    description: 'High-gloss mini polaroids with rounded borders.',
  },
  {
    id: 'hmp-it-perfume',
    name: 'Arabian Rose & Oud Pocket Perfume (15ml)',
    price: 249,
    category: 'Home & Fragrance',
    description: 'Long-lasting artisan attar & eau de parfum travel spray.',
  },
  {
    id: 'hmp-it-scrunchie',
    name: 'Mulberry Silk Scrunchie & Hair Bow',
    price: 129,
    category: 'Accessories',
    description: 'Ultra-gentle pure silk hair accessory in blush tone.',
  },
  {
    id: 'hmp-it-chocobar',
    name: 'Artisan Roasted Almond Chocolate Bar',
    price: 160,
    category: 'Sweets',
    description: 'Rich Belgian style chocolate studded with crunchy almonds.',
  },
];

export default function HamperBuilder() {
  const router = useRouter();
  const { addToBasket } = useBasket();

  // Dynamic Options from DB
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedBoxId, setSelectedBoxId] = useState<string>('hmp-bx-ivory');
  const [selectedRibbonId, setSelectedRibbonId] = useState<string>('hmp-rb-gld');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    'hmp-it-ferrero': 1,
    'hmp-it-keychain': 1,
    'hmp-it-candle': 1,
  });
  const [cardMessage, setCardMessage] = useState<string>(
    'May your day be filled with warm smiles and sweetest moments ✨'
  );
  const [recipientName, setRecipientName] = useState<string>('Amina');

  // Price animation
  const [lastTotal, setLastTotal] = useState<number | null>(null);
  const [deltaChip, setDeltaChip] = useState<{ text: string; isNeg: boolean } | null>(null);
  const [isBumping, setIsBumping] = useState(false);
  const [btnText, setBtnText] = useState('Add to bag');

  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await db.getCustomizationOptions('hamper');
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load hamper options:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  // Grouped options
  const grouped = useMemo<HamperOptionGroup>(() => {
    return {
      boxStyles: options.filter((o) => o.groupName === 'box_style' && o.isActive),
      ribbonColors: options.filter((o) => o.groupName === 'ribbon_color' && o.isActive),
    };
  }, [options]);

  const currentBox = useMemo(() => {
    return grouped.boxStyles.find((o) => o.id === selectedBoxId) || grouped.boxStyles[0];
  }, [grouped.boxStyles, selectedBoxId]);

  const currentRibbon = useMemo(() => {
    return grouped.ribbonColors.find((o) => o.id === selectedRibbonId) || grouped.ribbonColors[0];
  }, [grouped.ribbonColors, selectedRibbonId]);

  // Compute item count and items subtotal
  const itemCount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  }, [selectedItems]);

  const itemsTotal = useMemo(() => {
    let tot = 0;
    Object.entries(selectedItems).forEach(([id, q]) => {
      const it = DEFAULT_HAMPER_TREATS.find((x) => x.id === id);
      if (it && q > 0) {
        tot += it.price * q;
      }
    });
    return tot;
  }, [selectedItems]);

  // Grand total
  const calculatedTotal = useMemo(() => {
    const boxBase = currentBox?.priceModifier || 250;
    const ribbonCharge = currentRibbon?.priceModifier || 0;
    return boxBase + ribbonCharge + itemsTotal;
  }, [currentBox, currentRibbon, itemsTotal]);

  // Price animation bump
  useEffect(() => {
    if (lastTotal !== null && calculatedTotal !== lastTotal) {
      const diff = calculatedTotal - lastTotal;
      setDeltaChip({
        text: (diff > 0 ? '+' : '−') + '₹' + Math.abs(diff),
        isNeg: diff < 0,
      });
      setIsBumping(true);
      const bTimer = setTimeout(() => setIsBumping(false), 450);
      const cTimer = setTimeout(() => setDeltaChip(null), 1000);
      return () => {
        clearTimeout(bTimer);
        clearTimeout(cTimer);
      };
    }
    setLastTotal(calculatedTotal);
  }, [calculatedTotal, lastTotal]);

  // Item toggle / stepper
  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        if (itemCount >= 6) return prev; // Max 6 items
        next[id] = 1;
      }
      return next;
    });
  };

  // Add to Bag
  const handleAddToBag = () => {
    if (itemCount < 3) return;

    const chosenTreatList: string[] = [];
    Object.entries(selectedItems).forEach(([id, q]) => {
      const it = DEFAULT_HAMPER_TREATS.find((x) => x.id === id);
      if (it && q > 0) {
        chosenTreatList.push(`${q}x ${it.name}`);
      }
    });

    const customHamperProduct: Product = {
      id: `hamper-custom-${Date.now()}`,
      slug: 'custom-keepsake-hamper',
      name: `${currentBox?.name || 'Keepsake Hamper'} (${itemCount} Treats)`,
      realmId: 'gift-hampers',
      realmName: 'Gift Hampers',
      categoryId: 'gift-hampers',
      categoryName: 'Gift Hampers',
      priceType: 'fixed',
      price: calculatedTotal,
      shortDescription: `${currentBox?.name} tied with ${currentRibbon?.name}. Includes ${itemCount} treats.`,
      description: `Bespoke curated luxury gift hamper box. Contents: ${chosenTreatList.join(', ')}.`,
      images: ['/images/gift-for-her.svg'],
      inStock: true,
      isPersonalised: true,
      stockQuantity: 15,
    };

    const personalisationData: Record<string, string> = {
      'Box Style': currentBox?.name || '',
      'Ribbon Colour': currentRibbon?.name || '',
      'Curated Treats': chosenTreatList.join(', '),
      'Card Message': cardMessage.trim() || 'No message provided',
      ...(recipientName.trim() ? { 'Recipient Name': recipientName.trim() } : {}),
    };

    addToBasket(
      customHamperProduct,
      1,
      { 'Box': currentBox?.name || '', 'Ribbon': currentRibbon?.name || '' },
      personalisationData
    );

    router.push('/cart');
  };

  // Box Style Color Palette
  const boxPalette = useMemo(() => {
    if (selectedBoxId === 'hmp-bx-kraft') {
      return {
        bg: '#e8d8c3',
        border: '#c4ad90',
        lid: '#dfccb5',
      };
    }
    if (selectedBoxId === 'hmp-bx-maroon') {
      return {
        bg: '#5a1230',
        border: '#b98a2e',
        lid: '#7a1c3b',
      };
    }
    // Ivory
    return {
      bg: '#fcfaf6',
      border: '#e4dcce',
      lid: '#f4ede1',
    };
  }, [selectedBoxId]);

  const ribbonColorHex = useMemo(() => {
    if (selectedRibbonId === 'hmp-rb-mrn') return '#7a1c3b';
    if (selectedRibbonId === 'hmp-rb-pnk') return '#e89db1';
    if (selectedRibbonId === 'hmp-rb-emr') return '#2e7d5a';
    return '#b98a2e'; // Antique gold
  }, [selectedRibbonId]);

  return (
    <section id="hamper-builder" className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-7 items-start">
        {/* Left Column: Numbered Configuration Steps */}
        <div className="flex flex-col gap-4.5 min-w-0">
          {/* STEP 1: Hamper Box Style */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                1
              </span>
              <span>Choose your keepsake hamper box</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Sturdy boutique keepsake boxes reusable for jewellery, trinkets, or letters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {grouped.boxStyles.map((bx) => {
                const isSelected = selectedBoxId === bx.id;
                return (
                  <button
                    key={bx.id}
                    type="button"
                    onClick={() => setSelectedBoxId(bx.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </span>
                    )}
                    <b className="font-bold text-[0.88rem] text-[#231a1d] leading-snug">{bx.name}</b>
                    <span className="font-bold text-[0.86rem] text-[#7a1c3b]">₹{bx.priceModifier}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Ribbon Colour */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                2
              </span>
              <span>Select luxury ribbon colour</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {grouped.ribbonColors.map((rb) => {
                const isSelected = selectedRibbonId === rb.id;
                return (
                  <button
                    key={rb.id}
                    type="button"
                    onClick={() => setSelectedRibbonId(rb.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <b className="font-bold text-[0.84rem] text-[#231a1d] leading-snug">{rb.name}</b>
                    <span className="text-[0.76rem] text-[#7a1c3b] font-semibold">
                      {rb.priceModifier > 0 ? `+₹${rb.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Curated Items Picker */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  3
                </span>
                <span>Select treats &amp; keepsakes</span>
              </h3>
              <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f8eed6] text-[#7a1c3b] border border-[#b98a2e]/30 self-start sm:self-auto">
                {itemCount} of 6 items chosen (Min 3)
              </div>
            </div>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Mix chocolates, personal perfumes, scented candles, and jewellery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEFAULT_HAMPER_TREATS.map((treat) => {
                const isChosen = !!selectedItems[treat.id];
                return (
                  <button
                    key={treat.id}
                    type="button"
                    onClick={() => handleToggleItem(treat.id)}
                    className={`relative flex items-center justify-between text-left p-3 rounded-[6px] border-[1.5px] transition-colors cursor-pointer ${
                      isChosen
                        ? 'border-[#7a1c3b] bg-[#f6e9ee]'
                        : 'border-[#e8dcdc] bg-white hover:border-[#cfb6bd]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className={`w-5 h-5 rounded-[4px] border flex items-center justify-center flex-none ${
                          isChosen ? 'bg-[#7a1c3b] border-[#7a1c3b]' : 'border-[#cfb6bd] bg-white'
                        }`}
                      >
                        {isChosen && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                      </span>
                      <div className="truncate">
                        <span className="block font-bold text-[0.88rem] text-[#231a1d] truncate">
                          {treat.name}
                        </span>
                        <span className="block text-[0.74rem] text-[#6a5b60] truncate">
                          {treat.description}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-[0.86rem] text-[#7a1c3b] whitespace-nowrap">
                      +₹{treat.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Calligraphy Card & Details */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                4
              </span>
              <span>Handwritten calligraphy card</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Included free. We handwrite your message on textured boutique cardstock, enclosed in a wax-sealed envelope.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="hamperRecipient" className="block text-xs font-bold text-[#231a1d] mb-1">
                  Recipient Name:
                </label>
                <input
                  id="hamperRecipient"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Amina"
                  className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white px-3 py-2 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all"
                />
              </div>

              <div>
                <label htmlFor="hamperCardMsg" className="block text-xs font-bold text-[#231a1d] mb-1">
                  Card Note / Heartfelt Wish:
                </label>
                <textarea
                  id="hamperCardMsg"
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Write your wishes here..."
                  className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white p-3 text-xs text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Visual Box Preview & Summary */}
        <aside
          aria-label="Hamper customizer summary"
          className="order-first lg:order-none sticky top-28 flex flex-col gap-3.5 bg-white border border-[#e8dcdc] rounded-[14px] p-5 shadow-[0_8px_28px_rgba(90,18,48,0.08)]"
        >
          <div className="flex justify-between items-baseline gap-2.5">
            <h3 className="font-display font-normal text-[1.4rem] text-[#231a1d] m-0">
              Live Hamper Studio
            </h3>
            <span className="text-[0.82rem] text-[#6a5b60] font-semibold">
              Curated Gift Box
            </span>
          </div>

          {/* Hamper Box Preview Render */}
          <div className="bg-[#faf6f4] rounded-[10px] p-5 flex items-center justify-center min-h-[240px] border border-[#e8dcdc]">
            <div
              className="w-full max-w-[280px] rounded-xl p-4 transition-all duration-300 relative shadow-md"
              style={{
                backgroundColor: boxPalette.bg,
                border: `3px solid ${boxPalette.border}`,
              }}
            >
              {/* Ribbon Banner Top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full shadow-inner opacity-90 pointer-events-none"
                style={{ backgroundColor: ribbonColorHex }}
              />

              {/* Ribbon Bow Embellishment */}
              <div className="relative z-10 flex justify-center mb-3">
                <span
                  className="px-3 py-1 rounded-full text-white text-[10px] font-bold shadow-xs tracking-wider"
                  style={{ backgroundColor: ribbonColorHex }}
                >
                  🎀 {currentRibbon?.name || 'Satin Bow'}
                </span>
              </div>

              {/* Box Contents Simulation */}
              <div className="relative z-10 bg-white/90 backdrop-blur-xs rounded-lg p-3 border border-black/10">
                <span className="block text-[11px] font-bold text-[#7a1c3b] uppercase tracking-wider mb-1.5">
                  Hamper Contents ({itemCount} items)
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {Object.entries(selectedItems).map(([id, q]) => {
                    const it = DEFAULT_HAMPER_TREATS.find((x) => x.id === id);
                    if (!it) return null;
                    return (
                      <span
                        key={id}
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#faf6f4] border border-[#e8dcdc] text-[#231a1d]"
                      >
                        {it.name.split('(')[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <p className="m-0 text-[0.82rem] text-[#6a5b60]">
            Every hamper is cushioned with wood wool shreds and sealed with our signature Givento wax seal.
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
              <span>Box: {currentBox?.name}</span>
              <span className="font-bold tabular-nums">₹{currentBox?.priceModifier || 250}</span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Ribbon: {currentRibbon?.name}</span>
              <span className="font-bold tabular-nums">
                {currentRibbon?.priceModifier ? `+₹${currentRibbon.priceModifier}` : 'Included'}
              </span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Treats &amp; Keepsakes ({itemCount} items)</span>
              <span className="font-bold tabular-nums">₹{itemsTotal.toLocaleString('en-IN')}</span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc] text-emerald-800">
              <span>Handwritten Calligraphy Card</span>
              <span className="font-bold tabular-nums">Included</span>
            </li>
          </ul>

          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={itemCount < 3}
            className="btn-boutique block w-full py-3.5 text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {itemCount >= 3 ? btnText : 'Pick at least 3 treats'}
          </button>
        </aside>
      </div>
    </section>
  );
}
