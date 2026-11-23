'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBasket } from '../../context/BasketContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../types';
import { db, Coupon } from '../../lib/database';
import OrderInfoModal from '../../components/OrderInfoModal';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Heart,
  ShoppingBag,
  Gift,
  CheckCircle2,
  Sparkles,
  X,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  Feather,
  Truck,
  Lock,
  Check,
  MessageCircle,
  CreditCard,
} from 'lucide-react';

// Curated 1-tap add-on items
const FINISHING_TOUCHES: Array<{
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  price: number;
  image: string;
}> = [
  {
    id: 'addon-pouch',
    name: 'Velvet Jewellery Pouch',
    subtitle: 'Anti-tarnish lining',
    badge: 'Cute',
    price: 49,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'addon-polaroid',
    name: 'Mini Polaroid Memory Print',
    subtitle: 'Fuji Instax Glossy',
    badge: 'Custom',
    price: 39,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'addon-clip',
    name: 'Crochet Flower Hair Clip',
    subtitle: 'Hand-knitted blossom',
    badge: 'Handmade',
    price: 79,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'addon-charm',
    name: 'Resin Gold Flake Charm',
    subtitle: '24k gold leaf & pearl',
    badge: 'Artisan',
    price: 99,
    image: 'https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=400&q=80',
  },
];

