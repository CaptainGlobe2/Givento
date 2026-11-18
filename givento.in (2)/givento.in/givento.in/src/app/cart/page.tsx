'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBasket } from '../../context/BasketContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../types';
import { db } from '../../lib/database';
import OrderInfoModal from '../../components/OrderInfoModal';
import {
  ArrowLeft,
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

// Curated 1-tap add-on items matching reference image
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [savedAllNotice, setSavedAllNotice] = useState(false);
  const [addedAddonIds, setAddedAddonIds] = useState<Record<string, boolean>>({});

  // Free delivery threshold
  const FREE_SHIPPING_THRESHOLD = 899;
  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryCharge = isFreeDelivery || items.length === 0 ? 0 : 50;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Apply Coupon Logic
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'GIVENTO10' || code === 'SWEET10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount, label: '10% OFF' });
      setCouponSuccess('10% boutique discount applied! ✨');
      setCouponCode('');
    } else if (code === 'FIRSTLOVE') {
      setAppliedCoupon({ code, discount: 50, label: '₹50 OFF' });
      setCouponSuccess('₹50 gift voucher applied! 💌');
      setCouponCode('');
    } else if (code === 'FESTIVEBOUQUET') {
      if (subtotal >= 899) {
        setAppliedCoupon({ code, discount: 100, label: '₹100 OFF' });
        setCouponSuccess('₹100 celebratory savings unlocked! 🎉');
        setCouponCode('');
      } else {
        setCouponError('Minimum order of ₹899 required for FESTIVEBOUQUET');
      }
    } else {
      setCouponError('Invalid coupon. Try GIVENTO10 or FIRSTLOVE');
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
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
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
    await db.createOrder({
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
    // Clear cart once order is confirmed
    clearBasket();
  };

  // WhatsApp message template (NOT pre-encoded — OrderInfoModal appends customer details)
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-60">
      {/* 1. Header Bar Matching Reference */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE8E1] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Back to Home / Store */}
          <Link
            href="/"
            aria-label="Back to home"
            className="w-9 h-9 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Centered Title */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-display font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
              Cart
            </h1>
            <span className="text-[10px] text-[#8C827A] font-light">
              Givento Studio · Handcrafted with love
            </span>
          </div>

          {/* Right Action Icons (Wishlist & Profile) */}
          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              aria-label="View wishlist"
              className="relative w-9 h-9 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0607E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Cart Body Container */}
      <main className="flex-1 max-w-xl mx-auto px-4 py-4 w-full space-y-4">
        {/* 2. "Sweet Packaging Perk" / Free Delivery Progress Card */}
        <section
          aria-label="Free packaging and delivery progress"
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-3 relative overflow-hidden"
        >
          {/* Top Row: Icon + Title & Unlocked Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] border border-[#FADDE3] flex items-center justify-center text-base">
                🎁
              </div>
              <div>
                <h2 className="font-display font-normal text-base sm:text-lg text-[#1C1917] leading-tight">
                  Sweet Packaging Perk
                </h2>
                <p className="text-[11px] text-[#8C827A] mt-0.5">
                  {isFreeDelivery
                    ? 'Unlocked: Free Gift Wrapping & Express Shipping'
                    : `Add ₹${amountNeededForFree} more for Free Shipping & Gift Box`}
                </p>
              </div>
            </div>

            {/* Pill Badge */}
            <div>
              {isFreeDelivery ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F5ED] text-[#2C7A54] text-[10px] sm:text-xs font-bold border border-[#CDEBD8] shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-[#2C7A54]" />
                  <span>Goal Unlocked!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF0F3] text-[#7A1C3B] text-[10px] sm:text-xs font-bold border border-[#F8DAE1]">
                  <span>₹{subtotal} / ₹{FREE_SHIPPING_THRESHOLD}</span>
                </span>
              )}
            </div>
          </div>

          {/* Gradient Progress Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-[#FAF2EB] rounded-full overflow-hidden p-0.5 border border-[#EFE8E1]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background:
                    progressPercent >= 100
                      ? 'linear-gradient(90deg, #E0607E 0%, #B98A2E 50%, #2C7A54 100%)'
                      : 'linear-gradient(90deg, #E0607E 0%, #D4AF37 100%)',
                }}
              />
            </div>
          </div>

          {/* Subtext with truck icon */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8C827A] pt-0.5">
            <Truck className="w-3.5 h-3.5 text-[#7A1C3B] shrink-0" />
            <span>Estimated delivery: <strong>3 - 5 business days</strong> · Handcrafted with love</span>
          </div>
        </section>

        {/* 3. "Handcrafted Bag" Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-normal text-xl sm:text-2xl text-[#1C1917] tracking-tight">
              Handcrafted Bag
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6E9EE] text-[#7A1C3B] text-[10px] sm:text-xs font-bold">
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAllToWishlist}
                className="text-xs font-semibold text-[#8C827A] hover:text-[#7A1C3B] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{savedAllNotice ? 'Saved!' : 'Save all'}</span>
              </button>
              <span className="text-[#D5CCC3]">·</span>
              <button
                type="button"
                onClick={clearBasket}
                className="text-xs font-medium text-[#D9466C] hover:text-[#B3264B] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty Bag State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE8E1] p-8 sm:p-12 text-center my-4 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FDF0F3] text-2xl flex items-center justify-center mx-auto border border-[#FADDE3]">
              🧺
            </div>
            <h3 className="font-display font-normal text-2xl text-[#1C1917]">
              Your handcrafted bag is empty
            </h3>
            <p className="text-xs text-[#8C827A] max-w-xs mx-auto leading-relaxed">
              Explore our bouquets, personalised resin gifts, stainless steel jewellery, and custom keepsakes.
            </p>
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <span>Explore Collection 🌻</span>
            </Link>
          </div>
        ) : (
          /* List of Handcrafted Bag Items */
          <div className="space-y-3">
            {items.map((item) => {
              const isCustom = item.isCustomBouquet && item.customBouquet;
              const price = isCustom
                ? item.customBouquet?.totalPrice || 0
                : (item.product.price ?? item.product.priceFrom ?? 0);

              const imageSrc =
                item.product.images && item.product.images[0]
                  ? item.product.images[0]
                  : '/images/sunflower-bouquet.svg';

              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-[#EFE8E1] shadow-xs hover:border-[#DFD5CB] transition-all relative flex gap-3.5 sm:gap-4 items-center"
                >
                  {/* Left: Square Thumbnail with Floating Badge */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8E1] flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Small badge on top of image */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[9px] font-bold text-[#7A1C3B] shadow-2xs">
                      {isCustom ? 'Custom' : 'Handmade'}
                    </div>

                    {/* Heart button */}
                    <button
                      type="button"
                      onClick={() => addToWishlist(item.product)}
                      aria-label="Add to wishlist"
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-2xs hover:text-[#E0607E] cursor-pointer"
                    >
                      <Heart className="w-3 h-3 text-[#8C827A] hover:fill-[#E0607E]" />
                    </button>
                  </div>

                  {/* Middle / Right: Details & Stepper */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-display font-normal text-base sm:text-lg text-[#1C1917] truncate leading-snug">
                        {item.product.name}
                      </h3>
                      {/* Delete X icon matching image */}
                      <button
                        type="button"
                        onClick={() => removeFromBasket(item.id)}
                        aria-label="Remove item"
                        className="text-[#8C827A] hover:text-[#D9466C] p-1 -mr-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Custom details / Personalisation pills */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                      {item.selectedVariants &&
                        Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-block px-2 py-0.5 rounded-md bg-[#FAF2EB] text-[#7A1C3B] text-[10px] font-medium"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      {item.personalisationData &&
                        Object.entries(item.personalisationData).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-block px-2 py-0.5 rounded-md bg-[#FDF0F3] text-[#7A1C3B] text-[10px] font-semibold"
                          >
                            {k}: &ldquo;{v}&rdquo;
                          </span>
                        ))}
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#E8F5ED] text-[#2C7A54] text-[10px] font-bold">
                        100% Quality Inspected
                      </span>
                    </div>

                    {/* Bottom Row: Price + Quantity Stepper Capsule */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div>
                        <div className="font-sans font-bold text-sm sm:text-base text-[#1C1917] tabular-nums">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-[#8C827A]">
                            Unit price: ₹{price.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      {/* Rounded Stepper Pill */}
                      <div className="inline-flex items-center bg-[#FDF0F3] border border-[#FADDE3] rounded-full px-2.5 py-1 gap-3 text-xs font-semibold text-[#1C1917]">
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
                          className="w-4 h-4 flex items-center justify-center text-sm leading-none text-[#1C1917] hover:text-[#7A1C3B] active:scale-125 transition-transform cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums min-w-[12px] text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-4 h-4 flex items-center justify-center text-sm leading-none text-[#1C1917] hover:text-[#7A1C3B] active:scale-125 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. "Bespoke Gift Hamper Wrap" / Packaging Option Matching Image */}
        <section
          aria-label="Gift Packaging Customization"
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-3"
        >
          {/* Header Row with Toggle Switch */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] border border-[#FADDE3] flex items-center justify-center text-[#E0607E]">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-normal text-base sm:text-lg text-[#1C1917] leading-tight">
                  Bespoke Gift Hamper Wrap
                </h3>
                <p className="text-[11px] text-[#8C827A] mt-0.5">
                  +₹{giftWrapFee} · Artisanal Presentation with Wax Seal
                </p>
              </div>
            </div>

            {/* iOS-Style Toggle Switch */}
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

          {/* Expanded Gift Wrap Presentation Box */}
          {giftWrap && (
            <div className="pt-2 space-y-3 border-t border-[#EFE8E1] animate-in fade-in duration-200">
              {/* Packaging Spec Inset */}
              <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#EFE8E1] flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg bg-white overflow-hidden shrink-0 border border-[#EFE8E1]">
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

              {/* Calligraphy Message Note */}
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
                  placeholder="Happy Birthday Mia! Hope this adds a little magic to every day ✨ With love, Sophie"
                  className="w-full text-xs p-3 rounded-xl border border-[#EFE8E1] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#7A1C3B]/20 text-[#1C1917] resize-none leading-relaxed placeholder-[#A39992]"
                />
              </div>
            </div>
          )}
        </section>

        {/* 5. "Sweet Finishing Touches" 1-Tap Add Section Matching Image */}
        <section aria-label="Finishing touches add-ons" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-normal text-lg sm:text-xl text-[#1C1917] flex items-center gap-1.5">
              <span>🪄 Sweet Finishing Touches</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#7A1C3B] uppercase tracking-wide">
              1-tap add
            </span>
          </div>

          {/* Horizontal scroll cards matching screenshot */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {FINISHING_TOUCHES.map((touch) => {
              const isAdded = addedAddonIds[touch.id];
              return (
                <div
                  key={touch.id}
                  className="bg-white rounded-2xl p-3 border border-[#EFE8E1] shadow-xs flex flex-col justify-between hover:border-[#DFD5CB] transition-all"
                >
                  {/* Image with Tag */}
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#FAF7F2] mb-2 border border-[#EFE8E1]">
                    <img
                      src={touch.image}
                      alt={touch.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/95 text-[9px] font-bold text-[#7A1C3B] shadow-2xs">
                      {touch.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h4 className="font-semibold text-xs text-[#1C1917] line-clamp-1 leading-snug">
                      {touch.name}
                    </h4>
                    <p className="text-[10px] text-[#8C827A] line-clamp-1 mt-0.5">
                      {touch.subtitle}
                    </p>
                  </div>

                  {/* Price and + Add Button */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#FAF2EB]">
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#1C1917]">
                      ₹{touch.price}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddFinishingTouch(touch)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-[#2C7A54] text-white shadow-2xs'
                          : 'bg-[#FDF0F3] text-[#7A1C3B] hover:bg-[#F8DAE1] active:scale-95'
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

        {/* 6. "Order Summary" Card with Coupon Box Matching Image */}
        <section
          aria-label="Order summary breakdown"
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EFE8E1] shadow-xs space-y-3"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="font-display font-normal text-lg sm:text-xl text-[#1C1917]">
              Order Summary
            </h3>
            <span className="text-[10px] text-[#8C827A] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#2C7A54]" />
              <span>Encrypted &amp; 100% Secure</span>
            </span>
          </div>

          {/* Coupon Code Banner / Input */}
          <div className="pt-1">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#E8F5ED] border border-[#CDEBD8] text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#2C7A54]" />
                  <span className="font-bold text-[#2C7A54]">{appliedCoupon.code}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2C7A54] text-white text-[10px] font-bold">
                    {appliedCoupon.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[#2C7A54] hover:text-[#1F553B] cursor-pointer"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo code (e.g. GIVENTO10)"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#EFE8E1] bg-[#FAF7F2] uppercase placeholder-normal focus:outline-none focus:ring-1 focus:ring-[#7A1C3B]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-[#D9466C]">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] text-[#2C7A54]">{couponSuccess}</p>
                )}
              </form>
            )}
          </div>

          {/* Cost Line Items Matching Reference Image */}
          <div className="space-y-2 pt-2 border-t border-[#EFE8E1] text-xs text-[#57534E]">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-[#1C1917] tabular-nums">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span>Handcrafted Packaging</span>
                <span className="text-[11px]">🎀</span>
              </span>
              <span className="font-semibold text-[#1C1917] tabular-nums">
                {giftWrap ? (
                  `₹${packagingFee}`
                ) : (
                  <span className="text-[#2C7A54] font-bold">FREE</span>
                )}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-[#2C7A54]">
                <span>Boutique Promo ({appliedCoupon.code})</span>
                <span className="font-bold tabular-nums">
                  −₹{couponDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span>Standard Express Delivery</span>
                {isFreeDelivery && (
                  <span className="px-1.5 py-0.2 rounded bg-[#E8F5ED] text-[#2C7A54] text-[9px] font-bold">
                    Qualified
                  </span>
                )}
              </span>
              <span className="font-semibold text-[#1C1917] tabular-nums">
                {deliveryCharge === 0 ? (
                  <strong className="text-[#2C7A54]">FREE</strong>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#EFE8E1] my-1" />

          {/* Grand Total Row */}
          <div className="flex justify-between items-end pt-1">
            <div>
              <div className="font-display font-normal text-lg text-[#1C1917]">
                Total
              </div>
              <div className="text-[10px] text-[#8C827A]">
                Includes all taxes and free gift wrapping
              </div>
            </div>
            <div className="font-display font-normal text-3xl text-[#7A1C3B] tabular-nums">
              ₹{finalTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </section>

        {/* 7. Trust Badges Row Matching Reference Screenshot */}
        <section
          aria-label="Artisan trust commitments"
          className="grid grid-cols-3 gap-2 text-center pt-1"
        >
          <div className="bg-white rounded-2xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] text-[#E0607E] flex items-center justify-center mx-auto text-sm">
              🛡️
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              100% Happiness
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Hand-packed in Adiram
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] text-[#7A1C3B] flex items-center justify-center mx-auto text-sm">
              ✨
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              Small Batch Made
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Crafted fresh for you
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#EFE8E1] shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#E8F5ED] text-[#2C7A54] flex items-center justify-center mx-auto text-sm">
              🌿
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-[#1C1917] leading-tight">
              Eco Gift-Ready
            </div>
            <div className="text-[9px] text-[#8C827A]">
              Plastic-free presentation
            </div>
          </div>
        </section>
      </main>

      {/* 8. Sticky Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-[56px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EFE8E1] px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="shrink-0">
              <div className="text-[10px] text-[#8C827A] uppercase font-semibold">
                Grand Total
              </div>
              <div className="font-display font-normal text-2xl text-[#7A1C3B] tabular-nums leading-tight">
                ₹{finalTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOrderModalOpen(true)}
              className="flex-1 py-3.5 px-5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Checkout</span>
              <span>→</span>
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
