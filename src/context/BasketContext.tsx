'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BasketItem, Product } from '../types';
import { CustomBouquetLine } from '../types/bouquet';

interface BasketContextType {
  items: BasketItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  giftWrap: boolean;
  giftNote: string;
  sendAsGift: boolean;
  giftWrapFee: number;
  total: number;
  setGiftWrap: (val: boolean) => void;
  setGiftNote: (val: string) => void;
  setSendAsGift: (val: boolean) => void;
  addToBasket: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>,
    personalisationData?: Record<string, string>,
    photoUrl?: string
  ) => void;
  addCustomBouquetToBasket: (bouquet: CustomBouquetLine) => void;
  removeFromBasket: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearBasket: () => void;
  openBasket: () => void;
  closeBasket: () => void;
  buildWhatsAppMessage: () => string;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [sendAsGift, setSendAsGift] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved basket from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem('givento_basket');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const savedGift = localStorage.getItem('givento_gift_prefs');
      if (savedGift) {
        const parsed = JSON.parse(savedGift);
        setGiftWrap(!!parsed.giftWrap);
        setGiftNote(parsed.giftNote || '');
        setSendAsGift(!!parsed.sendAsGift);
      }
    } catch {
      // ignore storage error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist basket to localStorage only AFTER initial client load
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('givento_basket', JSON.stringify(items));
    } catch {
      // ignore storage error
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        'givento_gift_prefs',
        JSON.stringify({ giftWrap, giftNote, sendAsGift })
      );
    } catch {
      // ignore
    }
  }, [giftWrap, giftNote, sendAsGift, isLoaded]);

  const addToBasket = (
    product: Product,
    quantity = 1,
    selectedVariants?: Record<string, string>,
    personalisationData?: Record<string, string>,
    photoUrl?: string
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          JSON.stringify(i.selectedVariants || {}) === JSON.stringify(selectedVariants || {}) &&
          JSON.stringify(i.personalisationData || {}) === JSON.stringify(personalisationData || {})
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      const newItem: BasketItem = {
        id: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product,
        quantity,
        selectedVariants,
        personalisationData,
      };

      return [...prev, newItem];
    });
  };

  const addCustomBouquetToBasket = (bouquet: CustomBouquetLine) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.isCustomBouquet && i.customBouquet?.key === bouquet.key
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }

      const customProduct: Product = {
        id: `bouquet-${bouquet.key}`,
        slug: 'custom-bouquet',
        name: `Your Own Bouquet (${bouquet.sheetName} sheet)`,
        realmId: 'bloom-glade',
        realmName: 'Bloom Glade',
        priceType: 'fixed',
        price: bouquet.totalPrice,
        shortDescription: bouquet.description,
        description: bouquet.description,
        images: ['/images/sunflower-bouquet.svg'],
        inStock: true,
      };

      const newItem: BasketItem = {
        id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product: customProduct,
        quantity: 1,
        isCustomBouquet: true,
        customBouquet: bouquet,
      };

      return [...prev, newItem];
    });
  };

  const removeFromBasket = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearBasket = () => {
    setItems([]);
  };

  const openBasket = () => setIsOpen(true);
  const closeBasket = () => setIsOpen(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.isCustomBouquet && item.customBouquet
      ? item.customBouquet.totalPrice
      : (item.product.price ?? item.product.priceFrom ?? 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const giftWrapFee = giftWrap ? 49 : 0;
  const total = subtotal + giftWrapFee;

  const buildWhatsAppMessage = () => {
    if (items.length === 0) {
      return encodeURIComponent("Hi Givento! I'm browsing your treasures on givento.in and wanted to ask a question.");
    }

    let text = `Hello Givento! 🌸\nI'd like to place an order from givento.in:\n\n`;

    items.forEach((item, index) => {
      if (item.isCustomBouquet && item.customBouquet) {
        const lineTotal = item.customBouquet.totalPrice * item.quantity;
        text += `${index + 1}. *Your Own Bouquet* (x${item.quantity}) - ₹${lineTotal}\n`;
        text += `   • Sheet: ${item.customBouquet.sheetName}\n`;
        if (item.customBouquet.selectedSizeName) {
          text += `   • Size: ${item.customBouquet.selectedSizeName}\n`;
        }
        text += `   • Items: ${item.customBouquet.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}\n`;
        if (item.customBouquet.decorations && item.customBouquet.decorations.length > 0) {
          text += `   • Decorations: ${item.customBouquet.decorations.map((d) => d.name).join(', ')}\n`;
        }
        if (item.customBouquet.cardMessage) {
          text += `   • Handwritten Card: "${item.customBouquet.cardMessage}"\n`;
        }
        if (item.customBouquet.hasPhotos) {
          text += `   • 📷 Photo prints included: [Customer will send photos on WhatsApp]\n`;
        }
        text += `\n`;
        return;
      }

      const priceText = item.product.price
        ? `₹${item.product.price}`
        : item.product.priceFrom
        ? `From ₹${item.product.priceFrom}`
        : 'Price on Request';

      text += `${index + 1}. *${item.product.name}* (x${item.quantity}) - ${priceText}\n`;

      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        text += `   • Variant: ${Object.entries(item.selectedVariants)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')}\n`;
      }

      if (item.personalisationData && Object.keys(item.personalisationData).length > 0) {
        text += `   • Personalisation:\n`;
        Object.entries(item.personalisationData).forEach(([k, v]) => {
          if (v) text += `     - ${k}: ${v}\n`;
        });
      }
      text += `\n`;
    });

    if (giftWrap) {
      text += `🎁 *Gift Wrapping:* Yes (+₹49, kraft paper & wax seal)\n`;
    }
    if (giftNote) {
      text += `💌 *Handwritten Gift Note:* "${giftNote}"\n`;
    }
    if (sendAsGift) {
      text += `🤫 *Direct Surprise:* Send directly to recipient (hide price invoice)\n`;
    }

    text += `\n*Estimated Total:* ₹${total}\n`;
    text += `Please let me know the availability, delivery fee, and payment details! Thank you ✨`;

    return encodeURIComponent(text);
  };

  return (
    <BasketContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        subtotal,
        giftWrap,
        giftNote,
        sendAsGift,
        giftWrapFee,
        total,
        setGiftWrap,
        setGiftNote,
        setSendAsGift,
        addToBasket,
        addCustomBouquetToBasket,
        removeFromBasket,
        updateQuantity,
        clearBasket,
        openBasket,
        closeBasket,
        buildWhatsAppMessage,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}
