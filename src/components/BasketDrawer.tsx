'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBasket } from '../context/BasketContext';
import { Heart, Trash2, ShoppingBag, X } from 'lucide-react';

export default function BasketDrawer() {
  const pathname = usePathname();
  const {
    items,
    isOpen,
    closeBasket,
    updateQuantity,
    removeFromBasket,
    clearBasket,
    itemCount,
  } = useBasket();

  // Customer details inside the drawer
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [shippingRegion, setShippingRegion] = useState<'local_adiram' | 'tamil_nadu' | 'interstate' | 'pickup'>('local_adiram');
  const [cAddr, setCAddr] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    total: number;
    status: string;
    whatsappUrl: string;
    trackingUrl: string;
  } | null>(null);

  // Compute subtotal and price uncertainty
  const { subtotal, unsure } = useMemo(() => {
    let sum = 0;
    let isUnsure = false;

    items.forEach((item) => {
      const q = item.quantity;
      if (item.isCustomBouquet && item.customBouquet) {
        sum += item.customBouquet.totalPrice * q;
      } else {
        const p = item.product;
        if (p.price == null || p.priceType === 'on_request') {
          isUnsure = true;
        } else if (p.priceType === 'from') {
          isUnsure = true;
          sum += (p.priceFrom || p.price || 0) * q;
        } else {
          sum += (p.price || 0) * q;
        }
      }
    });

    return { subtotal: sum, unsure: isUnsure };
  }, [items]);

  // Regional shipping charge preview
  const { shippingFee } = useMemo(() => {
    if (shippingRegion === 'pickup') {
      return { shippingFee: 0 };
    }
    if (shippingRegion === 'local_adiram') {
      const isFree = subtotal >= 499;
      return { shippingFee: isFree ? 0 : 30 };
    }
    if (shippingRegion === 'tamil_nadu') {
      const isFree = subtotal >= 899;
      return { shippingFee: isFree ? 0 : 50 };
    }
    // interstate
    const isFree = subtotal >= 999;
    return { shippingFee: isFree ? 0 : 70 };
  }, [shippingRegion, subtotal]);

  const estimatedTotal = subtotal + shippingFee;
  const isPickup = shippingRegion === 'pickup';

  // Hide on admin routes or when closed
  if (pathname?.startsWith('/admin') || !isOpen) {
    return null;
  }

  // Server checkout submission helper
  const submitOrderToServer = async (targetAction: 'whatsapp' | 'instagram' | 'copy') => {
    setServerError('');
    setCopyStatus('');

    if (!cName.trim() || !cPhone.trim()) {
      setServerError('Please enter your name and WhatsApp phone number.');
      return null;
    }

    if (!isPickup && !cAddr.trim()) {
      setServerError('Please enter your delivery street address or area.');
      return null;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          name: cName.trim(),
          phone: cPhone.trim(),
          address: isPickup ? 'Direct Studio Pickup' : cAddr.trim(),
          city: 'Adirampattinam',
          pincode: '614701',
        },
        shippingFee,
        shippingRegion,
        giftNote: giftNote.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product?.id,
          quantity: i.quantity,
          isCustomBouquet: i.isCustomBouquet,
          customBouquet: i.customBouquet,
          variants: i.selectedVariants,
          personalisation: i.personalisationData,
        })),
        channel: targetAction === 'instagram' ? 'instagram' : 'whatsapp',
      };

      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.error || 'Could not place order. Please review your bag.');
        setIsSubmitting(false);
        return null;
      }

      setPlacedOrder({
        orderId: data.orderId,
        total: data.total,
        status: data.status,
        whatsappUrl: data.whatsappUrl,
        trackingUrl: data.trackingUrl,
      });

      setIsSubmitting(false);
      clearBasket();
      return data;
    } catch {
      setServerError('Network connection issue. Please check your internet and try again.');
      setIsSubmitting(false);
      return null;
    }
  };

  const handleOrderOnWhatsApp = async () => {
    const data = await submitOrderToServer('whatsapp');
    if (data?.whatsappUrl) {
      window.open(data.whatsappUrl, '_blank');
    }
  };

  const handleMessageOnInstagram = async () => {
    const data = await submitOrderToServer('instagram');
    if (data?.orderId) {
      const igText = encodeURIComponent(
        `Hi Givento! 🌸 I placed order #${data.orderId} (₹${data.total}). Here are my details!`
      );
      window.open(`https://ig.me/m/givento.in?text=${igText}`, '_blank');
    }
  };

  const handleCopyOrder = async () => {
    const data = await submitOrderToServer('copy');
    if (data?.orderText) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(data.orderText);
        setCopyStatus(`Order #${data.orderId} copied to clipboard! Paste it on WhatsApp or Instagram.`);
      }
    }
  };

  const resetDrawerForNewOrder = () => {
    setPlacedOrder(null);
    setServerError('');
    setCopyStatus('');
    closeBasket();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeBasket}
        aria-hidden="true"
      />

      {/* 2. Slide-in Drawer */}
      <aside
        id="drawer"
        role="dialog"
        aria-label="Your bag"
        className="relative w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EFE8E1] px-4 py-3 bg-[#FAF7F2]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[#E0607E] text-base">🎀</span>
            <h2 className="font-display font-medium text-lg text-[#1C1917] m-0">
              {placedOrder ? 'Order Placed ✨' : `Your Cart (${itemCount})`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && !placedOrder && (
              <button
                type="button"
                onClick={clearBasket}
                className="text-xs font-medium text-[#D9466C] hover:text-[#B3264B] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              id="closeBag"
              type="button"
              onClick={closeBasket}
              aria-label="Close bag"
              className="w-7 h-7 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center cursor-pointer text-[#1C1917] hover:bg-gray-100 text-xs shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-4 bg-[#FAF7F2] flex-1 flex flex-col">
          {/* SUCCESS SCREEN STATE */}
          {placedOrder ? (
            <div className="p-4 space-y-4 text-center bg-white rounded-2xl border border-[#EFE8E1]">
              <div className="w-12 h-12 rounded-full bg-[#fbf3e4] text-[#7a1c3b] flex items-center justify-center mx-auto text-xl font-bold border border-[#c5a059]/30">
                ✓
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#78716c]">
                  Order Number
                </span>
                <div className="font-display font-normal text-2xl text-[#7A1C3B] mt-0.5">
                  {placedOrder.orderId}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbf3e4] text-[#7a1c3b] text-xs font-semibold mt-2 border border-[#c5a059]/30">
                  <span>Status:</span>
                  <span>{placedOrder.status}</span>
                </div>
              </div>

              <p className="text-xs text-[#57534e] leading-relaxed">
                Thank you, <strong>{cName}</strong>! Your order is saved on our workshop desk. We confirm every handcrafted parcel directly on WhatsApp before creating.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href={placedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-boutique block w-full py-3 text-center"
                >
                  Open WhatsApp to Confirm
                </a>

                <Link
                  href={placedOrder.trackingUrl}
                  onClick={closeBasket}
                  className="btn-boutique alt block w-full py-2.5 text-center text-xs"
                >
                  Track Order Online
                </Link>

                <button
                  type="button"
                  onClick={resetDrawerForNewOrder}
                  className="text-xs text-[#78716c] hover:underline pt-2 block mx-auto cursor-pointer"
                >
                  Back to Store
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Go to full cart page shortcut */}
              {items.length > 0 && (
                <div className="mb-3">
                  <Link
                    href="/cart"
                    onClick={closeBasket}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[#E8DFD5] text-[#7a1c3b] hover:bg-[#FDF3F5] text-xs font-semibold flex items-center justify-between shadow-2xs transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#7a1c3b]" />
                      <span>View Full Cart Page &amp; Custom Notes</span>
                    </span>
                    <span>→</span>
                  </Link>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-3 mb-4">
                {items.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EFE8E1] p-8 text-center text-xs text-[#78716c]">
                    <div className="text-2xl mb-1">🧺</div>
                    <p className="font-semibold text-sm text-[#1c1917] mb-1">Your cart is currently empty</p>
                    <p className="text-[#8c827a] mb-3">Add items from the shop to start crafting your gift.</p>
                    <Link
                      href="/category/all"
                      onClick={closeBasket}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7a1c3b] text-white text-xs font-semibold shadow-2xs hover:bg-[#5a1230] transition-colors"
                    >
                      Browse Gifts 🌻
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const isCustom = item.isCustomBouquet && item.customBouquet;
                    const name = isCustom ? 'Your custom bouquet' : item.product.name;
                    const desc = isCustom ? item.customBouquet?.description : item.product.shortDescription;
                    const imageSrc =
                      item.product.images && item.product.images[0]
                        ? item.product.images[0]
                        : '/images/sunflower-bouquet.svg';

                    let amtDisplay = 'ask';
                    if (isCustom) {
                      amtDisplay = `₹${((item.customBouquet?.totalPrice || 0) * item.quantity).toLocaleString('en-IN')}`;
                    } else if (item.product.price == null || item.product.priceType === 'on_request') {
                      amtDisplay = 'ask us 💌';
                    } else if (item.product.priceType === 'from') {
                      amtDisplay = `from ₹${((item.product.priceFrom || item.product.price || 0) * item.quantity).toLocaleString('en-IN')}`;
                    } else {
                      amtDisplay = `₹${((item.product.price || 0) * item.quantity).toLocaleString('en-IN')}`;
                    }

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-3 border border-[#F3ECE4] shadow-xs flex items-center gap-3 transition-all"
                      >
                        {/* Thumbnail with Heart */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8E1] flex items-center justify-center">
                          <img
                            src={imageSrc}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/95 flex items-center justify-center shadow-2xs">
                            <Heart className="w-2.5 h-2.5 text-[#8C827A] stroke-[1.5]" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917] truncate leading-tight flex items-center gap-1">
                              <span>{name}</span>
                              <span className="text-[#E0607E] text-[10px]">♡</span>
                            </h4>
                          </div>

                          {desc && (
                            <p className="text-[10px] text-[#8C827A] truncate mt-0.5">
                              {desc}
                            </p>
                          )}

                          <div className="text-xs sm:text-sm font-bold text-[#1C1917] my-0.5 tabular-nums">
                            {amtDisplay}
                          </div>

                          {/* Stepper & Remove */}
                          <div className="flex items-center justify-between pt-0.5">
                            <div className="inline-flex items-center bg-[#F6E9EE] rounded-full px-2 py-0.5 gap-2.5 text-xs font-semibold text-[#1C1917]">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity <= 1) {
                                    removeFromBasket(item.id);
                                  } else {
                                    updateQuantity(item.id, item.quantity - 1);
                                  }
                                }}
                                aria-label="Decrease quantity"
                                className="w-4 h-4 flex items-center justify-center text-xs leading-none text-[#1C1917] hover:text-[#7A1C3B] active:scale-125 transition-transform cursor-pointer"
                              >
                                −
                              </button>
                              <span className="font-mono tabular-nums min-w-[10px] text-center text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-4 h-4 flex items-center justify-center text-xs leading-none text-[#1C1917] hover:text-[#7A1C3B] active:scale-125 transition-transform cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromBasket(item.id)}
                              className="text-[11px] font-medium text-[#8C827A] hover:text-[#D9466C] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Form */}
              {items.length > 0 && (
                <div className="space-y-3 mt-auto pt-2">
                  <div>
                    <label htmlFor="cName" className="block text-xs font-semibold text-[#6a5b60] mb-1">Your Name</label>
                    <input
                      id="cName"
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      autoComplete="name"
                      placeholder="e.g. Ayesha Rahman"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-[#e8dcdc] bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="cPhone" className="block text-xs font-semibold text-[#6a5b60] mb-1">WhatsApp Number</label>
                    <input
                      id="cPhone"
                      type="tel"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="e.g. 98400 12345"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-[#e8dcdc] bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="cRegion" className="block text-xs font-semibold text-[#6a5b60] mb-1">Delivery or Pickup</label>
                    <select
                      id="cRegion"
                      value={shippingRegion}
                      onChange={(e) => setShippingRegion(e.target.value as any)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-[#e8dcdc] bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20"
                    >
                      <option value="local_adiram">Delivery in Adirampattinam (₹30 · Free over ₹499)</option>
                      <option value="tamil_nadu">Tamil Nadu Express (₹50 · Free over ₹899)</option>
                      <option value="interstate">Other States / All India (₹70 · Free over ₹999)</option>
                      <option value="pickup">Direct Pickup in Adirampattinam (Free)</option>
                    </select>
                  </div>

                  {!isPickup && (
                    <div>
                      <label htmlFor="cAddr" className="block text-xs font-semibold text-[#6a5b60] mb-1">Delivery Address</label>
                      <input
                        id="cAddr"
                        type="text"
                        value={cAddr}
                        onChange={(e) => setCAddr(e.target.value)}
                        autoComplete="street-address"
                        placeholder="Street, area, landmark, pincode"
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-[#e8dcdc] bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="giftNote" className="block text-xs font-semibold text-[#6a5b60] mb-1">Gift Note on Card (optional)</label>
                    <textarea
                      id="giftNote"
                      rows={2}
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Happy birthday! Wishing you the brightest year."
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-[#e8dcdc] bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#7a1c3b]/20 resize-none"
                    />
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-[#FFF5F7] border border-[#FDE2E7] rounded-2xl p-3.5 text-xs space-y-2 mt-2">
                    <div className="flex justify-between text-[#57534E]">
                      <span>Items subtotal</span>
                      <span className="font-semibold text-sm text-[#1C1917] tabular-nums">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#57534E]">
                      <span>Delivery ({shippingRegion === 'pickup' ? 'Pickup' : 'Courier'})</span>
                      <span className="font-semibold text-[#1C1917] tabular-nums">
                        {shippingFee === 0 ? <strong className="text-[#7A1C3B]">FREE</strong> : `₹${shippingFee}`}
                      </span>
                    </div>

                    <div className="h-px bg-[#F8DAE1] my-1" />

                    <div className="flex justify-between items-center pt-0.5">
                      <span className="font-display font-bold text-sm text-[#1C1917]">Total</span>
                      <span id="total" className="tabular-nums font-display font-bold text-base text-[#1C1917]">
                        ₹{estimatedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {unsure && (
                    <p className="text-[11px] text-[#78716c]">
                      Some items are &ldquo;from&rdquo; prices or &ldquo;ask us&rdquo;. We confirm the final exact total with you on WhatsApp.
                    </p>
                  )}

                  {serverError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                      ⚠️ {serverError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <button
                    id="waLink"
                    type="button"
                    onClick={handleOrderOnWhatsApp}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#853648] hover:bg-[#702D3C] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSubmitting ? 'Securing your order...' : 'Order on WhatsApp 💬'}</span>
                  </button>

                  <button
                    id="copyOrder"
                    type="button"
                    onClick={handleCopyOrder}
                    disabled={isSubmitting}
                    className="btn-boutique alt block w-full py-2 text-xs text-center cursor-pointer disabled:opacity-60"
                  >
                    Copy order text
                  </button>

                  <button
                    type="button"
                    onClick={handleMessageOnInstagram}
                    disabled={isSubmitting}
                    className="btn-boutique alt block w-full py-2 text-xs text-center cursor-pointer disabled:opacity-60"
                  >
                    Message on Instagram
                  </button>

                  {/* Status Notice */}
                  <div className="status text-xs text-[#78716c] text-center" role="status">
                    {copyStatus ||
                      (!cName.trim() || !cPhone.trim()
                        ? 'Add your name and number so our artisan can reach you.'
                        : '')}
                  </div>

                  {/* Collapsible Order Message Preview */}
                  <details
                    open={showDetails}
                    onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}
                    className="border-t border-[#e8dcdc] pt-2"
                  >
                    <summary className="font-medium text-xs text-[#78716c] cursor-pointer hover:text-[#7a1c3b]">
                      How WhatsApp ordering works
                    </summary>
                    <p className="mt-1 text-[11px] text-[#78716c] leading-relaxed">
                      Clicking &ldquo;Order on WhatsApp&rdquo; reserves your items with status <strong>Pending WhatsApp Confirmation</strong>. Our studio verifies custom details and sends UPI payment QR directly on WhatsApp.
                    </p>
                  </details>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
