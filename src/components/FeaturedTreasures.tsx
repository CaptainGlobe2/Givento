'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '../data/sampleData';
import { Product } from '../types';
import { db } from '../lib/database';
import { useBasket } from '../context/BasketContext';
import PersonalisationModal from './PersonalisationModal';
import { Sparkles, ShoppingBag, Eye } from 'lucide-react';

interface FeaturedTreasuresProps {
  selectedRealmId?: string | null;
  onClearRealmFilter?: () => void;
}

export default function FeaturedTreasures({
  selectedRealmId,
  onClearRealmFilter,
}: FeaturedTreasuresProps) {
  const { addToBasket } = useBasket();
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    db.getProducts().then((p) => {
      if (active && p && p.length > 0) {
        setProductsList(p);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Filter products if a realm is selected, otherwise show featured + bestsellers
  const displayedProducts = selectedRealmId
    ? productsList.filter((p) => p.realmId === selectedRealmId)
    : productsList.filter((p) => p.featured);

  const getWashiTapeClass = (color?: Product['tapeColor']) => {
    switch (color) {
      case 'mint':
        return 'washi-tape washi-tape-mint';
      case 'rose':
        return 'washi-tape washi-tape-rose';
      case 'gold':
        return 'washi-tape washi-tape-gold';
      case 'yellow':
      default:
        return 'washi-tape';
    }
  };

  const getTiltClass = (deg?: number, index = 0) => {
    if (deg !== undefined) {
      if (deg < -1.5) return '-rotate-2';
      if (deg < 0) return '-rotate-1';
      if (deg > 1.5) return 'rotate-2';
      return 'rotate-1';
    }
    const tilts = ['-rotate-1', 'rotate-1.5', '-rotate-2', 'rotate-1', '-rotate-1.5', 'rotate-2'];
    return tilts[index % tilts.length];
  };

  const renderPriceTag = (product: Product) => {
    if (product.priceType === 'on_request' || (!product.price && !product.priceFrom)) {
      return (
        <div className="bg-[#FEF08A] border-2 border-[#2D1527] px-2 py-0.5 rounded shadow-ink-sm rotate-2">
          <span className="font-handwriting font-bold text-xs text-[#7A1C30]">
            Ask us 💌
          </span>
        </div>
      );
    }
    if (product.priceType === 'from' && product.priceFrom) {
      return (
        <div className="bg-[#FEF08A] border-2 border-[#2D1527] px-2.5 py-0.5 rounded shadow-ink-sm -rotate-2">
          <span className="font-handwriting font-bold text-base text-[#7A1C30]">
            from ₹{product.priceFrom}
          </span>
        </div>
      );
    }
    return (
      <div className="bg-[#FEF08A] border-2 border-[#2D1527] px-2.5 py-0.5 rounded shadow-ink-sm -rotate-2 flex items-center gap-1.5">
        <span className="font-handwriting font-bold text-lg text-[#7A1C30]">
          ₹{product.price}
        </span>
        {product.originalPrice && (
          <span className="font-handwriting text-xs text-[#5E3C57] line-through">
            ₹{product.originalPrice}
          </span>
        )}
      </div>
    );
  };

  const handleCardClick = (product: Product) => {
    if (product.isPersonalised || product.variants?.length || product.priceType === 'on_request') {
      setActiveProduct(product);
    } else {
      addToBasket(product);
    }
  };

  return (
    <section id="treasures" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b-2 border-[#2D1527]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FDEBF0] border border-[#2D1527] text-xs font-heading text-[#7A1C30] shadow-ink-sm mb-2 -rotate-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>hand-crafted parcels</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl text-[#2D1527]">
            {selectedRealmId ? 'Realm Treasures' : 'Featured Treasures'}
          </h2>
          <p className="font-body text-sm sm:text-base text-[#5E3C57] mt-1">
            Paper cards pinned from our studio table. Cards straighten on hover.
          </p>
        </div>

        {selectedRealmId && (
          <button
            onClick={onClearRealmFilter}
            className="btn-ink px-4 py-2 bg-[#FFF2EC] text-[#7A1C30] rounded-xl text-xs font-heading self-start sm:self-auto"
          >
            ✕ Show all treasures
          </button>
        )}
      </div>

      {/* Grid of Tilted Paper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedProducts.map((product, index) => {
          const tiltClass = getTiltClass(product.tiltDeg, index);
          const washiClass = getWashiTapeClass(product.tapeColor);

          return (
            <div
              key={product.id}
              className={`relative bg-[#FAF2EC] border-2 border-[#2D1527] rounded-2xl p-5 shadow-ink transition-all duration-200 hover:rotate-0 hover:scale-[1.02] hover:shadow-ink-lg flex flex-col justify-between ${tiltClass} ${washiClass}`}
            >
              {/* Card Content Top */}
              <div>
                
                {/* Product Artwork sticker style */}
                <div className="relative w-full aspect-square bg-[#FFF9F6] rounded-xl border border-[#2D1527]/30 p-4 mb-4 flex items-center justify-center overflow-hidden">
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#7A1C30] text-[#FEF08A] text-[10px] font-heading border border-[#2D1527] shadow-ink-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Handwritten Price Tag stuck on the corner of the picture */}
                  <div className="absolute bottom-2.5 right-2.5 z-10">
                    {renderPriceTag(product)}
                  </div>

                  {/* Sticker Graphic */}
                  <div className="relative w-40 h-40 max-w-full max-h-full sticker-outline">
                    <Image
                      src={product.images[0] || '/images/sunflower-bouquet.svg'}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Realm tag and Title */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C30] font-body">
                    {product.realmName}
                  </div>
                  <h3 className="font-heading text-xl text-[#2D1527] leading-tight">
                    {product.name}
                  </h3>
                  <p className="font-body text-xs text-[#5E3C57] line-clamp-2 leading-relaxed pt-1">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Story snippet if available */}
                {product.storySnippet && (
                  <div className="mt-2.5 p-2 bg-[#FFF2EC] rounded-lg border border-dashed border-[#2D1527]/30">
                    <p className="font-handwriting text-xs text-[#7A1C30]">
                      “{product.storySnippet}”
                    </p>
                  </div>
                )}
              </div>

              {/* Card Actions Bottom */}
              <div className="mt-5 pt-3 border-t border-[#2D1527]/15 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCardClick(product)}
                  className="btn-ink flex-1 py-2.5 bg-[#7A1C30] hover:bg-[#611222] text-[#FEF08A] rounded-xl font-heading text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>
                    {product.isPersonalised
                      ? 'Personalise & Add'
                      : product.priceType === 'on_request'
                      ? 'Request Details'
                      : 'Add to Basket'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProduct(product)}
                  className="btn-ink p-2.5 bg-white hover:bg-[#FDEBF0] text-[#2D1527] rounded-xl text-xs"
                  title="View story & details"
                  aria-label="View product details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Personalisation / Quick Details Modal */}
      <PersonalisationModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
      />

    </section>
  );
}
