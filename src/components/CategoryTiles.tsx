'use client';

import React, { useState, useEffect } from 'react';
import { Category, Product } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS } from '../data/sampleData';
import { db } from '../lib/database';
import { CategoryArt } from './PrototypeArt';

interface CategoryTilesProps {
  selectedGroup?: string;
  onSelectGroup: (groupKey: string) => void;
}

export default function CategoryTiles({
  selectedGroup,
  onSelectGroup,
}: CategoryTilesProps) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    let active = true;
    Promise.all([db.getCategories(), db.getProducts()]).then(([cats, prods]) => {
      if (!active) return;
      if (cats && cats.length > 0) setCategories(cats);
      if (prods && prods.length > 0) setProducts(prods);
    });
    return () => {
      active = false;
    };
  }, []);

  // Display top categories that are active
  const displayCategories = categories.filter((c) => c.isActive !== false).slice(0, 6);

  // Helper to count products for each category
  const getProductCount = (catId: string, groupKey?: string) => {
    return products.filter(
      (p) =>
        p.categoryId === catId ||
        p.realmId === catId ||
        (groupKey && (p.categoryId === groupKey || p.realmId === groupKey))
    ).length;
  };

  // Helper to get first product colors & art
  const getArtForCategory = (catId: string, groupKey?: string) => {
    const p = products.find(
      (x) =>
        x.categoryId === catId ||
        x.realmId === catId ||
        (groupKey && (x.categoryId === groupKey || x.realmId === groupKey))
    );
    return {
      artKey: p?.artCategory || groupKey || 'bouquet',
      colors: p?.colors || (['#e0a93a', '#7cc4a6', '#e0607e'] as [string, string, string]),
    };
  };

  return (
    <section id="categories" className="py-11 border-b border-[#e8dcdc]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-end gap-3 flex-wrap mb-5.5">
          <div>
            <h2 className="font-display font-normal text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.1] text-[#231a1d]">
              Shop by category
            </h2>
            <p className="font-body text-[#6a5b60] text-[0.95rem] mt-1.5 max-w-[60ch]">
              Everything we make and stock, grouped so you can find a gift quickly.
            </p>
          </div>
        </div>

        {/* Dynamic Category Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {displayCategories.map((c) => {
            const count = getProductCount(c.id, c.groupKey);
            const { artKey, colors } = getArtForCategory(c.id, c.groupKey);
            const isSelected = selectedGroup === c.id || selectedGroup === c.groupKey;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectGroup(c.id)}
                className={`flex flex-col items-center gap-1.5 text-center rounded-[10px] p-4 pb-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[1.5px] border-[#7a1c3b] bg-white shadow-sm'
                    : 'bg-[#faf6f4] border-[1.5px] border-transparent hover:border-[#7a1c3b] hover:bg-white'
                }`}
              >
                <span className="w-[68px] h-[68px] flex items-center justify-center">
                  <CategoryArt k={artKey} colors={colors} />
                </span>
                <b className="font-body font-bold text-[0.92rem] text-[#231a1d] leading-[1.25] block">
                  {c.name}
                </b>
                <small className="text-[#6a5b60] text-[0.78rem]">
                  {count} {count === 1 ? 'item' : 'items'}
                </small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
