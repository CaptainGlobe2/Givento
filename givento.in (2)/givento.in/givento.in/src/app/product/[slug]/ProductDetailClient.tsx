'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Product } from '../../../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../../../data/sampleData';
import { db } from '../../../lib/database';
import { useBasket } from '../../../context/BasketContext';
import { useWishlist } from '../../../context/WishlistContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductReviews from '../../../components/ProductReviews';
import { CategoryArt } from '../../../components/PrototypeArt';
import OrderInfoModal from '../../../components/OrderInfoModal';
import {
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Heart,
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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [personalisationData, setPersonalisationData] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Order modal state
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalMode, setWaModalMode] = useState<'order' | 'bag'>('order');

  useEffect(() => {
    let active = true;
    db.getProducts().then((list) => {
      if (!active) return;
      if (list && list.length > 0) {
        setAllProducts(list);
        const current = list.find((p) => p.slug === slug);
        if (current) setProduct(current);
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

  const handlePhotoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setPersonalisationData((prev) => ({
        ...prev,
        'Photo Uploaded': file.name,
      }));
    }
  };

  // Add to bag → add to cart and navigate directly to cart page
  const handleAddToBasket = () => {
    addToBasket(product, quantity, selectedVariants, personalisationData);
    setAddedNotice(true);
    router.push('/cart');
  };

  const handleModalClose = () => {
    setWaModalOpen(false);
  };

  const isPriceUnknown = product.price == null || product.priceType === 'on_request';
  const priceDisplay = isPriceUnknown
    ? 'ask us'
    : product.from || product.priceType === 'from'
    ? `from ₹${product.price?.toLocaleString('en-IN')}`
    : `₹${product.price?.toLocaleString('en-IN')}`;

  // Save order in admin database when customer confirms modal
  const handleOrderSubmit = async (customerData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    instructions: string;
  }) => {
    const unitPrice = product.price || 0;
    const total = unitPrice * quantity;
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
      subtotal: total,
      total: total,
      adminNotes: customerData.instructions ? `Special Instructions: ${customerData.instructions}` : undefined,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: unitPrice,
          image: product.images?.[0],
          variants: selectedVariants,
          personalisation: personalisationData,
        },
      ],
    });
  };

  // Build WhatsApp message template (NOT pre-encoded — OrderInfoModal appends customer info + encodes)
  const buildWaTemplate = (mode: 'order' | 'bag') => {
    const header =
      mode === 'order'
        ? `Hello Givento Studio! 🌸\n*NEW ORDER* from givento.in\n\n`
        : `Hello Givento Studio! 🌸\n*ORDER from givento.in* (Added to Bag)\n\n`;

    let imageUrl = '';
    if (product.images && product.images.length > 0 && product.images[0]) {
      const img = product.images[0];
      const full = img.startsWith('http')
        ? img
        : typeof window !== 'undefined'
        ? `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}`
        : `https://givento.in/${img}`;
      imageUrl = `\n🖼️ Product Image:\n${full}\n`;
    }

    const variants =
      Object.keys(selectedVariants).length > 0
        ? `Variants: ${Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`
        : '';

    const personalisation =
      Object.keys(personalisationData).length > 0
        ? `Personalisation:\n` +
          Object.entries(personalisationData).map(([k, v]) => `  • ${k}: ${v}`).join('\n') + `\n`
        : '';

    return (
      header +
      `🛍️ *${product.name}*\n` +
      `Price: ${priceDisplay} × ${quantity}\n` +
      variants +
      personalisation +
      imageUrl
    );
  };

  const palette = product.colors || (['#e0a93a', '#7cc4a6', '#e0607e'] as [string, string, string]);
  const hasUploadedPhoto =
    product.images &&
    product.images.length > 0 &&
    (product.images[0].startsWith('http') ||
      product.images[0].startsWith('/uploads') ||
      product.images[0].startsWith('data:image') ||
      (!product.images[0].endsWith('.svg') && product.images[0] !== '/images/sunflower-bouquet.svg'));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-[1180px] mx-auto px-4 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8C827A] mb-6">
          <Link href="/" className="hover:text-[#7A1C3B] transition-colors">
            Home
          </Link>
          <span className="text-[#D6CCC2]">/</span>
          <Link href={`/category/${product.categoryId || product.realmId || 'all'}`} className="hover:text-[#7A1C3B] transition-colors">
            {product.categoryName || product.realmName || 'Collections'}
          </Link>
          <span className="text-[#D6CCC2]">/</span>
          <span className="text-[#1C1917] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image Area */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 shadow-xs overflow-hidden group">
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FDF0F3] text-[#7A1C3B] text-xs font-bold border border-[#FADDE3]">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] hover:text-[#7A1C3B] transition cursor-pointer"
                title="Inspect image"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Main Artwork or Photo */}
              <div
                onClick={() => setIsZoomOpen(true)}
                className="relative w-full aspect-square flex items-center justify-center cursor-zoom-in"
              >
                {hasUploadedPhoto ? (
                  <div className="relative w-full h-full p-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="relative w-64 h-64 max-w-full max-h-full transition-transform duration-300 group-hover:scale-105">
                    <CategoryArt k={product.artCategory || 'bouquet'} colors={palette} />
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-[#8C827A] mt-3 mb-0">
                Preview is a guide. Handmade gifts can look a little different.
              </p>
            </div>
          </div>

          {/* Right Column: Details & Customization */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] font-semibold uppercase tracking-wider text-[#8C827A] mb-2">
                {product.categoryName || product.realmName || 'Handcrafted'}
              </span>
              <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Line */}
              <div className="flex items-baseline gap-3 pt-3">
                <span className="font-display font-normal text-3xl sm:text-4xl text-[#7A1C3B] tabular-nums">
                  {priceDisplay}
                </span>
                {isPriceUnknown && (
                  <span className="text-xs text-[#8C827A] font-semibold">
                    (Price confirmed with you on WhatsApp)
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-[#57534E] leading-relaxed border-y border-[#EFE8E1] py-4">
              <p className="m-0">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-1">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-2">
                    <label className="block text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                      {variant.name}:{' '}
                      <span className="text-[#7A1C3B] font-normal">
                        {selectedVariants[variant.name] || 'Select an option'}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt) => {
                        const isSelected = selectedVariants[variant.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleVariantSelect(variant.name, opt)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#7A1C3B] text-white border-[#7A1C3B] shadow-xs'
                                : 'bg-white text-[#1C1917] border-[#EFE8E1] hover:border-[#DFD5CB] hover:bg-[#FAF7F2]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Personalisation Form */}
            {product.personalisationFields && product.personalisationFields.length > 0 && (
              <div className="bg-[#FAF7F2]/60 border border-[#EFE8E1] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EFE8E1] pb-2">
                  <Sparkles className="w-4 h-4 text-[#7A1C3B]" />
                  <h3 className="font-display font-normal text-base text-[#1C1917]">
                    Personalise Your Gift
                  </h3>
                </div>

                <div className="space-y-3.5">
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

                  {/* Photo Upload simulation */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Upload Reference Photo (Optional)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-[#EFE8E1] rounded-xl cursor-pointer hover:border-[#7A1C3B] transition text-xs text-[#6A5B60]">
                      <Upload className="w-4 h-4 text-[#7A1C3B]" />
                      <span>Select image from your device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUploadSim}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#EFE8E1]">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-[#2C7A54] font-bold">
                          ✓ Photo selected for print
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview Note */}
                {Object.keys(personalisationData).length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-[#EFE8E1]">
                    <span className="text-xs font-bold text-[#7A1C3B]">
                      Order summary notes:
                    </span>
                    <div className="text-xs text-[#1C1917] mt-1 space-y-0.5">
                      {Object.entries(personalisationData).map(([k, v]) => (
                        <div key={k}>
                          <strong>{k}:</strong> {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1C1917]">Quantity</span>
                <div className="flex items-center border border-[#EFE8E1] rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 font-bold hover:bg-[#FAF7F2] text-[#1C1917] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1.5 font-mono font-bold text-sm text-[#1C1917] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 font-bold hover:bg-[#FAF7F2] text-[#1C1917] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`p-3.5 rounded-xl border border-[#EFE8E1] flex items-center justify-center transition cursor-pointer shadow-2xs ${
                      isInWishlist(product.id)
                        ? 'bg-[#FDF0F3] text-[#7A1C3B] border-[#FADDE3]'
                        : 'bg-white text-[#1C1917] hover:border-[#DFD5CB] hover:text-[#7A1C3B]'
                    }`}
                    title={isInWishlist(product.id) ? 'Saved in wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-[#7A1C3B]' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToBasket}
                    className="flex-1 py-3.5 px-4 font-bold text-sm rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to bag</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setWaModalMode('order'); setWaModalOpen(true); }}
                  className="sm:col-span-5 py-3.5 px-4 font-bold text-sm rounded-xl bg-white border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 flex items-center justify-center gap-2 text-center cursor-pointer transition shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>

              {addedNotice && (
                <div className="p-3 bg-[#E8F5ED] border border-[#C3E6D0] rounded-xl text-center text-xs font-bold text-[#2C7A54]">
                  ✓ Added to your bag! Redirecting to cart…
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFE8E1]">
              <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
                <Truck className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
                <span>Pan-India shipping / pickup</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
                <span>Handcrafted quality promise</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
                <Heart className="w-4 h-4 text-[#7A1C3B] flex-shrink-0" />
                <span>Personalised on request</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2C7A54] flex-shrink-0" />
                <span>Confirmed with you on chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#EFE8E1]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-normal text-2xl text-[#1C1917]">
                  More from {product.categoryName || 'this collection'}
                </h3>
              </div>
              <Link
                href={`/category/${product.categoryId || product.realmId || 'all'}`}
                className="text-xs font-bold text-[#7A1C3B] hover:underline"
              >
                View collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relPalette = rel.colors || (['#e0a93a', '#7cc4a6', '#e0607e'] as [string, string, string]);
                const relC1 = relPalette[0];
                return (
                  <Link
                    key={rel.id}
                    href={`/product/${rel.slug}`}
                    className="bg-white border border-[#EFE8E1] rounded-2xl sm:rounded-3xl p-4 hover:border-[#DFD5CB] hover:shadow-md transition-all block group shadow-xs"
                  >
                    <div
                      className="relative w-full aspect-square rounded-2xl p-3 mb-3 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${relC1} 15%, #FAF7F2)`,
                      }}
                    >
                      <div className="relative w-32 h-32 transition-transform duration-250 group-hover:scale-105">
                        <CategoryArt k={rel.artCategory || 'bouquet'} colors={relPalette} />
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm text-[#1C1917] leading-snug truncate group-hover:text-[#7A1C3B] transition-colors">
                      {rel.name}
                    </h4>
                    <div className="font-sans font-bold text-sm text-[#7A1C3B] mt-1 tabular-nums">
                      {rel.price == null ? 'ask us' : `₹${rel.price.toLocaleString('en-IN')}`}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <ProductReviews productName={product.name} />
      </main>

      <Footer />

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#EFE8E1] bg-[#FAF7F2] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-display font-normal text-2xl text-[#1C1917] mb-4 text-center">
              {product.name}
            </h4>
            <div className="relative w-72 h-72 flex items-center justify-center">
              {hasUploadedPhoto ? (
                <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain rounded-2xl" />
              ) : (
                <CategoryArt k={product.artCategory || 'bouquet'} colors={palette} className="w-full h-full" />
              )}
            </div>
            <p className="text-xs text-[#8C827A] mt-4 font-medium">
              Givento Studio · Handcrafted with love
            </p>
          </div>
        </div>
      )}

      {/* Order Info Modal — collects delivery details before opening WhatsApp */}
      <OrderInfoModal
        isOpen={waModalOpen}
        onClose={handleModalClose}
        waMessageTemplate={buildWaTemplate(waModalMode)}
        submitLabel={waModalMode === 'bag' ? 'Confirm & Send Order on WhatsApp' : 'Send Order on WhatsApp'}
        onCompleteOrder={handleOrderSubmit}
      />
    </div>
  );
}
