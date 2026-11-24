'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useBasket } from '../../context/BasketContext';
import { useWishlist } from '../../context/WishlistContext';
import { db, Coupon } from '../../lib/database';
import OrderInfoModal from '../../components/OrderInfoModal';
import {
  ArrowLeft,
  ChevronLeft,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Tag,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromBasket,
    clearBasket,
    subtotal,
    giftWrap,
    setGiftWrap,
    giftNote,
    setGiftNote,
    giftWrapFee,
    itemCount,
  } = useBasket();

  const { wishlist } = useWishlist();

  // Order info modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    label: string;
    discountType?: 'percentage' | 'flat';
    discountValue?: number;
    minOrder?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showGiftWrapOptions, setShowGiftWrapOptions] = useState(false);

  // Load active coupons from database
  const loadCoupons = async () => {
    try {
      const list = await db.getCoupons();
      setAvailableCoupons(list.filter((c) => c.isActive));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Free delivery logic
  const FREE_SHIPPING_THRESHOLD = 899;
  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryCharge = isFreeDelivery || items.length === 0 ? 0 : 50;

  // Apply Coupon Object Helper
  const applyCouponObject = (coupon: Coupon) => {
    if (!coupon.isActive) {
      setCouponError(`Coupon code "${coupon.code}" is currently inactive.`);
      return;
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      setCouponError(
        `Minimum order of ₹${coupon.minOrder} required for ${coupon.code}. Your subtotal is ₹${subtotal}.`
      );
      return;
    }

    let discount = 0;
    let label = '';
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      label = `${coupon.discountValue}% OFF`;
    } else {
      discount = Math.min(subtotal, coupon.discountValue);
      label = `₹${coupon.discountValue} OFF`;
    }

    setAppliedCoupon({
      code: coupon.code,
      discount,
      label,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder,
    });
    setCouponSuccess(`Coupon ${coupon.code} applied! (${label}) ✨`);
    setCouponCode('');
  };

  // Apply Coupon Logic
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    const allCoupons = await db.getCoupons();
    const found = allCoupons.find((c) => c.code.trim().toUpperCase() === code);

    if (found) {
      applyCouponObject(found);
      return;
    }

    if (code === 'GIVENTO10' || code === 'SWEET10') {
      applyCouponObject({
        code,
        discountType: 'percentage',
        discountValue: 10,
        minOrder: 499,
        isActive: true,
      });
    } else if (code === 'FIRSTLOVE') {
      applyCouponObject({
        code,
        discountType: 'flat',
        discountValue: 50,
        minOrder: 299,
        isActive: true,
      });
    } else if (code === 'FESTIVEBOUQUET') {
      applyCouponObject({
        code,
        discountType: 'flat',
        discountValue: 100,
        minOrder: 899,
        isActive: true,
      });
    } else {
      setCouponError('Invalid coupon code. Please verify and try again.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  // Cost calculations
  const packagingFee = giftWrap ? giftWrapFee : 0;
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.discountType === 'percentage' && appliedCoupon.discountValue) {
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
    return Math.min(subtotal, appliedCoupon.discount);
  }, [appliedCoupon, subtotal]);

  const finalTotal = Math.max(0, subtotal + packagingFee + deliveryCharge - couponDiscount);

  // Save cart order to admin database
  const handleCartOrderSubmit = async (customerData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    instructions: string;
  }) => {
    const newOrder = await db.createOrder({
      customerName: customerData.name,
      customerPhone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      pincode: customerData.pincode,
      status: 'Pending WhatsApp Confirmation',
      channel: 'website',
      paymentMethod: 'whatsapp',
      paymentStatus: 'Pending',
      subtotal,
      discount: couponDiscount,
      giftWrap,
      giftNote,
      deliveryFee: deliveryCharge,
      total: finalTotal,
      adminNotes: [
        customerData.instructions ? `Special Instructions: ${customerData.instructions}` : '',
        appliedCoupon ? `Coupon Applied: ${appliedCoupon.code} (-₹${couponDiscount})` : '',
      ]
        .filter(Boolean)
        .join(' | '),
      items: items.map((it) => ({
        productId: it.product.id,
        productName: it.isCustomBouquet ? 'Custom Bouquet' : it.product.name,
        quantity: it.quantity,
        price: it.isCustomBouquet && it.customBouquet ? it.customBouquet.totalPrice : (it.product.price || 0),
        image:
          it.product.images?.[0] ||
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
        variants: it.selectedVariants,
        personalisation: it.personalisationData,
      })),
    });
    clearBasket();
    return newOrder;
  };

  // WhatsApp message template
  const waCartTemplate =
    `Hello Givento Studio! 🌸\n*ORDER from givento.in*\n\n` +
    items
      .map((it, idx) => {
        const itemPrice = it.isCustomBouquet && it.customBouquet
          ? it.customBouquet.totalPrice
          : (it.product.price || 0);
        let imageNote = '';
        if (it.product.images && it.product.images.length > 0 && it.product.images[0]) {
          const raw = it.product.images[0];
          const full = raw.startsWith('http')
            ? raw
            : typeof window !== 'undefined'
            ? `${window.location.origin}${raw.startsWith('/') ? '' : '/'}${raw}`
            : `https://givento.in/${raw}`;
          imageNote = `\n   🖼️ Product Image: ${full}`;
        }
        return `${idx + 1}. *${it.isCustomBouquet ? 'Custom Bouquet' : it.product.name}* (x${it.quantity}) — ₹${itemPrice * it.quantity}${imageNote}`;
      })
      .join('\n') +
    `\n\nSubtotal: ₹${subtotal}\n` +
    (giftWrap ? `Gift Wrap: Yes (Card: "${giftNote}")\n` : '') +
    (appliedCoupon ? `Coupon (${appliedCoupon.code}): -₹${couponDiscount}\n` : '') +
    `Delivery: ${isFreeDelivery ? 'FREE' : '₹50'}\n` +
    `*Grand Total: ₹${finalTotal}*`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans antialiased flex flex-col justify-between selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      {/* Main Container harmonized with website layout */}
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col px-4 sm:px-6 pt-5 pb-12 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C827A]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span>Shopping Bag</span>
        </div>

        {/* 1. Header matching reference image layout */}
        <header className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] active:scale-95 transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <h1 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight text-center">
            Shopping Bag
          </h1>

          {/* Right bag button with count badge */}
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EFE8E1] shadow-2xs flex items-center justify-center text-[#1C1917]">
              <ShoppingBag className="w-5 h-5 stroke-[1.9]" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7A1C3B] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
        </header>

        {/* 2. Main Cart Content Area */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-8 h-8 text-[#A39992] stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-medium text-xl text-[#1C1917]">
                Your bag is empty
              </h2>
              <p className="text-xs text-[#8C827A] max-w-xs mx-auto">
                Explore our handcrafted bouquets, custom frames, and everyday jewellery.
              </p>
            </div>
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6">
            {/* 3. Items List matching reference layout exactly */}
            <div className="space-y-3.5">
              {items.map((item) => {
                const isCustom = item.isCustomBouquet && item.customBouquet;
                const price = isCustom
                  ? item.customBouquet?.totalPrice || 0
                  : (item.product.price ?? item.product.priceFrom ?? 0);

                const imageSrc =
                  item.product.images && item.product.images[0]
                    ? item.product.images[0]
                    : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80';

                const qtyFormatted = String(item.quantity).padStart(2, '0');

                // Detail subtitle / variants
                const variantText = item.selectedVariants
                  ? Object.values(item.selectedVariants).join(', ')
                  : '';
                const noteText = item.personalisationData
                  ? Object.entries(item.personalisationData).map(([k, v]) => `${k}: ${v}`).join(' · ')
                  : '';
                const subtitle =
                  variantText ||
                  noteText ||
                  item.product.shortDescription ||
                  item.product.realmName ||
                  'Handcrafted Studio Piece';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-3.5 border border-[#E8E2D9] shadow-2xs flex items-center gap-3.5 transition-all hover:border-[#DFD5CB]"
                  >
                    {/* Left: Square Thumbnail */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8E1] flex items-center justify-center">
                      <img
                        src={imageSrc}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Middle: Product Name, Subtitle, Bold Price */}
                    <div className="flex-1 min-w-0 pr-1 space-y-0.5">
                      <h3 className="font-heading font-medium text-sm sm:text-base text-[#1C1917] line-clamp-1 leading-snug">
                        {item.isCustomBouquet ? 'Custom Bouquet' : item.product.name}
                      </h3>
                      <p className="text-[11px] text-[#8C827A] line-clamp-1">
                        {subtitle}
                      </p>
                      <div className="font-sans font-bold text-sm sm:text-base text-[#1C1917] pt-0.5 tabular-nums">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Right: Top cross button & Bottom Stepper */}
                    <div className="flex flex-col justify-between items-end self-stretch py-0.5 shrink-0">
                      {/* Top Right: Delete cross */}
                      <button
                        type="button"
                        onClick={() => removeFromBasket(item.id)}
                        aria-label="Remove item"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#A39992] hover:text-[#B3261E] hover:bg-[#FAF7F2] transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2]" />
                      </button>

                      {/* Bottom Right: Stepper [-] [01] [+] matching reference layout */}
                      <div className="flex items-center gap-2 pt-2">
                        {/* Minus button: Outlined circle */}
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
                          className="w-7 h-7 rounded-full border border-[#D5CCC3] hover:border-[#1C1917] flex items-center justify-center text-[#1C1917] active:scale-95 transition cursor-pointer bg-white"
                        >
                          <Minus className="w-3 h-3 stroke-[2.2]" />
                        </button>

                        {/* Quantity Number */}
                        <span className="font-mono text-xs font-semibold tabular-nums text-[#1C1917] min-w-[20px] text-center">
                          {qtyFormatted}
                        </span>

                        {/* Plus button: Solid dark circle with white icon */}
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. Promo Code Bar matching reference pill container */}
            <div className="space-y-2">
              <div className="bg-white rounded-full p-1.5 pl-5 border border-[#E8E2D9] shadow-2xs flex items-center justify-between">
                {appliedCoupon ? (
                  <div className="flex-1 flex items-center justify-between pr-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#7A1C3B]" />
                      <span className="font-bold text-xs text-[#7A1C3B] uppercase tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] font-semibold text-[#8C827A]">
                        ({appliedCoupon.label})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-[#8C827A] hover:text-[#B3261E] cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex-1 flex items-center justify-between">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo Code"
                      className="bg-transparent text-xs sm:text-sm font-medium text-[#1C1917] placeholder-[#A39992] focus:outline-none flex-1 pr-2"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {couponError && (
                <p className="text-[11px] text-[#B3261E] px-4 font-medium">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-[#7A1C3B] px-4 font-semibold">{couponSuccess}</p>
              )}

              {/* Available active coupon suggestion pills */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-2">
                  <span className="text-[10px] text-[#8C827A]">Available:</span>
                  {availableCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCouponCode(c.code);
                        applyCouponObject(c);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#F6E9EE] border border-[#E8E2D9] text-[10px] font-semibold text-[#7A1C3B] transition cursor-pointer"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Compact Gift Wrap & Note Toggle (Clean & unobtrusive) */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#E8E2D9] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#7A1C3B]" />
                  <span className="text-xs font-medium text-[#1C1917]">
                    Add Gift Box &amp; Handwritten Note (+₹{giftWrapFee})
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={giftWrap}
                  onClick={() => {
                    const next = !giftWrap;
                    setGiftWrap(next);
                    setShowGiftWrapOptions(next);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    giftWrap ? 'bg-[#1C1917]' : 'bg-[#E5DCD4]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      giftWrap ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {giftWrap && (
                <div className="pt-2 border-t border-[#FAF7F2] space-y-2 animate-in fade-in duration-200">
                  <textarea
                    rows={2}
                    maxLength={140}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a message to be handwritten on textured cardstock with wax seal..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-[#1C1917] placeholder-[#A39992] focus:outline-none focus:border-[#1C1917] resize-none"
                  />
                </div>
              )}
            </div>

            {/* 6. Cost Breakdown matching reference image layout */}
            <div className="space-y-3 pt-2">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs sm:text-sm text-[#57534E]">
                <span className="font-medium text-[#1C1917]">Subtotal</span>
                <span className="font-semibold text-[#1C1917] tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')} <span className="text-[10px] text-[#8C827A] font-normal">INR</span>
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center text-xs sm:text-sm text-[#57534E]">
                <span className="font-medium text-[#1C1917]">Shipping</span>
                <span className="font-semibold text-[#1C1917] tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="font-bold text-[#7A1C3B]">FREE</span>
                  ) : (
                    <>₹{deliveryCharge} <span className="text-[10px] text-[#8C827A] font-normal">INR</span></>
                  )}
                </span>
              </div>

              {/* Gift Wrap fee if any */}
              {giftWrap && (
                <div className="flex justify-between items-center text-xs sm:text-sm text-[#57534E]">
                  <span className="font-medium text-[#1C1917]">Gift Box &amp; Wax Note</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    ₹{packagingFee} <span className="text-[10px] text-[#8C827A] font-normal">INR</span>
                  </span>
                </div>
              )}

              {/* Promo Discount if any */}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs sm:text-sm text-[#7A1C3B]">
                  <span className="font-medium">Promo Discount ({appliedCoupon.code})</span>
                  <span className="font-bold tabular-nums">
                    −₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Bag Total Row matching reference layout:
                  Bag Total         (4 Items) $50.98 USD
              */}
              <div className="flex justify-between items-baseline pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-medium text-base sm:text-lg text-[#1C1917]">
                    Bag Total
                  </span>
                  <span className="text-xs text-[#8C827A]">
                    ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
                  </span>
                </div>
                <div className="font-sans font-bold text-xl sm:text-2xl text-[#1C1917] tabular-nums">
                  ₹{finalTotal.toLocaleString('en-IN')}{' '}
                  <span className="text-xs text-[#8C827A] font-normal">INR</span>
                </div>
              </div>
            </div>

            {/* 7. Big Pill Button matching reference: "Proceed To Checkout" */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setOrderModalOpen(true)}
                className="w-full py-4 px-6 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Proceed To Checkout</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Order Info Modal to capture customer delivery address and create order */}
      <OrderInfoModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        waMessageTemplate={waCartTemplate}
        submitLabel="Confirm & Place Order"
        onCompleteOrder={handleCartOrderSubmit}
      />
    </div>
  );
}