export default function CartPage() {
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
    addToBasket,
  } = useBasket();

  const { addToWishlist, wishlist } = useWishlist();

  // Order modal state
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
  const [savedAllNotice, setSavedAllNotice] = useState(false);
  const [addedAddonIds, setAddedAddonIds] = useState<Record<string, boolean>>({});

  // Load active coupons from database / localStorage
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

  // Free delivery threshold
  const FREE_SHIPPING_THRESHOLD = 899;
  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryCharge = isFreeDelivery || items.length === 0 ? 0 : 50;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Apply Coupon Object Helper
  const applyCouponObject = (coupon: Coupon) => {
    if (!coupon.isActive) {
      setCouponError(`Coupon code "${coupon.code}" is currently inactive or disabled.`);
      return;
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      setCouponError(
        `Minimum order of ₹${coupon.minOrder} required for ${coupon.code}. Your cart items total is ₹${subtotal}.`
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

  // Apply Coupon Logic (Dynamic from Database)
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    // 1. Fetch live dynamic coupons from DB / localStorage
    const allCoupons = await db.getCoupons();
    const found = allCoupons.find((c) => c.code.trim().toUpperCase() === code);

    if (found) {
      applyCouponObject(found);
      return;
    }

    // 2. Built-in fallback codes if DB hasn't populated them
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

  // Add-on instant 1-tap add handler
  const handleAddFinishingTouch = (addon: typeof FINISHING_TOUCHES[0]) => {
    const productObj: Product = {
      id: addon.id,
      name: addon.name,
      slug: addon.id,
      realmId: 'accessories',
      realmName: 'Accessories',
      priceType: 'fixed',
      price: addon.price,
      shortDescription: addon.subtitle,
      description: addon.subtitle,
      images: [addon.image],
      inStock: true,
    };
    addToBasket(productObj, 1);
    setAddedAddonIds((prev) => ({ ...prev, [addon.id]: true }));
    setTimeout(() => {
      setAddedAddonIds((prev) => ({ ...prev, [addon.id]: false }));
    }, 1500);
  };

  // Save all items to wishlist
  const handleSaveAllToWishlist = () => {
    items.forEach((item) => {
      addToWishlist(item.product);
    });
    setSavedAllNotice(true);
    setTimeout(() => setSavedAllNotice(false), 2200);
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
        image: it.product.images?.[0],
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-48">
      {/* 1. Header Bar Matching Reference Photo Layout */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md px-4 pt-3.5 pb-2.5 border-b border-[#EFE8E1]/60">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <Link
            href="/"
            aria-label="Back to home"
            className="w-10 h-10 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-all active:scale-90 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Center Shopping Bag Header */}
          <div className="text-center">
            <h1 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917] tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-[11px] text-[#8C827A]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>

          {/* Right Action (Wishlist shortcut) */}
          <Link
            href="/wishlist"
            aria-label="View wishlist"
            className="relative w-10 h-10 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-all active:scale-90 cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7A1C3B] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Cart Body Container */}
      <main className="flex-1 max-w-xl mx-auto px-4 py-3 w-full space-y-4">
        {/* 2. Free Delivery & Packaging Progress Card */}
        <section
          aria-label="Free packaging and delivery progress"
          className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-2.5 relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#F6E9EE] border border-[#FADDE3] flex items-center justify-center text-sm">
                🎁
              </div>
              <div>
                <h2 className="font-heading font-normal text-sm sm:text-base text-[#1C1917] leading-tight">
                  Sweet Packaging Perk
                </h2>
                <p className="text-[11px] text-[#8C827A] mt-0.5">
                  {isFreeDelivery
                    ? 'Unlocked: Free Gift Wrapping & Express Shipping'
                    : `Add ₹${amountNeededForFree} more for Free Shipping & Gift Box`}
                </p>
              </div>
            </div>

            <div>
              {isFreeDelivery ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F6E9EE] text-[#7A1C3B] text-[10px] sm:text-xs font-bold border border-[#FADDE3]">
                  <CheckCircle2 className="w-3 h-3 text-[#7A1C3B]" />
                  <span>Unlocked</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A1C3B] text-[10px] sm:text-xs font-bold border border-[#EFE8E1]">
                  <span>₹{subtotal} / ₹{FREE_SHIPPING_THRESHOLD}</span>
                </span>
              )}
            </div>
          </div>

          {/* Brand Maroon & Gold Progress Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-[#FAF2EB] rounded-full overflow-hidden p-0.5 border border-[#EFE8E1]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background:
                    progressPercent >= 100
                      ? 'linear-gradient(90deg, #E0607E 0%, #B98A2E 50%, #7A1C3B 100%)'
                      : 'linear-gradient(90deg, #E0607E 0%, #B98A2E 100%)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#8C827A] pt-0.5">
            <Truck className="w-3 h-3 text-[#7A1C3B] shrink-0" />
            <span>Pan-India express delivery · <strong>2 - 4 business days</strong></span>
          </div>
        </section>

        {/* 3. Main Item Cards (Matching Photo Reference Layout) */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE8E1] p-8 sm:p-12 text-center my-4 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F6E9EE] text-2xl flex items-center justify-center mx-auto border border-[#FADDE3]">
              🧺
            </div>
            <h3 className="font-heading font-normal text-2xl text-[#1C1917]">
              Your handcrafted bag is empty
            </h3>
            <p className="text-xs text-[#8C827A] max-w-xs mx-auto leading-relaxed">
              Explore our bouquets, personalised resin gifts, stainless steel jewellery, and custom keepsakes.
            </p>
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-full font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <span>Explore Collection 🌻</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header / Action Bar Above Items */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Cart Items ({itemCount})
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSaveAllToWishlist}
                  className="font-semibold text-[#8C827A] hover:text-[#7A1C3B] flex items-center gap-1 transition cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{savedAllNotice ? 'Saved!' : 'Save all'}</span>
                </button>
                <span className="text-[#D5CCC3]">·</span>
                <button
                  type="button"
                  onClick={clearBasket}
                  className="font-medium text-[#B3261E] hover:underline flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* List of Item Cards - Matching Reference Layout Exactly */}
            {items.map((item) => {
              const isCustom = item.isCustomBouquet && item.customBouquet;
              const price = isCustom
                ? item.customBouquet?.totalPrice || 0
                : (item.product.price ?? item.product.priceFrom ?? 0);

              const imageSrc =
                item.product.images && item.product.images[0]
                  ? item.product.images[0]
                  : '/images/sunflower-bouquet.svg';

              const qtyFormatted = String(item.quantity).padStart(2, '0');

              // Detail subtitle / variants
              const variantText = item.selectedVariants
                ? Object.values(item.selectedVariants).join(', ')
                : '';
              const noteText = item.personalisationData
                ? Object.entries(item.personalisationData).map(([k, v]) => `${k}: ${v}`).join(' · ')
                : '';
              const subtitle = variantText || noteText || item.product.shortDescription || item.product.realmName || 'Handcrafted Studio Piece';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#EFE8E1] shadow-xs flex items-center gap-3.5"
                >
                  {/* Left: Square/Rounded Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8E1] flex items-center justify-center p-1">
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* Middle Column: Name, Variant Subtitle, Bold Price */}
                  <div className="flex-1 min-w-0 pr-1 space-y-1">
                    <h3 className="font-heading font-medium text-sm sm:text-base text-[#1C1917] line-clamp-1 leading-snug">
                      {item.isCustomBouquet ? 'Custom Bouquet' : item.product.name}
                    </h3>
                    <p className="text-xs text-[#8C827A] line-clamp-1">
                      {subtitle}
                    </p>
                    <div className="font-bold text-sm sm:text-base text-[#1C1917] pt-0.5 tabular-nums">
                      ₹{price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Right Column: Top Delete X & Bottom Stepper Capsule */}
                  <div className="flex flex-col justify-between items-end self-stretch py-0.5 shrink-0">
                    {/* Top Right: Delete X button */}
                    <button
                      type="button"
                      onClick={() => removeFromBasket(item.id)}
                      aria-label="Remove item"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#A39992] hover:text-[#B3261E] hover:bg-[#FAF7F2] transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom Right: Stepper [-] [01] [+] matching reference layout */}
                    <div className="flex items-center gap-2">
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
                        className="w-6 h-6 rounded-full border border-[#D5CCC3] hover:border-[#7A1C3B] hover:text-[#7A1C3B] flex items-center justify-center text-[#1C1917] active:scale-95 transition cursor-pointer bg-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-semibold tabular-nums text-[#1C1917] min-w-[18px] text-center">
                        {qtyFormatted}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-6 h-6 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Promo Code Bar (Matching Reference Layout Pill Box) */}
        {items.length > 0 && (
          <section aria-label="Promo code discount" className="space-y-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-[#EFE8E1] shadow-xs">
              {appliedCoupon ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F6E9EE] border border-[#FADDE3] text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#7A1C3B]" />
                    <span className="font-bold text-[#7A1C3B]">{appliedCoupon.code}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#7A1C3B] text-white text-[10px] font-bold">
                      {appliedCoupon.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-[#7A1C3B] hover:text-[#5A1230] cursor-pointer"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <form onSubmit={handleApplyCoupon} className="flex items-center bg-[#FAF7F2] rounded-2xl p-1 border border-[#EFE8E1] focus-within:border-[#7A1C3B] transition">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo Code"
                      className="flex-1 bg-transparent px-3 text-xs sm:text-sm uppercase text-[#1C1917] placeholder-[#A39992] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#7A1C3B] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                  {couponError && (
                    <p className="text-[11px] text-[#B3261E] px-2">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-[#7A1C3B] font-semibold px-2">{couponSuccess}</p>
                  )}
                </div>
              )}
            </div>

            {/* Available active coupons suggestions */}
            {!appliedCoupon && availableCoupons.length > 0 && (
              <div className="px-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-[#8C827A] font-medium">Offers:</span>
                {availableCoupons.map((ac) => (
                  <button
                    key={ac.code}
                    type="button"
                    onClick={() => {
                      setCouponCode(ac.code);
                      applyCouponObject(ac);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#F6E9EE] border border-[#EFE8E1] hover:border-[#7A1C3B] text-[10px] font-bold text-[#7A1C3B] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title={ac.description || `Min order ₹${ac.minOrder}`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{ac.code}</span>
                    <span className="text-[#8C827A] font-normal">
                      ({ac.discountType === 'percentage' ? `${ac.discountValue}%` : `₹${ac.discountValue}`})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. Bespoke Gift Hamper Wrap Section */}
        {items.length > 0 && (
          <section
            aria-label="Gift Packaging Customization"
            className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#F6E9EE] border border-[#FADDE3] flex items-center justify-center text-[#7A1C3B]">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-normal text-sm sm:text-base text-[#1C1917] leading-tight">
                    Bespoke Gift Hamper Wrap
                  </h3>
                  <p className="text-[11px] text-[#8C827A] mt-0.5">
                    +₹{giftWrapFee} · Artisanal Presentation with Burgundy Wax Seal
                  </p>
                </div>
              </div>

              {/* Toggle Switch in Brand UI Color */}
              <button
                type="button"
                role="switch"
                aria-checked={giftWrap}
                onClick={() => setGiftWrap(!giftWrap)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  giftWrap ? 'bg-[#7A1C3B]' : 'bg-[#E5DCD4]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    giftWrap ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {giftWrap && (
              <div className="pt-2 space-y-3 border-t border-[#EFE8E1] animate-in fade-in duration-200">
                <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-[#EFE8E1] flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-[#EFE8E1]">
                    <img
                      src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80"
                      alt="Gift presentation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-[#57534E] space-y-0.5">
                    <div className="font-bold text-[#1C1917]">Included in Deluxe Hamper:</div>
                    <div>• Rigid blush gift box with metallic gold foil logo</div>
                    <div>• Dried natural floral sprig &amp; satin silk ribbon</div>
                    <div>• Wax-sealed handmade calligraphy envelope</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="calligraphyNote" className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <span>✍️ Calligraphy Message Note</span>
                    </label>
                    <span className="text-[10px] text-[#8C827A] tabular-nums">
                      {giftNote.length} / 150
                    </span>
                  </div>
                  <textarea
                    id="calligraphyNote"
                    rows={2}
                    maxLength={150}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Happy Birthday Mia! Hope this brings joy ✨ With love, Sophie"
                    className="w-full text-xs p-3 rounded-2xl border border-[#EFE8E1] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#7A1C3B]/20 text-[#1C1917] resize-none leading-relaxed placeholder-[#A39992]"
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* 6. Sweet Finishing Touches 1-Tap Add */}
        {items.length > 0 && (
          <section aria-label="Finishing touches add-ons" className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading font-normal text-base sm:text-lg text-[#1C1917] flex items-center gap-1.5">
                <span>🪄 Sweet Finishing Touches</span>
              </h3>
              <span className="text-[10px] font-bold text-[#7A1C3B] uppercase tracking-wide">
                1-tap add
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {FINISHING_TOUCHES.map((touch) => {
                const isAdded = addedAddonIds[touch.id];
                return (
                  <div
                    key={touch.id}
                    className="bg-white rounded-3xl p-3 border border-[#EFE8E1] shadow-xs flex flex-col justify-between hover:border-[#DFD5CB] transition-all"
                  >
                    <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#FAF7F2] mb-2 border border-[#EFE8E1]">
                      <img
                        src={touch.image}
                        alt={touch.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/95 text-[9px] font-bold text-[#7A1C3B] shadow-2xs">
                        {touch.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-[#1C1917] line-clamp-1 leading-snug">
                        {touch.name}
                      </h4>
                      <p className="text-[10px] text-[#8C827A] line-clamp-1 mt-0.5">
                        {touch.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#FAF2EB]">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#1C1917]">
                        ₹{touch.price}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddFinishingTouch(touch)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#7A1C3B] text-white shadow-2xs'
                            : 'bg-[#F6E9EE] text-[#7A1C3B] hover:bg-[#7A1C3B] hover:text-white active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Cost Breakdown & PROMINENT ORDER CONFIRM BUTTON (Matching Reference Layout) */}
        {items.length > 0 && (
          <section
            aria-label="Order summary breakdown"
            className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-3.5"
          >
            {/* Cost Line Items matching Reference */}
            <div className="space-y-2.5 text-xs sm:text-sm text-[#57534E]">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1C1917] tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="font-semibold text-[#1C1917] tabular-nums">
                  {deliveryCharge === 0 ? (
                    <strong className="text-[#7A1C3B]">FREE</strong>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-[#7A1C3B]">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span className="font-bold tabular-nums">
                    −₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {giftWrap && (
                <div className="flex justify-between items-center text-[#57534E]">
                  <span>Gift Hamper Wrap &amp; Note</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    ₹{packagingFee}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-[#EFE8E1] my-1" />

            {/* Bag Total Row matching reference layout: Bag Total (X Items) ... Total Price */}
            <div className="flex justify-between items-baseline pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-medium text-base sm:text-lg text-[#1C1917]">
                  Bag Total
                </span>
                <span className="text-xs text-[#8C827A]">
                  ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
                </span>
              </div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-[#1C1917] tabular-nums">
                ₹{finalTotal.toLocaleString('en-IN')}
              </div>
            </div>

            {/* PRIMARY UNMISSABLE ORDER CONFIRM BUTTON RIGHT IN SUMMARY */}
            <button
              type="button"
              onClick={() => setOrderModalOpen(true)}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#7A1C3B]/20 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              <span>Confirm Order · ₹{finalTotal.toLocaleString('en-IN')}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <p className="text-[11px] text-center text-[#8C827A] pt-1">
              🔒 Direct Studio Order · Direct WhatsApp Confirmation
            </p>
          </section>
        )}

        {/* 8. Trust Badges Row */}
        <section
          aria-label="Artisan trust commitments"
          className="grid grid-cols-3 gap-2 text-center pt-1"
        >
          <div className="bg-white rounded-3xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-7 h-7 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center mx-auto text-sm">
              🛡️
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              100% Quality
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Handcrafted Studio
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-7 h-7 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center mx-auto text-sm">
              ✨
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              Artisan Touch
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Personalised details
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-7 h-7 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center mx-auto text-sm">
              🌸
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              Gift-Ready
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Safe express parcel
            </div>
          </div>
        </section>
      </main>

      {/* 9. Sticky Bottom Floating Checkout Bar (Always Visible on Mobile) */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EFE8E1] px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] safe-bottom">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="shrink-0">
              <div className="text-[10px] text-[#8C827A] uppercase font-semibold">
                Bag Total
              </div>
              <div className="font-display font-bold text-xl sm:text-2xl text-[#7A1C3B] tabular-nums leading-tight">
                ₹{finalTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOrderModalOpen(true)}
              className="flex-1 py-3.5 px-6 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Confirm Order</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Order Info Modal */}
      <OrderInfoModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        waMessageTemplate={waCartTemplate}
        submitLabel="Confirm & Send Order on WhatsApp"
        onCompleteOrder={handleCartOrderSubmit}
      />
    </div>
  );
}
