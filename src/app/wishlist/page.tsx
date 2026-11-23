'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useBasket } from '../../context/BasketContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToBasket } = useBasket();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/category/all"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collections</span>
          </Link>
        </div>

        {/* Section Header Matching Home Page Design */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#EFE8E1]">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase mb-1.5">
              Saved Pieces
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Your Dream Wishlist
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#78716C] mt-1">
              Handcrafted keepsakes &amp; blooms pinned for upcoming milestones or gifting ✨
            </p>
          </div>

          <span className="bg-white border border-[#EFE8E1] px-4 py-1.5 rounded-full text-xs font-semibold text-[#1C1917] shadow-2xs">
            {wishlist.length} {wishlist.length === 1 ? 'saved piece' : 'saved pieces'}
          </span>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-[#FDF0F3] rounded-full border border-[#F3D5DE] flex items-center justify-center mx-auto text-2xl text-[#E0607E]">
              🤍
            </div>
            <h2 className="font-display font-normal text-2xl text-[#1C1917]">
              Your wishlist is empty
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Tap the delicate heart icon on any handcrafted piece while browsing to save it here for later.
            </p>
            <div className="pt-2">
              <Link
                href="/category/all"
                className="inline-block px-6 py-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Explore Collections →
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid: Matching Home Page Product Cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {wishlist.map((product) => {
              const priceText =
                typeof product.price === 'number'
                  ? `${product.from ? 'from ' : ''}₹${product.price.toLocaleString('en-IN')}`
                  : typeof product.priceFrom === 'number'
                  ? `from ₹${product.priceFrom.toLocaleString('en-IN')}`
                  : 'Price on chat';

              const mainImage =
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-[#EFE8E1] p-3 sm:p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Square Image Container with Top-Right Delete Badge */}
                    <div className="relative aspect-square w-full bg-[#FAF7F2] rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <img
                          src={mainImage}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs text-[#78716C] hover:text-[#B3261E] hover:bg-white flex items-center justify-center shadow-xs transition-colors cursor-pointer z-10"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Label */}
                    <div className="text-[10px] tracking-wider font-semibold text-[#8C827A] uppercase mb-1 truncate">
                      {product.realmName || product.categoryName || 'Handcrafted'}
                    </div>

                    {/* Title */}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-xs sm:text-sm text-[#1C1917] truncate leading-snug group-hover:text-[#7A1C3B] transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    <p className="font-sans text-[11px] text-[#78716C] line-clamp-1 mb-2">
                      {product.shortDescription}
                    </p>

                    {/* Price */}
                    <div className="font-bold text-sm sm:text-base text-[#1C1917] tabular-nums mb-3">
                      {priceText}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#EFE8E1] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToBasket(product);
                        removeFromWishlist(product.id);
                      }}
                      className="flex-1 py-2 px-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      className="p-2 rounded-xl border border-[#EFE8E1] bg-white hover:bg-[#FAF7F2] text-[#1C1917] transition-colors flex items-center justify-center"
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

      <Footer />
    </div>
  );
}
