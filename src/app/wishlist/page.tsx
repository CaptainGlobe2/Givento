'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useBasket } from '../../context/BasketContext';
import Navbar from '../../components/Navbar';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToBasket } = useBasket();
  const [movedProductName, setMovedProductName] = useState<string | null>(null);

  const handleMoveToBag = (product: (typeof wishlist)[number]) => {
    addToBasket(product);
    removeFromWishlist(product.id);
    setMovedProductName(product.name);
    setTimeout(() => {
      setMovedProductName((prev) => (prev === product.name ? null : prev));
    }, 2500);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] pb-28 font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C827A]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span>Wishlist</span>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-5 border-b border-[#EFE8E1]">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F6E9EE] border border-[#ECD1DC] text-[10px] tracking-wider font-bold text-[#7A1C3B] uppercase mb-1.5">
              Personal Collection
            </span>
            <h1 className="font-heading font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              My Wishlist
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#78716C] mt-1">
              Items you&apos;ve saved to your wishlist from our Adirampattinam studio.
            </p>
          </div>

          <span className="bg-white border border-[#EFE8E1] px-4 py-1.5 rounded-full text-xs font-semibold text-[#1C1917] shadow-2xs">
            {wishlist.length} {wishlist.length === 1 ? 'item saved' : 'items saved'}
          </span>
        </div>

        {movedProductName && (
          <div className="p-3.5 bg-[#FDF0F3] border border-[#FADDE3] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#7A1C3B] font-semibold animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Moved &ldquo;{movedProductName}&rdquo; to your shopping bag.</span>
            </span>
            <Link href="/cart" className="underline font-bold shrink-0">
              View Bag →
            </Link>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-10 sm:p-14 text-center max-w-md mx-auto my-12 space-y-4 shadow-2xs">
            <div className="w-16 h-16 bg-[#FDF0F3] rounded-2xl border border-[#F3D5DE] flex items-center justify-center mx-auto text-2xl text-[#7A1C3B]">
              <Heart className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-normal text-2xl text-[#1C1917]">
                Your wishlist is empty
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Tap the heart on any bouquet, Nikah frame, or jewellery piece to save it here for later.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-full font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Browse Creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {wishlist.map((product, idx) => {
              const priceText =
                typeof product.price === 'number'
                  ? `₹${product.price.toLocaleString('en-IN')}`
                  : typeof product.priceFrom === 'number'
                  ? `from ₹${product.priceFrom.toLocaleString('en-IN')}`
                  : 'Price on chat';

              const mainImage =
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={product.id}
                  style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                  className="group bg-white rounded-2xl border border-[#EFE8E1] p-3 sm:p-3.5 hover:shadow-xs hover:border-[#DFD5CB] transition-all duration-300 flex flex-col justify-between animate-card-rise"
                >
                  <div>
                    {/* Square Image Container */}
                    <div className="relative aspect-square w-full bg-[#FAF7F2] rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-[#EFE8E1]">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <img
                          src={mainImage}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/images/sunflower-bouquet.svg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-[#78716C] hover:text-[#B3261E] hover:bg-white flex items-center justify-center shadow-xs active:scale-90 transition cursor-pointer z-10"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Label */}
                    <div className="text-[10px] tracking-wider font-semibold text-[#8C827A] uppercase mb-0.5 truncate">
                      {product.realmName || product.categoryName || 'Handcrafted'}
                    </div>

                    {/* Title */}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-heading font-medium text-xs sm:text-sm text-[#1C1917] truncate leading-snug group-hover:text-[#7A1C3B] transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="font-sans font-bold text-xs sm:text-sm text-[#1C1917] tabular-nums mb-3">
                      {priceText}
                    </div>
                  </div>

                  {/* Move to bag button */}
                  <div className="pt-2 border-t border-[#FAF7F2] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="flex-1 py-2 px-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      className="p-2 rounded-xl border border-[#EFE8E1] bg-white hover:bg-[#FAF7F2] text-[#1C1917] active:scale-95 transition-all flex items-center justify-center"
                      title="View details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
