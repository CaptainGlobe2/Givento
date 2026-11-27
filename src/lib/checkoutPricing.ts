import { db, type AdminOrderItem } from './database';

export interface CheckoutCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CheckoutItemInput {
  productId?: string;
  product?: {
    id?: string;
    slug?: string;
  };
  quantity?: number;
  selectedVariants?: Record<string, string>;
  variants?: Record<string, string>;
  personalisationData?: Record<string, string>;
  personalisation?: Record<string, string>;
  photoUrl?: string;
  isCustomBouquet?: boolean;
  customBouquet?: {
    sheetId: string;
    sheetName?: string;
    selectedSizeId?: string;
    items?: Array<{ id: string; quantity?: number }>;
    decorations?: Array<{ id: string }>;
    cardMessage?: string;
    hasPhotos?: boolean;
  };
}

export interface ComputedCheckoutResult {
  validatedOrderItems: AdminOrderItem[];
  stockDecrements: Array<() => Promise<unknown>>;
  calculatedSubtotal: number;
  discountAmount: number;
  appliedCouponCode?: string;
  deliveryFee: number;
  deliveryRule: string;
  isPickup: boolean;
  giftWrapFee: number;
  grandTotal: number;
  hasPriceOnRequest: boolean;
}

export type CheckoutPricingOutcome =
  | { ok: true; data: ComputedCheckoutResult }
  | { ok: false; status: number; error: string };

const FINISHING_TOUCHES_PRICES: Record<string, { name: string; price: number }> = {
  'addon-pouch': { name: 'Velvet Jewellery Pouch', price: 49 },
  'addon-polaroid': { name: 'Mini Polaroid Memory Print', price: 39 },
  'addon-clip': { name: 'Crochet Flower Hair Clip', price: 79 },
  'addon-charm': { name: 'Resin Gold Flake Charm', price: 99 },
};

