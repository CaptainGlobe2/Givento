'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '../context/BasketContext';
import { db } from '../lib/database';
import { CustomizationOption } from '../types/master';
import { Product } from '../types';
import { Sparkles, Check, HelpCircle } from 'lucide-react';

interface ResinOptionGroup {
  productTypes: CustomizationOption[];
  shapes: CustomizationOption[];
  tints: CustomizationOption[];
  flakes: CustomizationOption[];
  packaging: CustomizationOption[];
}

export default function ResinBuilder() {
  const router = useRouter();
  const { addToBasket } = useBasket();

  // Dynamic Options from DB
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>('res-opt-kc');
  const [selectedShapeId, setSelectedShapeId] = useState<string>('res-shp-init');
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedTintId, setSelectedTintId] = useState<string>('res-col-clr');
  const [selectedFlakesId, setSelectedFlakesId] = useState<string>('res-flk-gld');
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('res-pkg-pouch');
  const [nameText, setNameText] = useState<string>('فاطمة');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Price animation
  const [lastTotal, setLastTotal] = useState<number | null>(null);
  const [deltaChip, setDeltaChip] = useState<{ text: string; isNeg: boolean } | null>(null);
  const [isBumping, setIsBumping] = useState(false);
  const [btnText, setBtnText] = useState('Add to bag');

  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await db.getCustomizationOptions('resin');
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load resin customization options:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  // Grouped options
  const grouped = useMemo<ResinOptionGroup>(() => {
    return {
      productTypes: options.filter((o) => o.groupName === 'product_type' && o.isActive),
      shapes: options.filter((o) => o.groupName === 'shape' && o.isActive),
      tints: options.filter((o) => o.groupName === 'color_tint' && o.isActive),
      flakes: options.filter((o) => o.groupName === 'flakes' && o.isActive),
      packaging: options.filter((o) => o.groupName === 'packaging' && o.isActive),
    };
  }, [options]);

  // Selected Option Objects
  const currentProductType = useMemo(() => {
    return grouped.productTypes.find((o) => o.id === selectedProductTypeId) || grouped.productTypes[0];
  }, [grouped.productTypes, selectedProductTypeId]);

  const currentShape = useMemo(() => {
    return grouped.shapes.find((o) => o.id === selectedShapeId) || grouped.shapes[0];
  }, [grouped.shapes, selectedShapeId]);

  const currentTint = useMemo(() => {
    return grouped.tints.find((o) => o.id === selectedTintId) || grouped.tints[0];
  }, [grouped.tints, selectedTintId]);

  const currentFlakes = useMemo(() => {
    return grouped.flakes.find((o) => o.id === selectedFlakesId) || grouped.flakes[0];
  }, [grouped.flakes, selectedFlakesId]);

  const currentPackaging = useMemo(() => {
    return grouped.packaging.find((o) => o.id === selectedPackagingId) || grouped.packaging[0];
  }, [grouped.packaging, selectedPackagingId]);

  // Total price calculation
  const calculatedTotal = useMemo(() => {
    let tot = currentProductType?.priceModifier || 199;
    tot += currentShape?.priceModifier || 0;
    tot += currentTint?.priceModifier || 0;
    tot += currentFlakes?.priceModifier || 0;
    tot += currentPackaging?.priceModifier || 0;
    return tot;
  }, [currentProductType, currentShape, currentTint, currentFlakes, currentPackaging]);

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

  // Add to Bag
  const handleAddToBag = () => {
    const selectedOptionIds = [
      currentProductType?.id,
      currentShape?.id,
      currentTint?.id,
      currentFlakes?.id,
      currentPackaging?.id,
    ].filter(Boolean) as string[];

    const finalName = currentShape?.name.includes('Initial')
      ? `${currentProductType?.name || 'Resin Keepsake'} (Letter ${selectedLetter})`
      : `${currentProductType?.name || 'Resin Keepsake'} (${currentShape?.name})`;

    const customResinProduct: Product = {
      id: `resin-custom-${Date.now()}`,
      slug: 'custom-resin-keepsake',
      name: finalName,
      realmId: 'resin-art',
      realmName: 'Resin Art',
      categoryId: 'resin-art',
      categoryName: 'Resin Art',
      priceType: 'fixed',
      price: calculatedTotal,
      shortDescription: `Handcrafted resin with ${currentFlakes?.name}, ${currentTint?.name} tint.`,
      description: `Bespoke hand-poured epoxy resin keepsake. Shape: ${currentShape?.name}, Color: ${currentTint?.name}, Flakes: ${currentFlakes?.name}, Packaging: ${currentPackaging?.name}.`,
      images: ['/images/resin-keychain.svg'],
      inStock: true,
      isPersonalised: true,
      stockQuantity: 25,
    };

    const personalisationData: Record<string, string> = {
      'Product Type': currentProductType?.name || '',
      'Shape': currentShape?.name.includes('Initial') ? `Letter ${selectedLetter}` : (currentShape?.name || ''),
      'Color Tint': currentTint?.name || '',
      'Flakes & Foil': currentFlakes?.name || '',
      'Name / Calligraphy Text': nameText.trim() || 'No name requested',
      'Packaging': currentPackaging?.name || '',
      ...(specialNotes.trim() ? { 'Artisan Instructions': specialNotes.trim() } : {}),
    };

    addToBasket(
      customResinProduct,
      1,
      { 'Shape': currentShape?.name || '', 'Tint': currentTint?.name || '' },
      personalisationData
    );

    router.push('/cart');
  };

  // Preview styling helpers
  const tintColorMap: Record<string, { bg: string; border: string }> = {
    'res-col-clr': { bg: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,245,250,0.85) 100%)', border: '#d5d0ce' },
    'res-col-pnk': { bg: 'linear-gradient(135deg, #fde7ea 0%, #f7b5c4 100%)', border: '#e89db1' },
    'res-col-emr': { bg: 'linear-gradient(135deg, #e4f7f0 0%, #8edbbf 100%)', border: '#60bfa0' },
    'res-col-nvy': { bg: 'linear-gradient(135deg, #1e2640 0%, #0d1222 100%)', border: '#425178' },
    'res-col-amb': { bg: 'linear-gradient(135deg, #fff1d6 0%, #f7ba53 100%)', border: '#dca038' },
    'res-col-prl': { bg: 'linear-gradient(135deg, #fbfbfa 0%, #eae5ea 100%)', border: '#d4cbda' },
  };

  const flakesSparkleColor = useMemo(() => {
    if (selectedFlakesId === 'res-flk-rgd') return '#d97d8e';
    if (selectedFlakesId === 'res-flk-slv') return '#c0c5cc';
    if (selectedFlakesId === 'res-flk-flw') return '#c4516a';
    return '#e5b838'; // Gold
  }, [selectedFlakesId]);

  const activeTintStyle = tintColorMap[selectedTintId] || tintColorMap['res-col-clr'];
  const isDarkTint = selectedTintId === 'res-col-nvy';

  return (
    <section id="resin-builder" className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-7 items-start">
        {/* Left Column: Numbered Configuration Steps */}
        <div className="flex flex-col gap-4.5 min-w-0">
          {/* STEP 1: Product Type */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                1
              </span>
              <span>Choose your resin keepsake</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Hand-poured crystal resin gifts crafted in our Adirampattinam studio.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {grouped.productTypes.map((pt) => {
                const isSelected = selectedProductTypeId === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setSelectedProductTypeId(pt.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </span>
                    )}
                    <b className="font-bold text-[0.9rem] text-[#231a1d]">{pt.name}</b>
                    <span className="font-bold text-[0.86rem] text-[#7a1c3b]">₹{pt.priceModifier}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Shape & Silhouette */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                2
              </span>
              <span>Select shape &amp; silhouette</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Custom letter initials, geometric hexagons, hearts, or raw geode edges.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3.5">
              {grouped.shapes.map((shp) => {
                const isSelected = selectedShapeId === shp.id;
                return (
                  <button
                    key={shp.id}
                    type="button"
                    onClick={() => setSelectedShapeId(shp.id)}
                    className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </span>
                    )}
                    <b className="font-bold text-[0.9rem] text-[#231a1d]">{shp.name}</b>
                    <span className="text-[0.78rem] text-[#7a1c3b] font-semibold">
                      {shp.priceModifier > 0 ? `+₹${shp.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Letter Initial picker if Initial selected */}
            {currentShape?.name.includes('Initial') && (
              <div className="bg-[#faf6f4] border border-[#e8dcdc] rounded-[8px] p-3">
                <label className="block text-xs font-bold text-[#231a1d] mb-1.5">
                  Pick your initial letter (A to Z):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
                    const isChar = selectedLetter === char;
                    return (
                      <button
                        key={char}
                        type="button"
                        onClick={() => setSelectedLetter(char)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold font-display transition-colors cursor-pointer ${
                          isChar
                            ? 'bg-[#7a1c3b] text-white shadow-xs'
                            : 'bg-white border border-[#EFE8E1] text-[#231a1d] hover:border-[#7a1c3b]'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Color Tint & Base */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                3
              </span>
              <span>Choose color tint &amp; crystal hue</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              From glass-like crystal clear to subtle rose quartz and midnight navy.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {grouped.tints.map((tint) => {
                const isSelected = selectedTintId === tint.id;
                const sample = tintColorMap[tint.id] || tintColorMap['res-col-clr'];
                return (
                  <button
                    key={tint.id}
                    type="button"
                    onClick={() => setSelectedTintId(tint.id)}
                    className={`relative flex items-center gap-2.5 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border shadow-inner flex-none"
                      style={{ background: sample.bg, borderColor: sample.border }}
                    />
                    <div className="min-w-0">
                      <b className="block font-bold text-[0.86rem] text-[#231a1d] truncate">{tint.name}</b>
                      {tint.priceModifier > 0 && (
                        <span className="text-[0.74rem] text-[#7a1c3b] font-semibold">+₹{tint.priceModifier}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Flakes & Botanical Inclusions */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                4
              </span>
              <span>Flakes &amp; floral inclusions</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              24K genuine metallic gold leaf, rose gold shimmer, or pressed wildflowers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {grouped.flakes.map((flk) => {
                const isSelected = selectedFlakesId === flk.id;
                return (
                  <button
                    key={flk.id}
                    type="button"
                    onClick={() => setSelectedFlakesId(flk.id)}
                    className={`relative flex items-center justify-between text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#c5a059] flex-none" />
                      <b className="font-bold text-[0.88rem] text-[#231a1d]">{flk.name}</b>
                    </div>
                    <span className="font-bold text-[0.84rem] text-[#7a1c3b]">
                      {flk.priceModifier > 0 ? `+₹${flk.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 5: Inscription & Calligraphy Name */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                5
              </span>
              <span>Name / Calligraphy inscription</span>
            </h3>
            <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
              Enter the name in English or classical Arabic. We carefully embed it in the resin layer.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="resinName" className="block text-xs font-bold text-[#231a1d] mb-1">
                  Name / Arabic or English text:
                </label>
                <input
                  id="resinName"
                  type="text"
                  value={nameText}
                  onChange={(e) => setNameText(e.target.value)}
                  placeholder="e.g. Fatima / فاطمة"
                  className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white px-3 py-2 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all font-sans"
                />
              </div>

              {/* Sample Arabic quick pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6a5b60]">
                <span className="text-[11px] font-semibold">Try sample calligraphy:</span>
                {['فاطمة', 'أمينة', 'فرحانة', 'Zayn', 'Ayla', 'Amina'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setNameText(sample)}
                    className="px-2 py-0.5 rounded-full bg-[#faf6f4] border border-[#e8dcdc] hover:border-[#7a1c3b] text-[#231a1d] text-[11px] transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 6: Luxury Packaging & Artisan Notes */}
          <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
            <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
              <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                6
              </span>
              <span>Packaging &amp; artisan notes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
              {grouped.packaging.map((pkg) => {
                const isSelected = selectedPackagingId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackagingId(pkg.id)}
                    className={`relative flex items-center justify-between text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${
                      isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                    }`}
                  >
                    <b className="font-bold text-[0.88rem] text-[#231a1d]">{pkg.name}</b>
                    <span className="font-bold text-[0.84rem] text-[#7a1c3b]">
                      {pkg.priceModifier > 0 ? `+₹${pkg.priceModifier}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="resinNotes" className="block text-xs font-bold text-[#231a1d] mb-1">
                Special placement instructions (optional):
              </label>
              <textarea
                id="resinNotes"
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Please concentrate gold flakes mostly around the lower edges."
                className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white p-3 text-xs text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Visual Preview & Summary */}
        <aside
          aria-label="Resin customizer summary"
          className="order-first lg:order-none sticky top-28 flex flex-col gap-3.5 bg-white border border-[#e8dcdc] rounded-[14px] p-5 shadow-[0_8px_28px_rgba(90,18,48,0.08)]"
        >
          <div className="flex justify-between items-baseline gap-2.5">
            <h3 className="font-display font-normal text-[1.4rem] text-[#231a1d] m-0">
              Live Resin Studio
            </h3>
            <span className="text-[0.82rem] text-[#6a5b60] font-semibold">
              Hand-Poured Keepsake
            </span>
          </div>

          {/* Visual Canvas Render */}
          <div className="bg-[#faf6f4] rounded-[10px] p-4 flex items-center justify-center min-h-[220px] relative overflow-hidden border border-[#e8dcdc]">
            <div
              className={`relative flex items-center justify-center transition-all duration-300 shadow-md ${
                currentShape?.name.includes('Hexagon')
                  ? 'w-36 h-36 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]'
                  : currentShape?.name.includes('Heart')
                  ? 'w-36 h-36 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]'
                  : currentShape?.name.includes('Geode')
                  ? 'w-40 h-32 rounded-[30%_70%_70%_30%/30%_30%_70%_70%]'
                  : currentShape?.name.includes('Arch')
                  ? 'w-32 h-44 rounded-t-full rounded-b-md'
                  : 'w-36 h-36 rounded-2xl'
              }`}
              style={{
                background: activeTintStyle.bg,
                border: `2px solid ${activeTintStyle.border}`,
              }}
            >
              {/* Floating Metallic Sparkles / Flakes Simulation */}
              <div
                className="absolute inset-0 pointer-events-none opacity-85"
                style={{
                  backgroundImage: `radial-gradient(${flakesSparkleColor} 1.5px, transparent 2px), radial-gradient(${flakesSparkleColor} 2.5px, transparent 3px)`,
                  backgroundSize: '18px 18px, 28px 28px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />

              {/* Gold Eyelet / Ring simulation */}
              <div className="absolute top-2.5 w-3.5 h-3.5 rounded-full border-2 border-[#c5a059] bg-white/70 shadow-xs" />

              {/* Display Initial Letter or Name */}
              <div className="relative z-10 text-center px-3">
                {currentShape?.name.includes('Initial') && (
                  <span
                    className={`block font-display text-5xl font-normal tracking-tight drop-shadow-sm ${
                      isDarkTint ? 'text-[#fbf3e4]' : 'text-[#7a1c3b]'
                    }`}
                  >
                    {selectedLetter}
                  </span>
                )}

                <span
                  className={`block font-display text-base font-normal leading-tight drop-shadow-xs ${
                    isDarkTint ? 'text-white' : 'text-[#231a1d]'
                  }`}
                >
                  {nameText || 'Givento'}
                </span>
              </div>
            </div>
          </div>

          <p className="m-0 text-[0.82rem] text-[#6a5b60]">
            Hand-poured resin takes 48 hours to cure. Each piece is unique and cast by hand in Adirampattinam.
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
              <span>{currentProductType?.name || 'Resin Base'}</span>
              <span className="font-bold tabular-nums">₹{currentProductType?.priceModifier || 199}</span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>
                Shape: {currentShape?.name} {currentShape?.name.includes('Initial') ? `(${selectedLetter})` : ''}
              </span>
              <span className="font-bold tabular-nums">
                {currentShape?.priceModifier ? `+₹${currentShape.priceModifier}` : 'Included'}
              </span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Tint: {currentTint?.name}</span>
              <span className="font-bold tabular-nums">
                {currentTint?.priceModifier ? `+₹${currentTint.priceModifier}` : 'Included'}
              </span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Flakes: {currentFlakes?.name}</span>
              <span className="font-bold tabular-nums">
                {currentFlakes?.priceModifier ? `+₹${currentFlakes.priceModifier}` : 'Included'}
              </span>
            </li>
            <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
              <span>Packaging: {currentPackaging?.name}</span>
              <span className="font-bold tabular-nums">
                {currentPackaging?.priceModifier ? `+₹${currentPackaging.priceModifier}` : 'Included'}
              </span>
            </li>
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
