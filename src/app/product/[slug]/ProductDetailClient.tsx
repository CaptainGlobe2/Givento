'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Product } from '../../../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../../../data/sampleData';
import { db } from '../../../lib/database';
import { useBasket } from '../../../context/BasketContext';
import { useWishlist } from '../../../context/WishlistContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductReviews from '../../../components/ProductReviews';
import { CategoryArt } from '../../../components/PrototypeArt';
import {
  ArrowLeft,
  Share2,
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ZoomIn,
  X,
  Upload,
} from 'lucide-react';

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { addToBasket } = useBasket();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [product, setProduct] = useState<Product | undefined>(() =>
    DEFAULT_PRODUCTS.find((p) => p.slug === slug)
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const defaultProd = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
    if (defaultProd?.variants && defaultProd.variants.length > 0) {
      defaultProd.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
    }
    return initial;
  });
  const [personalisationData, setPersonalisationData] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showPersonalisation, setShowPersonalisation] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    db.getProducts().then((list) => {
      if (!active) return;
      if (list && list.length > 0) {
        setAllProducts(list);
        const current = list.find((p) => p.slug === slug);
        if (current) {
          setProduct(current);
          if (current.variants && current.variants.length > 0) {
            setSelectedVariants((prev) => {
              const next = { ...prev };
              current.variants?.forEach((v) => {
                if (!next[v.name] && v.options && v.options.length > 0) {
                  next[v.name] = v.options[0];
                }
              });
              return next;
            });
          }
        }
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = allProducts
    .filter(
      (p) =>
        (p.categoryId === product.categoryId || p.realmId === product.realmId) &&
        p.id !== product.id
    )
    .slice(0, 3);

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const handlePersonalisationChange = (fieldLabel: string, value: string) => {
    setPersonalisationData((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Please choose a valid JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be 5 MB or smaller.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as { success?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        setPhotoError(data.error || 'Could not upload photo. Please try again.');
        return;
      }

      setPhotoUrl(data.url);
      setPersonalisationData((prev) => ({
        ...prev,
        'Reference Photo': file.name,
      }));
    } catch {
      setPhotoError('Network error while uploading image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Add to bag → add to cart and navigate to cart page
  const handleAddToBasket = () => {
    addToBasket(product, quantity, selectedVariants, personalisationData, photoUrl || undefined);
    setAddedNotice(true);
    router.push('/cart');
  };

  const isPriceUnknown = product.price == null || product.priceType === 'on_request';
  const priceDisplay = isPriceUnknown
    ? 'Price on chat'
    : product.from || product.priceType === 'from'
    ? `From ₹${product.price?.toLocaleString('en-IN')}`
    : `₹${product.price?.toLocaleString('en-IN')}`;

  const palette = product.colors || (['#e0a93a', '#7cc4a6', '#e0607e'] as [string, string, string]);
  const hasUploadedPhoto =
    product.images &&
    product.images.length > 0 &&
    (product.images[0].startsWith('http') ||
      product.images[0].startsWith('/uploads') ||
      product.images[0].startsWith('data:image') ||
      (!product.images[0].endsWith('.svg') && product.images[0] !== '/images/sunflower-bouquet.svg'));

  const currentImage = product.images?.[activeImageIndex] || product.images?.[0];
  const imageCount = product.images?.length || 0;

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    if (imageCount <= 1) return;
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (imageCount <= 1 || touchStartXRef.current === null) return;
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (deltaX <= -40) {
      setActiveImageIndex((prev) => (prev + 1) % imageCount);
    } else if (deltaX >= 40) {
      setActiveImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-28">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-0 sm:px-4 sm:py-6">
        {/* Top Product Hero Showcase */}
        <div
          onTouchStart={handleGalleryTouchStart}
          onTouchEnd={handleGalleryTouchEnd}
          className="relative w-full bg-[#F2ECE6] sm:rounded-3xl overflow-hidden aspect-[4/4.5] sm:aspect-square flex items-center justify-center touch-pan-y"
        >
          {/* Floating Top Navigation Header Buttons */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-md transition-all active:scale-90 pointer-events-auto cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Share / Options Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] shadow-md transition-all active:scale-90 pointer-events-auto cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {copiedLink && (
                <div className="absolute top-12 right-0 bg-[#1C1917] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap z-30 pointer-events-auto animate-in fade-in">
                  Link copied!
                </div>
              )}
            </div>
          </div>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[calc(100%-8.5rem)]">
              <span className="inline-block max-w-full truncate px-3 sm:px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7A1C3B] text-[11px] sm:text-xs font-bold border border-[#FADDE3] shadow-xs">
                {product.badge}
              </span>
            </div>
          )}

          {/* Hero Visual */}
          <div
            onClick={() => setIsZoomOpen(true)}
            className="w-full h-full flex items-center justify-center p-8 sm:p-12 cursor-zoom-in group"
          >
            {hasUploadedPhoto && currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/sunflower-bouquet.svg';
                }}
                className="max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 transition-transform duration-500 group-hover:scale-105">
                <CategoryArt k={product.artCategory || 'bouquet'} colors={palette} className="w-full h-full" />
              </div>
            )}
          </div>

          {/* Zoom Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute bottom-10 right-4 z-10 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#EFE8E1] text-[#1C1917] hover:text-[#7A1C3B] text-xs font-medium flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Zoom</span>
          </button>

          {/* Multiple Images Dots indicator */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'w-4 bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Sheet Card (Matching Reference Photo Bottom Half) */}
        <div className="relative z-10 -mt-6 sm:-mt-8 bg-white rounded-t-[32px] sm:rounded-3xl border-t sm:border border-[#EFE8E1] shadow-[0_-8px_25px_rgba(0,0,0,0.05)] sm:shadow-sm px-5 sm:px-7 pt-3.5 pb-8 space-y-4">
          {/* Drag Handle Bar Pill */}
          <div className="w-12 h-1.5 rounded-full bg-[#7A1C3B]/25 mx-auto mb-2 sm:hidden" />

          {/* Header Block: Title & Short Description */}
          <div className="space-y-1.5">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#F6E9EE] text-[#7A1C3B] text-[10px] font-bold uppercase tracking-wider">
              {product.categoryName || product.realmName || 'Handcrafted Studio'}
            </div>

            <h1 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Price Line */}
          <div className="pt-0.5">
            <span className="font-display font-bold text-2xl sm:text-3xl text-[#7A1C3B] tabular-nums tracking-tight">
              {priceDisplay}
            </span>
          </div>

          {/* Variant Option Pills (Matching Reference Image Pill Layout) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-1">
              {product.variants.map((variant) => (
                <div key={variant.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1C1917] uppercase tracking-wider">
                      {variant.name}:
                    </span>
                    <span className="text-[#7A1C3B] font-semibold">
                      {selectedVariants[variant.name]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {variant.options.map((option, optIdx) => {
                      const isSelected = selectedVariants[variant.name] === option;
                      // Display dynamic price tag if it's size variant
                      const optPrice =
                        optIdx === 0
                          ? product.price
                          : product.price
                          ? Math.round(product.price * (1 + optIdx * 0.3))
                          : null;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleVariantSelect(variant.name, option)}
                          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between active:scale-95 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F6E9EE] border-[1.5px] border-[#7A1C3B] text-[#7A1C3B] shadow-xs'
                              : 'bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] hover:border-[#DFD5CB]'
                          }`}
                        >
                          <span>{option}</span>
                          {optPrice && (
                            <span className="font-bold tabular-nums">
                              ₹{optPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Personalisation Expandable Section */}
          {product.personalisationFields && product.personalisationFields.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPersonalisation(!showPersonalisation)}
                className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-between text-xs font-bold text-[#1C1917] hover:border-[#7A1C3B] transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7A1C3B]" />
                  <span>Personalise this gift (Names, Message, Photo)</span>
                </span>
                <span className="text-[#7A1C3B] text-sm">{showPersonalisation ? '−' : '+'}</span>
              </button>

              {showPersonalisation && (
                <div className="mt-2.5 p-4 bg-[#FAF7F2]/80 border border-[#EFE8E1] rounded-2xl space-y-3 animate-in fade-in">
                  {product.personalisationFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        {field.label}{' '}
                        {field.required ? (
                          <span className="text-[#B3261E]">*</span>
                        ) : (
                          <span className="text-xs font-normal text-[#8C827A]">(Optional)</span>
                        )}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={personalisationData[field.label] || ''}
                          onChange={(e) => handlePersonalisationChange(field.label, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={personalisationData[field.label] || ''}
                          onChange={(e) => handlePersonalisationChange(field.label, e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                        >
                          <option value="">Choose an option...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={personalisationData[field.label] || ''}
                          onChange={(e) => handlePersonalisationChange(field.label, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                        />
                      )}
                    </div>
                  ))}

                  {/* Photo Upload */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Upload Reference Photo (Optional)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-[#EFE8E1] rounded-xl cursor-pointer hover:border-[#7A1C3B] transition text-xs text-[#6A5B60]">
                      <Upload className="w-4 h-4 text-[#7A1C3B]" />
                      <span>{uploadingPhoto ? 'Uploading photo...' : 'Select image from your device (max 5MB)'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        disabled={uploadingPhoto}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photoError && (
                      <p className="text-[11px] text-[#B3261E] font-medium">{photoError}</p>
                    )}
                    {photoUrl && (
                      <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-[#EFE8E1]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0">
                            <img src={photoUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-[#7A1C3B] font-bold truncate">
                            ✓ Photo uploaded &amp; attached
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl(null);
                            setPersonalisationData((prev) => {
                              const next = { ...prev };
                              delete next['Reference Photo'];
                              return next;
                            });
                          }}
                          className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#B3261E] cursor-pointer"
                          aria-label="Remove uploaded photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs sm:text-sm font-semibold text-[#1C1917]">Quantity</span>
            <div className="flex items-center border border-[#EFE8E1] rounded-full bg-[#FAF7F2] overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#1C1917] hover:bg-[#F6E9EE] active:scale-90 transition cursor-pointer shadow-2xs"
              >
                -
              </button>
              <span className="px-4 font-mono font-bold text-sm text-[#1C1917] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#1C1917] hover:bg-[#F6E9EE] active:scale-90 transition cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Row (Matching Reference Photo: Heart Button on Left, Add to Cart on Right) */}
          <div className="flex items-center gap-3 pt-3">
            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-14 h-14 rounded-full border border-[#EFE8E1] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 flex-shrink-0 ${
                isInWishlist(product.id)
                  ? 'bg-[#FDF0F3] text-[#7A1C3B] border-[#FADDE3]'
                  : 'bg-white text-[#1C1917] hover:border-[#7A1C3B] hover:text-[#7A1C3B]'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  isInWishlist(product.id) ? 'fill-[#7A1C3B]' : ''
                }`}
              />
            </button>

            {/* Add to Cart Big Pill Button */}
            <button
              type="button"
              onClick={handleAddToBasket}
              className="flex-1 py-4 px-6 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Add to Cart</span>
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {addedNotice && (
            <div className="p-3 bg-[#FDF0F3] border border-[#FADDE3] rounded-2xl text-center text-xs font-bold text-[#7A1C3B] animate-in fade-in">
              ✓ Added to your cart!
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-[#EFE8E1]">
            <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <Truck className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
              <span>Pan-India express delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
              <span>Handcrafted quality guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <Sparkles className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
              <span>Bespoke custom finishes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
              <span>Confirmed directly on chat</span>
            </div>
          </div>
        </div>

        {/* Extended Product Story & Reviews */}
        <div className="px-4 sm:px-0 mt-8 space-y-8">
          {/* Detailed Story */}
          {product.description && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8E1] shadow-xs space-y-3">
              <h2 className="font-heading font-normal text-xl text-[#1C1917]">
                About This Handcrafted Piece
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-normal text-xl text-[#1C1917]">
                  More from this collection
                </h3>
                <Link
                  href={`/category/${product.categoryId || product.realmId || 'all'}`}
                  className="text-xs font-bold text-[#7A1C3B] hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/product/${rel.slug}`}
                    className="bg-white border border-[#EFE8E1] rounded-2xl p-2.5 sm:p-3 hover:border-[#DFD5CB] hover:shadow-xs active:scale-[0.98] transition-all block group"
                  >
                    <div className="relative w-full aspect-square rounded-xl bg-[#FAF7F2] mb-2 flex items-center justify-center overflow-hidden">
                      {rel.images?.[0] ? (
                        <img
                          src={rel.images[0]}
                          alt={rel.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/images/sunflower-bouquet.svg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16">
                          <CategoryArt k={rel.artCategory || 'bouquet'} colors={palette} />
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-xs text-[#1C1917] truncate group-hover:text-[#7A1C3B]">
                      {rel.name}
                    </h4>
                    <span className="font-bold text-xs text-[#7A1C3B]">
                      ₹{rel.price?.toLocaleString('en-IN') || 'Chat'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ProductReviews productName={product.name} />
        </div>
      </main>

      <Footer />

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsZoomOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                aria-label="Close zoom preview"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full border border-[#EFE8E1] bg-[#FAF7F2] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] active:scale-90 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-heading text-lg sm:text-xl text-[#1C1917] mb-4 px-8 text-center">
                {product.name}
              </h4>
              <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square flex items-center justify-center">
                {hasUploadedPhoto && currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/sunflower-bouquet.svg';
                    }}
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                ) : (
                  <CategoryArt k={product.artCategory || 'bouquet'} colors={palette} className="w-full h-full" />
                )}
              </div>
              <p className="text-xs text-[#8C827A] mt-4 font-medium">
                Givento Studio · Handcrafted with love
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
