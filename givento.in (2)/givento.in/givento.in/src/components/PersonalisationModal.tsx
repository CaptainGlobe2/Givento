'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '../types';
import { useBasket } from '../context/BasketContext';
import { X, Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';

interface PersonalisationModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function PersonalisationModal({ product, onClose }: PersonalisationModalProps) {
  const { addToBasket } = useBasket();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();

  if (!product) return null;

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleVariantChange = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const handleAdd = () => {
    addToBasket(product, quantity, selectedVariants, formData);
    onClose();
    router.push('/cart');
  };

  const priceText = product.price
    ? `₹${product.price}`
    : product.priceFrom
    ? `From ₹${product.priceFrom}`
    : 'Price on request';

  const waOrderText = encodeURIComponent(
    `Hi Givento! 🌸 I'd like to order *${product.name}* (${priceText}).\nDetails:\n` +
      Object.entries(formData)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D1527]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-[#FFF9F6] border-3 border-[#2D1527] rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto shadow-ink-xl my-4 sm:my-8">
          
          {/* Top Washi Tape */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 -rotate-1 bg-[#FEF08A]/80 border border-[#2D1527]/30 px-8 py-1 text-xs font-handwriting text-[#2D1527] z-10 shadow-sm pointer-events-none">
            handcrafted custom order ✨
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border-2 border-[#2D1527] bg-white hover:bg-[#FDEBF0] transition shadow-ink-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#2D1527]" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start pt-4 pb-6 border-b-2 border-[#2D1527]/15">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[#2D1527] p-2 flex-shrink-0 shadow-ink-sm flex items-center justify-center">
              <Image
                src={product.images[0] || '/images/sunflower-bouquet.svg'}
                alt={product.name}
                width={80}
                height={80}
                className="object-contain max-h-full"
              />
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FDEBF0] border border-[#2D1527] text-xs font-heading text-[#7A1C30]">
                {product.realmName}
              </div>
              <h3 className="font-heading text-2xl text-[#2D1527] leading-snug">
                {product.name}
              </h3>
              <div className="font-handwriting font-bold text-2xl text-[#7A1C30]">
                {priceText}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-4">
            <p className="font-body text-sm text-[#5E3C57] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants selector if any */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 py-2 border-t border-[#2D1527]/10">
              {product.variants.map((variant) => (
                <div key={variant.name} className="space-y-1.5">
                  <label className="font-heading text-xs text-[#2D1527] uppercase tracking-wider">
                    {variant.name}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => {
                      const isSelected = selectedVariants[variant.name] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleVariantChange(variant.name, option)}
                          className={`btn-ink px-3 py-1.5 rounded-xl text-xs font-body ${
                            isSelected
                              ? 'bg-[#7A1C30] text-[#FEF08A]'
                              : 'bg-white text-[#2D1527]'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Personalisation Form Fields */}
          {product.personalisationFields && product.personalisationFields.length > 0 && (
            <div className="space-y-4 py-4 border-t-2 border-[#2D1527]/15">
              <div className="flex items-center gap-1.5 text-[#7A1C30]">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-heading text-sm uppercase tracking-wider">
                  Personalisation Details
                </h4>
              </div>

              {product.personalisationFields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block font-body text-xs font-bold text-[#2D1527]">
                    {field.label} {field.required && <span className="text-red-600">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      value={formData[field.label] || ''}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-white border-2 border-[#2D1527] rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.label] || ''}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-[#2D1527] rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData[field.label] || ''}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-white border-2 border-[#2D1527] rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="pt-6 border-t-2 border-[#2D1527]/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm font-semibold text-[#2D1527]">Quantity</span>
              <div className="flex items-center border-2 border-[#2D1527] rounded-xl bg-white overflow-hidden shadow-ink-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 font-bold text-sm hover:bg-[#FDEBF0]"
                >
                  -
                </button>
                <span className="px-3 py-1 font-heading text-sm text-[#2D1527]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 font-bold text-sm hover:bg-[#FDEBF0]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="btn-ink w-full py-3 bg-[#7A1C30] hover:bg-[#611222] text-[#FEF08A] font-heading text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#FEF08A]" />
                <span>Add to Basket</span>
              </button>

              <a
                href={`https://wa.me/919344013255?text=${waOrderText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink w-full py-3 bg-[#7BBFA6] hover:bg-[#68B097] text-[#2D1527] font-heading text-sm rounded-xl flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-4 h-4 text-[#2D1527]" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
