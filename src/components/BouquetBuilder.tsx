'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '../context/BasketContext';
import {
  PROTOTYPE_SHEETS,
  PROTOTYPE_SIZES,
  PROTOTYPE_BOUQUET_ITEMS,
  PROTOTYPE_BOUQUET_GROUPS,
  PrototypeWrappingSheet,
  PrototypeBouquetSize,
  PrototypeBouquetItem,
} from '../data/prototypeData';
import { BouquetShapeArt } from './PrototypeArt';
import RealisticBouquetPreview from './RealisticBouquetPreview';
import { db } from '../lib/database';
import { Decoration } from '../types/master';

export default function BouquetBuilder() {
  const router = useRouter();
  const { addCustomBouquetToBasket } = useBasket();

  // Dynamic state loaded from database with prototype fallback
  const [sheets, setSheets] = useState<PrototypeWrappingSheet[]>(PROTOTYPE_SHEETS);
  const [sizes, setSizes] = useState<PrototypeBouquetSize[]>(PROTOTYPE_SIZES);
  const [items, setItems] = useState<PrototypeBouquetItem[]>(PROTOTYPE_BOUQUET_ITEMS);
  const [decorations, setDecorations] = useState<Decoration[]>([]);

  // Selection states
  const [bsheet, setBsheet] = useState<string>('s1');
  const [bsize, setBsize] = useState<string>('md');
  const [bqty, setBqty] = useState<Record<string, number>>({ b1: 3, b3: 1 });
  const [selectedDecs, setSelectedDecs] = useState<string[]>([]);
  const [bfilter, setBfilter] = useState<string>('all');
  const [bmsg, setBmsg] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // Price animation state
  const prevTotalRef = useRef<number | null>(null);
  const [deltaChip, setDeltaChip] = useState<{ text: string; isNeg: boolean } | null>(null);
  const [isBumping, setIsBumping] = useState(false);
  const [addedBtnText, setAddedBtnText] = useState('Add to bag');

  // Mobile minibar state
  const [showMinibar, setShowMinibar] = useState(false);
  const builderRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Motion preference
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let active = true;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    Promise.resolve().then(() => {
      if (active) setCalm(media.matches);
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch dynamic data from database
  useEffect(() => {
    let isMounted = true;
    async function loadDbData() {
      try {
        const [dbSheets, dbSizes, dbItems, dbDecs] = await Promise.all([
          db.getWrappingSheets(),
          db.getBouquetSizes(),
          db.getBouquetItems(),
          db.getDecorations(),
        ]);

        if (!isMounted) return;

        if (dbSheets && dbSheets.length > 0) {
          const activeSheets = dbSheets
            .filter((s) => s.active !== false)
            .map((s) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              stock: s.stock,
              base: s.base || '#2a1226',
              trim: s.trim || '#f0b43c',
              dots: !!s.dots,
            }));
          if (activeSheets.length > 0) {
            setSheets(activeSheets);
            if (!activeSheets.some((s) => s.id === bsheet)) {
              setBsheet(activeSheets[0].id);
            }
          }
        }

        if (dbSizes && dbSizes.length > 0) {
          const activeSizes = dbSizes.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.baseCharge,
            max: s.maxPieces,
          }));
          setSizes(activeSizes);
        }

        if (dbItems && dbItems.length > 0) {
          const activeItems = dbItems.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            stock: i.stock,
            group: i.group,
            shape: (i.shape as PrototypeBouquetItem['shape']) || 'rose',
            color: i.color || '#e0607e',
          }));
          setItems(activeItems);
        }

        if (dbDecs && dbDecs.length > 0) {
          setDecorations(dbDecs);
        }
      } catch (err) {
        console.error('Failed to load dynamic bouquet options from db:', err);
      }
    }
    loadDbData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute selected size object & max pieces
  const sizeObj = useMemo(() => {
    return sizes.find((s) => s.id === bsize) || sizes[0] || PROTOTYPE_SIZES[1];
  }, [bsize, sizes]);

  const maxP = sizeObj.max;

  // Compute total pieces currently chosen
  const totalCount = useMemo(() => {
    return Object.values(bqty).reduce((a, b) => a + b, 0);
  }, [bqty]);

  // Trim quantities if switching to a smaller size
  const handleSelectSize = (sizeId: string) => {
    setBsize(sizeId);
    const newSize = sizes.find((s) => s.id === sizeId) || sizes[0] || PROTOTYPE_SIZES[1];
    const newMax = newSize.max;

    if (totalCount > newMax) {
      setBqty((prev) => {
        const next = { ...prev };
        let count = totalCount;
        const keys = Object.keys(next).reverse();
        for (const k of keys) {
          while (count > newMax && next[k] > 0) {
            next[k]--;
            count--;
          }
          if (count <= newMax) break;
        }
        return next;
      });
    }
  };

  // Selected sheet object
  const sheetObj = useMemo(() => {
    return sheets.find((s) => s.id === bsheet) || sheets[0] || PROTOTYPE_SHEETS[0];
  }, [bsheet, sheets]);

  // Toggle decoration handler
  const handleToggleDec = (id: string) => {
    setSelectedDecs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Compute totals, breakdown rows & expanded preview items
  const bouquetDetails = useMemo(() => {
    const total = (sheetObj?.price || 0) + (sizeObj?.price || 0);
    let runningTotal = total;
    let count = 0;
    const expanded: { shape: string; color: string; fresh: boolean }[] = [];
    const rows: { name: string; qty: number; amt: number }[] = [];
    const parts: string[] = [];
    let hasPhoto = false;

    items.forEach((it) => {
      const q = bqty[it.id] || 0;
      if (!q) return;
      count += q;
      const itTotal = q * it.price;
      runningTotal += itTotal;
      if (it.group === 'photo') hasPhoto = true;

      for (let k = 0; k < q; k++) {
        expanded.push({
          ...it,
          shape: it.shape,
          color: it.color,
          fresh: it.id === lastAdded && k === q - 1,
        });
      }

      rows.push({ name: it.name, qty: q, amt: itTotal });
      parts.push(`${q}x ${it.name}`);
    });

    const decRows: { id: string; name: string; price: number }[] = [];
    selectedDecs.forEach((dId) => {
      const d = decorations.find((x) => x.id === dId);
      if (d) {
        runningTotal += d.price;
        decRows.push({ id: d.id, name: d.name, price: d.price });
      }
    });

    return {
      sheet: sheetObj,
      size: sizeObj,
      total: runningTotal,
      count,
      expanded,
      rows,
      decRows,
      parts,
      hasPhoto,
    };
  }, [sheetObj, sizeObj, bqty, lastAdded, items, decorations, selectedDecs]);

  // Price animation bump & delta chip
  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = bouquetDetails.total;
    if (prev !== null && bouquetDetails.total !== prev) {
      const diff = bouquetDetails.total - prev;
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
  }, [bouquetDetails.total]);

  // Minibar Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    let inB = false;
    let inP = false;

    const setBar = () => {
      setShowMinibar(inB && !inP);
    };

    const obB = new IntersectionObserver(
      (es) => {
        inB = es[0]?.isIntersecting ?? false;
        setBar();
      },
      { threshold: 0.05 }
    );

    const obP = new IntersectionObserver(
      (es) => {
        inP = es[0]?.isIntersecting ?? false;
        setBar();
      },
      { threshold: 0.2 }
    );

    if (builderRef.current) obB.observe(builderRef.current);
    if (panelRef.current) obP.observe(panelRef.current);

    return () => {
      obB.disconnect();
      obP.disconnect();
    };
  }, []);

  // Quantity stepper handlers
  const handleItemInc = (it: PrototypeBouquetItem) => {
    const q = bqty[it.id] || 0;
    if (q >= it.stock || totalCount >= maxP) return;
    setBqty((prev) => ({ ...prev, [it.id]: q + 1 }));
    setLastAdded(it.id);
  };

  const handleItemDec = (it: PrototypeBouquetItem) => {
    const q = bqty[it.id] || 0;
    if (q <= 0) return;
    setBqty((prev) => {
      const next = { ...prev };
      if (q - 1 <= 0) delete next[it.id];
      else next[it.id] = q - 1;
      return next;
    });
  };

  const handleStartOver = () => {
    setBqty({});
    setSelectedDecs([]);
    setBmsg('');
    setRecipientName('');
    setLastAdded(null);
  };

  const handleAddBouquetToBag = () => {
    if (!bouquetDetails.count) return;

    const chosenItems = Object.entries(bqty)
      .filter(([_, q]) => q > 0)
      .map(([id, q]) => {
        const it = items.find((x) => x.id === id) || PROTOTYPE_BOUQUET_ITEMS.find((x) => x.id === id)!;
        return {
          id: it.id,
          name: it.name,
          quantity: q,
          unitPrice: it.price,
          group: it.group,
        };
      });

    const key = `${sheetObj.id}|${sizeObj.id}|${chosenItems
      .map((i) => `${i.id}:${i.quantity}`)
      .join(',')}|${selectedDecs.sort().join('+')}|${bmsg.trim()}`;
    const descParts = [
      `${sheetObj.name} sheet`,
      `${sizeObj.name.toLowerCase()} size`,
      ...bouquetDetails.parts,
    ];
    if (bouquetDetails.decRows.length > 0) {
      descParts.push(`with ${bouquetDetails.decRows.map((d) => d.name).join(', ')}`);
    }
    const desc = descParts.join(', ');

    addCustomBouquetToBasket({
      key,
      sheetId: sheetObj.id,
      sheetName: sheetObj.name,
      sheetPrice: sheetObj.price,
      selectedSizeId: sizeObj.id,
      selectedSizeName: sizeObj.name,
      sizeBaseCharge: sizeObj.price,
      items: chosenItems,
      decorations: bouquetDetails.decRows,
      cardMessage: bmsg.trim() || undefined,
      totalPrice: bouquetDetails.total,
      description: desc,
      hasPhotos: bouquetDetails.hasPhoto,
      photoUploadNote: recipientName ? `Recipient / Instructions: ${recipientName}` : undefined,
    });

    router.push('/cart');
  };

  // Preview SVG generation exactly as in the prototype
  const n = Math.min(bouquetDetails.expanded.length, 9);
  const more = bouquetDetails.expanded.length - n;

  return (
    <section id="builder" ref={builderRef} className="py-11 bg-[#faf6f4] border-b border-[#e8dcdc]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-end gap-3 flex-wrap mb-5.5">
          <div>
            <h2 className="font-display font-normal text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.1] text-[#231a1d]">
              Build your own bouquet
            </h2>
            <p className="font-body text-[#6a5b60] text-[0.95rem] mt-1.5 max-w-[60ch]">
              Four quick steps. Mix anything: only chocolates, photos with chocolates, a bracelet with a chain, or all of them.
            </p>
          </div>
        </div>

        {/* Builder Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-7 items-start">
          {/* Left Column: 5 Numbered Steps */}
          <div className="flex flex-col gap-4.5 min-w-0">
            {/* STEP 1: Wrapping Sheet */}
            <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  1
                </span>
                <span>Choose a wrapping sheet</span>
              </h3>
              <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
                Only sheets we have in stock are shown.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Wrapping sheet">
                {sheets.filter((x) => x.stock > 0).map((sheet) => {
                  const isChecked = bsheet === sheet.id;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() => setBsheet(sheet.id)}
                      className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${isChecked
                          ? 'border-[#7a1c3b] bg-[#f6e9ee]'
                          : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                        }`}
                    >
                      {/* Check indicator circle */}
                      {isChecked && (
                        <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                          <svg viewBox="0 0 18 18" className="w-3 h-3 stroke-white fill-none stroke-2">
                            <path d="M5 9.5 8 12.5 13.5 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}

                      {/* Sheet Swatch with Trim and Optional Polka Dots */}
                      <span
                        className="block relative w-11 h-11 rounded-[6px] border border-[rgba(35,26,29,0.18)] overflow-hidden mb-1"
                        style={{
                          backgroundColor: sheet.base,
                          backgroundImage: sheet.dots
                            ? `radial-gradient(${sheet.trim} 2.5px, transparent 3px)`
                            : undefined,
                          backgroundSize: sheet.dots ? '11px 11px' : undefined,
                        }}
                      >
                        <span
                          className="absolute left-0 right-0 top-0 h-[9px]"
                          style={{ backgroundColor: sheet.trim }}
                        />
                      </span>

                      <b className="font-bold text-[0.92rem] leading-[1.25] text-[#231a1d]">
                        {sheet.name}
                      </b>
                      <span className="font-bold text-[0.86rem] text-[#7a1c3b]">
                        ₹{sheet.price}
                      </span>
                      {sheet.stock <= 5 && (
                        <em className="not-italic text-[0.76rem] text-[#b3261e] font-bold">
                          Only {sheet.stock} left
                        </em>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Bouquet Size */}
            <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  2
                </span>
                <span>Choose a size</span>
              </h3>
              <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
                The size sets how many pieces fit in the bouquet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Bouquet size">
                {sizes.map((size) => {
                  const isChecked = bsize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() => handleSelectSize(size.id)}
                      className={`relative flex flex-col items-start gap-1 text-left bg-white border-[1.5px] rounded-[6px] p-3 transition-colors cursor-pointer ${isChecked
                          ? 'border-[#7a1c3b] bg-[#f6e9ee]'
                          : 'border-[#e8dcdc] hover:border-[#cfb6bd]'
                        }`}
                    >
                      {isChecked && (
                        <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7a1c3b] flex items-center justify-center">
                          <svg viewBox="0 0 18 18" className="w-3 h-3 stroke-white fill-none stroke-2">
                            <path d="M5 9.5 8 12.5 13.5 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                      <b className="font-bold text-[0.92rem] text-[#231a1d]">{size.name}</b>
                      <span className="text-[0.78rem] text-[#6a5b60]">Up to {size.max} pieces</span>
                      <span className="font-bold text-[0.86rem] text-[#7a1c3b]">
                        {size.price ? `+₹${size.price}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Add Products */}
            <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  3
                </span>
                <span>Add what you like</span>
              </h3>
              <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
                Chocolates, everlasting roses, photo prints, plushies, and dainty jewellery.
              </p>

              {/* Group Chips Filter */}
              <div className="flex flex-wrap gap-2 mb-3.5" role="group" aria-label="Filter products">
                {PROTOTYPE_BOUQUET_GROUPS.map(([key, label]) => {
                  const isActive = bfilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBfilter(key)}
                      aria-pressed={isActive}
                      className={`border-[1.5px] rounded-full px-3.5 py-1 font-semibold text-[0.82rem] transition-colors cursor-pointer ${isActive
                          ? 'bg-[#7a1c3b] border-[#7a1c3b] text-white'
                          : 'bg-white border-[#e8dcdc] text-[#231a1d] hover:border-[#7a1c3b] hover:text-[#7a1c3b]'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.filter(
                  (it) => it.stock > 0 && (bfilter === 'all' || it.group === bfilter)
                ).map((it) => {
                  const q = bqty[it.id] || 0;
                  const isItemOn = q > 0;
                  const isMaxReached = totalCount >= maxP;
                  const isStockReached = q >= it.stock;

                  return (
                    <div
                      key={it.id}
                      className={`grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-1 items-center p-2.5 border-[1.5px] rounded-[6px] transition-colors bg-white ${isItemOn ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc]'
                        }`}
                    >
                      {/* Shape Illustration Icon */}
                      <div className="w-14 h-14 bg-[#faf6f4] rounded-[6px] grid place-items-center">
                        <BouquetShapeArt shape={it.shape} color={it.color} className="w-11 h-11" />
                      </div>

                      {/* Details */}
                      <div>
                        <b className="block font-bold text-[0.9rem] leading-[1.25] text-[#231a1d]">
                          {it.name}
                        </b>
                        <span className="font-bold text-[0.86rem] text-[#7a1c3b]">
                          ₹{it.price} each
                        </span>
                        {it.stock <= 5 && (
                          <em className="block not-italic text-[0.76rem] text-[#b3261e] font-bold">
                            Only {it.stock} left
                          </em>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="col-span-2 flex items-center justify-between font-extrabold pt-1">
                        <button
                          type="button"
                          onClick={() => handleItemDec(it)}
                          disabled={q === 0}
                          aria-label={`One less ${it.name}`}
                          className="w-[34px] h-[34px] rounded-[6px] border-[1.5px] border-[#e8dcdc] bg-white text-[1.1rem] font-bold leading-none hover:border-[#7a1c3b] hover:text-[#7a1c3b] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-base font-bold tabular-nums text-[#231a1d]">{q}</span>
                        <button
                          type="button"
                          onClick={() => handleItemInc(it)}
                          disabled={isStockReached || isMaxReached}
                          aria-label={`One more ${it.name}`}
                          className="w-[34px] h-[34px] rounded-[6px] border-[1.5px] border-[#e8dcdc] bg-white text-[1.1rem] font-bold leading-none hover:border-[#7a1c3b] hover:text-[#7a1c3b] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: Decorations */}
            <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  4
                </span>
                <span>Add decorations (optional)</span>
              </h3>
              <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
                Double satin ribbon bows, warm fairy lights, golden crown picks, and calligraphy cards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {decorations.filter((d) => d.isActive).map((dec) => {
                  const isSelected = selectedDecs.includes(dec.id);
                  return (
                    <button
                      key={dec.id}
                      type="button"
                      onClick={() => handleToggleDec(dec.id)}
                      className={`relative flex items-center justify-between gap-3 text-left p-3 rounded-[6px] border-[1.5px] transition-colors cursor-pointer ${isSelected ? 'border-[#7a1c3b] bg-[#f6e9ee]' : 'border-[#e8dcdc] bg-white hover:border-[#cfb6bd]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center flex-none ${isSelected ? 'bg-[#7a1c3b] border-[#7a1c3b]' : 'border-[#cfb6bd] bg-white'
                            }`}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 14 14" className="w-2.5 h-2.5 stroke-white fill-none stroke-2">
                              <path d="M3 7.5 5.5 10 11 4.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="truncate">
                          <span className="block font-bold text-[0.88rem] text-[#231a1d] truncate">
                            {dec.name}
                          </span>
                          {dec.description && (
                            <span className="block text-[0.76rem] text-[#6a5b60] truncate">
                              {dec.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-[0.86rem] text-[#7a1c3b] whitespace-nowrap">
                        +₹{dec.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 5: Card Message & Personalisation */}
            <div className="bg-white border border-[#e8dcdc] rounded-[10px] p-5">
              <h3 className="font-body font-extrabold text-[1.05rem] text-[#231a1d] flex items-center gap-3 mb-1">
                <span className="w-7 h-7 rounded-full bg-[#7a1c3b] text-white text-[0.85rem] font-extrabold flex items-center justify-center flex-none">
                  5
                </span>
                <span>Card message &amp; recipient details</span>
              </h3>
              <p className="m-0 mb-3.5 ml-10 text-[0.84rem] text-[#6a5b60]">
                Optional. We handwrite this on a small card nestled inside the bouquet.
              </p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="bmsg" className="block text-xs font-bold text-[#231a1d] mb-1">
                    Greeting Card Message (up to 120 characters):
                  </label>
                  <textarea
                    id="bmsg"
                    rows={2}
                    maxLength={120}
                    value={bmsg}
                    onChange={(e) => setBmsg(e.target.value)}
                    placeholder="Happy birthday! Hope this brings joy and sweetest smiles ✨"
                    className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white p-3 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="recipientName" className="block text-xs font-bold text-[#231a1d] mb-1">
                    Recipient Name / Special Instructions:
                  </label>
                  <input
                    id="recipientName"
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Farhana / Please arrange chocolates in front row"
                    className="w-full border-[1.5px] border-[#e8dcdc] rounded-[6px] bg-white px-3 py-2 text-sm text-[#231a1d] focus:border-[#7a1c3b] focus:outline-none focus:ring-2 focus:ring-[#f6e9ee] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Panel (Order -1 on mobile so preview appears first) */}
          <aside
            id="bpanel"
            ref={panelRef}
            aria-label="Your bouquet"
            className="order-first lg:order-none sticky top-28 flex flex-col gap-3.5 bg-white border border-[#e8dcdc] rounded-[14px] p-5 shadow-[0_8px_28px_rgba(90,18,48,0.08)]"
          >
            {/* Header with Counter */}
            <div className="flex justify-between items-baseline gap-2.5">
              <h3 className="font-display font-normal text-[1.4rem] text-[#231a1d] m-0">
                Your bouquet
              </h3>
              <span className="text-[0.84rem] text-[#6a5b60] font-semibold">
                {bouquetDetails.count} of {sizeObj.max} pieces
              </span>
            </div>

            {/* Realistic Live Customization Preview (Matching Reference Photos) */}
            <div id="bpreview" className="bg-[#faf6f4] rounded-[10px] p-2 flex items-center justify-center overflow-hidden border border-[#e8dcdc]">
              <RealisticBouquetPreview
                sheet={sheetObj}
                size={sizeObj}
                expandedItems={bouquetDetails.expanded}
                selectedDecorations={selectedDecs}
                decorations={decorations}
                recipientName={recipientName}
                className="w-full max-w-[320px] h-auto"
              />
            </div>

            <p className="m-0 text-[0.82rem] text-[#6a5b60]">
              The picture is a guide. Handmade bouquets can look a little different.
            </p>

            {/* Total Price Box with Rolling Odometer and Delta Chip */}
            <div className={`relative flex items-center justify-between gap-3 py-2.5 border-y border-[#e8dcdc] font-extrabold text-[2.3rem] leading-[1.1] text-[#7a1c3b] ${isBumping ? 'bump' : ''
              }`}>
              <span className="text-[0.9rem] text-[#6a5b60] font-bold">Total</span>
              <span className="inline-flex items-baseline tabular-nums">
                <span className="text-xl mr-1 text-[#7a1c3b]">₹</span>
                <span>{bouquetDetails.total.toLocaleString('en-IN')}</span>
              </span>

              {/* Floating Delta Chip (+₹25 / −₹25) */}
              {deltaChip && (
                <span className={`delta ${deltaChip.isNeg ? 'neg' : ''}`}>
                  {deltaChip.text}
                </span>
              )}
            </div>

            {/* Itemized Summary List */}
            <ul className="list-none m-0 p-0 flex flex-col text-[0.88rem]">
              <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
                <span>{sheetObj.name} sheet</span>
                <span className="whitespace-nowrap font-bold tabular-nums">₹{sheetObj.price}</span>
              </li>
              <li className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
                <span>{sizeObj.name} size</span>
                <span className="whitespace-nowrap font-bold tabular-nums">
                  {sizeObj.price ? `₹${sizeObj.price}` : 'Included'}
                </span>
              </li>
              {bouquetDetails.rows.map((row, idx) => (
                <li key={idx} className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc]">
                  <span>
                    {row.qty} × {row.name}
                  </span>
                  <span className="whitespace-nowrap font-bold tabular-nums">
                    ₹{row.amt.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
              {bouquetDetails.decRows.map((dec, idx) => (
                <li key={`dec-${idx}`} className="flex justify-between gap-2.5 py-1.5 border-b border-[#e8dcdc] text-[#7a1c3b]">
                  <span>+ {dec.name}</span>
                  <span className="whitespace-nowrap font-bold tabular-nums">
                    ₹{dec.price.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>

            {/* Photo Notice */}
            {bouquetDetails.hasPhoto && (
              <p className="m-0 text-[0.82rem] text-[#6a5b60] bg-[#fbf3e4] p-2.5 rounded-[6px] border border-[#e6cf9b]">
                You picked photos. After you order, send us the pictures on WhatsApp or Instagram.
              </p>
            )}

            {/* Add to Bag Button */}
            <button
              id="bAdd"
              type="button"
              onClick={handleAddBouquetToBag}
              disabled={bouquetDetails.count === 0}
              className="btn-boutique block w-full py-3.5 text-base cursor-pointer"
            >
              {bouquetDetails.count ? addedBtnText : 'Pick at least one item'}
            </button>

            {/* Start Over Button */}
            <button
              id="bClear"
              type="button"
              onClick={handleStartOver}
              className="bg-transparent border-0 p-0 self-start font-bold text-[0.86rem] text-[#6a5b60] underline underline-offset-4 hover:text-[#7a1c3b] cursor-pointer"
            >
              Start over
            </button>
          </aside>
        </div>
      </div>

      {/* Floating Bottom Minibar on Mobile */}
      <a
        href="#bpanel"
        className={`minibar ${showMinibar ? 'show' : ''}`}
        aria-label="See your bouquet"
      >
        <span>
          Your bouquet <span className="font-extrabold text-[1.35rem] ml-1">₹{bouquetDetails.total}</span>
        </span>
        <span className="text-[0.82rem] underline underline-offset-4 font-semibold">View</span>
      </a>
    </section>
  );
}