export async function computeAuthoritativeCheckout(params: {
  customer?: CheckoutCustomerInput;
  deliveryMode?: string;
  shippingRegion?: string;
  giftWrap?: boolean;
  couponCode?: string;
  items?: CheckoutItemInput[];
}): Promise<CheckoutPricingOutcome> {
  const { customer = {}, deliveryMode, shippingRegion: requestedRegion, giftWrap, couponCode, items } = params;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: 'Your bag is empty. Please add items to order.' };
  }

  const [
    dbProducts,
    dbSheets,
    dbBouquetItems,
    dbBouquetSizes,
    dbDecorations,
    dbShippingRules,
    dbCoupons,
  ] = await Promise.all([
    db.getProducts(),
    db.getWrappingSheets(),
    db.getBouquetItems(),
    db.getBouquetSizes(),
    db.getDecorations(),
    db.getShippingRules(),
    db.getCoupons(),
  ]);

  let calculatedSubtotal = 0;
  let hasPriceOnRequest = false;
  const validatedOrderItems: AdminOrderItem[] = [];
  const stockDecrements: Array<() => Promise<unknown>> = [];

  for (const item of items) {
    const q = Math.max(1, Number(item.quantity) || 1);

    if (item.isCustomBouquet && item.customBouquet) {
      const b = item.customBouquet;
      const sheet = dbSheets.find((s) => s.id === b.sheetId);
      if (!sheet || sheet.stock <= 0) {
        return {
          ok: false,
          status: 400,
          error: `The wrapping sheet "${b.sheetName || 'selected'}" is currently sold out. Please choose an in-stock sheet.`,
        };
      }

      const size = dbBouquetSizes.find((s) => s.id === b.selectedSizeId) || dbBouquetSizes[0];
      const sizeBase = size?.baseCharge || 0;

      let bouquetItemsTotal = 0;
      let bouquetPieces = 0;
      const bouquetItemSummary: string[] = [];

      for (const bIt of b.items || []) {
        const matchedBItem = dbBouquetItems.find((x) => x.id === bIt.id);
        const reqQty = (Number(bIt.quantity) || 1) * q;
        if (matchedBItem) {
          if (matchedBItem.stock < reqQty) {
            return {
              ok: false,
              status: 400,
              error: `Bouquet item "${matchedBItem.name}" only has ${matchedBItem.stock} available in studio stock (you need ${reqQty}).`,
            };
          }
          bouquetItemsTotal += matchedBItem.price * (Number(bIt.quantity) || 1);
          bouquetPieces += Number(bIt.quantity) || 1;
          bouquetItemSummary.push(`${bIt.quantity}x ${matchedBItem.name}`);
        }
      }

      const maxPieces = size?.maxPieces || 12;
      if (bouquetPieces > maxPieces) {
        return {
          ok: false,
          status: 400,
          error: `Bouquet size "${size?.name || 'Selected'}" allows up to ${maxPieces} pieces (currently has ${bouquetPieces}).`,
        };
      }

      let decsTotal = 0;
      const decNames: string[] = [];
      for (const d of b.decorations || []) {
        const matchedDec = dbDecorations.find((x) => x.id === d.id);
        if (matchedDec) {
          decsTotal += matchedDec.price;
          decNames.push(matchedDec.name);
        }
      }

      const unitBouquetPrice = sheet.price + sizeBase + bouquetItemsTotal + decsTotal;
      calculatedSubtotal += unitBouquetPrice * q;

      validatedOrderItems.push({
        productName: `Your Own Bouquet (${sheet.name})`,
        quantity: q,
        price: unitBouquetPrice,
        personalisation: {
          'Wrapping Sheet': sheet.name,
          'Size Tier': size?.name || 'Classic',
          Items: bouquetItemSummary.join(', '),
          ...(decNames.length > 0 ? { Decorations: decNames.join(', ') } : {}),
          ...(b.cardMessage ? { 'Card Message': b.cardMessage } : {}),
          ...(b.hasPhotos ? { 'Photo Prints': 'Customer sending photos via WhatsApp' } : {}),
        },
      });

      stockDecrements.push(async () => {
        await db.decrementBouquetStock(
          sheet.id,
          (b.items || []).map((x) => ({
            id: x.id,
            quantity: (Number(x.quantity) || 1) * q,
          }))
        );
      });
    } else {
      const rawPid = String(item.productId || item.product?.id || '');
      const addonMeta = FINISHING_TOUCHES_PRICES[rawPid];
      if (addonMeta) {
        calculatedSubtotal += addonMeta.price * q;
        validatedOrderItems.push({
          productId: rawPid,
          productName: addonMeta.name,
          quantity: q,
          price: addonMeta.price,
          variants: item.selectedVariants || item.variants,
          personalisation: item.personalisationData || item.personalisation,
        });
        continue;
      }

      const p = dbProducts.find(
        (x) =>
          x.id === item.productId ||
          x.slug === item.productId ||
          x.id === item.product?.id ||
          x.slug === item.product?.slug
      );
      if (!p) {
        return {
          ok: false,
          status: 400,
          error: 'One of the items in your bag is no longer available in the catalogue.',
        };
      }

      const currentStock = p.stockQuantity ?? (p.inStock ? 15 : 0);
      if (currentStock < q) {
        return {
          ok: false,
          status: 400,
          error: `"${p.name}" only has ${currentStock} units left in stock (you requested ${q}). Please reduce the quantity.`,
        };
      }

      let unitPrice = 0;
      if (p.priceType === 'on_request' || p.price == null) {
        hasPriceOnRequest = true;
        unitPrice = 0;
      } else if (p.priceType === 'from') {
        unitPrice = p.priceFrom || p.price || 0;
        hasPriceOnRequest = true;
      } else {
        unitPrice = p.price || 0;
      }

      calculatedSubtotal += unitPrice * q;

      const mergedPersonalisation = {
        ...(item.personalisationData || item.personalisation || {}),
        ...(item.photoUrl ? { 'Uploaded Photo': String(item.photoUrl) } : {}),
      };

      validatedOrderItems.push({
        productId: p.id,
        productName: p.name,
        quantity: q,
        price: unitPrice,
        image: p.images?.[0],
        variants: item.selectedVariants || item.variants,
        personalisation: Object.keys(mergedPersonalisation).length > 0 ? mergedPersonalisation : undefined,
      });

      stockDecrements.push(async () => {
        await db.decrementProductStock(p.id, q);
      });
    }
  }

  let discountAmount = 0;
  let appliedCouponCode: string | undefined;

  if (couponCode) {
    const code = String(couponCode).trim().toUpperCase();
    const matchedCoupon = dbCoupons.find((c) => c.code.toUpperCase() === code && c.isActive);

    if (matchedCoupon && calculatedSubtotal >= matchedCoupon.minOrder) {
      if (matchedCoupon.discountType === 'percentage') {
        discountAmount = Math.round(calculatedSubtotal * (matchedCoupon.discountValue / 100));
      } else {
        discountAmount = Math.min(calculatedSubtotal, matchedCoupon.discountValue);
      }
      appliedCouponCode = matchedCoupon.code;
    }
  }

  const isPickup =
    deliveryMode === 'Pickup in Adirampattinam' ||
    requestedRegion === 'pickup' ||
    Boolean(customer.address && customer.address.toLowerCase().includes('pickup'));

  let selectedRule = dbShippingRules.find((r) => r.region === 'pickup');

  if (!isPickup) {
    if (requestedRegion) {
      selectedRule = dbShippingRules.find((r) => r.region === requestedRegion);
    } else {
      const addrText = `${customer.address || ''} ${customer.city || ''} ${customer.state || ''}`.toLowerCase();
      if (addrText.includes('adiram') || addrText.includes('adirampattinam') || customer.pincode === '614701') {
        selectedRule = dbShippingRules.find((r) => r.region === 'local_adiram');
      } else if (addrText.includes('tamil nadu') || addrText.includes('tamilnadu') || addrText.includes(' tn')) {
        selectedRule = dbShippingRules.find((r) => r.region === 'tamil_nadu');
      } else {
        selectedRule = dbShippingRules.find((r) => r.region === 'interstate');
      }
    }
  }

  if (!selectedRule) {
    selectedRule = dbShippingRules[0] || {
      id: 'ship-default',
      name: 'Standard Delivery',
      region: 'tamil_nadu',
      baseCharge: 50,
      freeThreshold: 899,
      estimatedDays: '1-3 days',
      isActive: true,
      sortOrder: 1,
    };
  }

  const isFreeShipping =
    isPickup ||
    selectedRule.baseCharge === 0 ||
    (selectedRule.freeThreshold > 0 && calculatedSubtotal >= selectedRule.freeThreshold);

  const deliveryFee = isFreeShipping ? 0 : selectedRule.baseCharge;
  const giftWrapFee = giftWrap ? 49 : 0;
  const grandTotal = Math.max(0, calculatedSubtotal - discountAmount + deliveryFee + giftWrapFee);

  return {
    ok: true,
    data: {
      validatedOrderItems,
      stockDecrements,
      calculatedSubtotal,
      discountAmount,
      appliedCouponCode,
      deliveryFee,
      deliveryRule: selectedRule.name,
      isPickup,
      giftWrapFee,
      grandTotal,
      hasPriceOnRequest,
    },
  };
}
