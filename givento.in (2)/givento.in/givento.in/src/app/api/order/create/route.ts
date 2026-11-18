import { NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

// Rate limiting map for checkout submissions: key -> timestamps[]
const checkoutRateLimitMap = new Map<string, number[]>();

function checkCheckoutRateLimit(key: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = checkoutRateLimitMap.get(key) || [];
  const windowStart = now - windowMs;
  const filtered = timestamps.filter((t) => t > windowStart);
  if (filtered.length >= limit) {
    return false;
  }
  filtered.push(now);
  checkoutRateLimitMap.set(key, filtered);
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      deliveryMode,
      shippingRegion: requestedRegion,
      giftWrap,
      giftNote,
      sendAsGift,
      recipientName,
      recipientPhone,
      couponCode,
      items,
      channel = 'website',
    } = body;

    const clientKey = customer?.phone?.trim() || 'anon-client';
    if (!checkCheckoutRateLimit(clientKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many order attempts. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your bag is empty. Please add items to order.' },
        { status: 400 }
      );
    }

    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide customer name and WhatsApp number.' },
        { status: 400 }
      );
    }

    // 1. Fetch live database state for server validation
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

    // 2. Server re-computes all items, checks stock & creates immutable snapshots
    let calculatedSubtotal = 0;
    let hasPriceOnRequest = false;
    const validatedOrderItems = [];
    const stockDecrements: Array<() => Promise<any>> = [];

    for (const item of items) {
      const q = Math.max(1, Number(item.quantity) || 1);

      if (item.isCustomBouquet && item.customBouquet) {
        const b = item.customBouquet;
        // Verify sheet
        const sheet = dbSheets.find((s) => s.id === b.sheetId);
        if (!sheet || sheet.stock <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: `The wrapping sheet "${b.sheetName || 'selected'}" is currently sold out. Please choose an in-stock sheet.`,
            },
            { status: 400 }
          );
        }

        // Verify size
        const size = dbBouquetSizes.find((s) => s.id === b.selectedSizeId) || dbBouquetSizes[0];
        const sizeBase = size?.baseCharge || 0;

        // Verify items
        let bouquetItemsTotal = 0;
        let bouquetPieces = 0;
        const bouquetItemSummary: string[] = [];

        for (const bIt of b.items || []) {
          const matchedBItem = dbBouquetItems.find((x) => x.id === bIt.id);
          const reqQty = (Number(bIt.quantity) || 1) * q;
          if (matchedBItem) {
            if (matchedBItem.stock < reqQty) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Bouquet item "${matchedBItem.name}" only has ${matchedBItem.stock} available in studio stock (you need ${reqQty}).`,
                },
                { status: 400 }
              );
            }
            bouquetItemsTotal += matchedBItem.price * (Number(bIt.quantity) || 1);
            bouquetPieces += Number(bIt.quantity) || 1;
            bouquetItemSummary.push(`${bIt.quantity}x ${matchedBItem.name}`);
          }
        }

        // Verify piece limit
        const maxPieces = size?.maxPieces || 12;
        if (bouquetPieces > maxPieces) {
          return NextResponse.json(
            {
              success: false,
              error: `Bouquet size "${size?.name || 'Selected'}" allows up to ${maxPieces} pieces (currently has ${bouquetPieces}).`,
            },
            { status: 400 }
          );
        }

        // Verify decorations
        let decsTotal = 0;
        const decNames: string[] = [];
        for (const d of b.decorations || []) {
          const matchedDec = dbDecorations.find((x) => x.id === d.id);
          if (matchedDec) {
            decsTotal += matchedDec.price;
            decNames.push(matchedDec.name);
          }
        }

        // Authoritative custom bouquet unit price
        const unitBouquetPrice = sheet.price + sizeBase + bouquetItemsTotal + decsTotal;
        const lineTotal = unitBouquetPrice * q;
        calculatedSubtotal += lineTotal;

        validatedOrderItems.push({
          productName: `Your Own Bouquet (${sheet.name})`,
          quantity: q,
          price: unitBouquetPrice,
          personalisation: {
            'Wrapping Sheet': sheet.name,
            'Size Tier': size?.name || 'Classic',
            'Items': bouquetItemSummary.join(', '),
            ...(decNames.length > 0 ? { 'Decorations': decNames.join(', ') } : {}),
            ...(b.cardMessage ? { 'Card Message': b.cardMessage } : {}),
            ...(b.hasPhotos ? { 'Photo Prints': 'Customer sending photos via WhatsApp' } : {}),
          },
        });

        // Queue stock decrement
        stockDecrements.push(async () => {
          await db.decrementBouquetStock(
            sheet.id,
            (b.items || []).map((x: any) => ({
              id: x.id,
              quantity: (Number(x.quantity) || 1) * q,
            }))
          );
        });
      } else {
        // Standard Product
        const p = dbProducts.find((x) => x.id === item.productId || x.id === item.product?.id || x.slug === item.product?.slug);
        if (!p) {
          return NextResponse.json(
            { success: false, error: 'One of the items in your bag is no longer available in the catalogue.' },
            { status: 400 }
          );
        }

        const currentStock = p.stockQuantity ?? (p.inStock ? 15 : 0);
        if (currentStock < q) {
          return NextResponse.json(
            {
              success: false,
              error: `"${p.name}" only has ${currentStock} units left in stock (you requested ${q}). Please reduce the quantity.`,
            },
            { status: 400 }
          );
        }

        // Authoritative price calculation
        let unitPrice = 0;
        if (p.priceType === 'on_request' || p.price == null) {
          hasPriceOnRequest = true;
          unitPrice = 0;
        } else if (p.priceType === 'from') {
          unitPrice = p.priceFrom || p.price || 0;
          hasPriceOnRequest = true; // Still needs final WhatsApp price confirmation
        } else {
          unitPrice = p.price || 0;
        }

        const lineTotal = unitPrice * q;
        calculatedSubtotal += lineTotal;

        validatedOrderItems.push({
          productName: p.name,
          quantity: q,
          price: unitPrice,
          variants: item.selectedVariants || item.variants,
          personalisation: item.personalisationData || item.personalisation,
        });

        // Queue stock decrement
        stockDecrements.push(async () => {
          await db.decrementProductStock(p.id, q);
        });
      }
    }

    // 3. Server re-computes coupon discount
    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const matchedCoupon = dbCoupons.find((c) => c.code.toUpperCase() === code && c.isActive);

      if (matchedCoupon && calculatedSubtotal >= matchedCoupon.minOrder) {
        if (matchedCoupon.discountType === 'percentage') {
          discountAmount = Math.round(calculatedSubtotal * (matchedCoupon.discountValue / 100));
        } else {
          discountAmount = matchedCoupon.discountValue;
        }
        appliedCouponCode = matchedCoupon.code;
      }
    }

    // 4. Server re-computes regional shipping rule
    const isPickup =
      deliveryMode === 'Pickup in Adirampattinam' ||
      requestedRegion === 'pickup' ||
      (customer.address && customer.address.toLowerCase().includes('pickup'));

    let selectedRule = dbShippingRules.find((r) => r.region === 'pickup');

    if (!isPickup) {
      if (requestedRegion) {
        selectedRule = dbShippingRules.find((r) => r.region === requestedRegion);
      } else {
        const addrText = `${customer.address || ''} ${customer.city || ''} ${customer.state || ''}`.toLowerCase();
        if (addrText.includes('adiram') || addrText.includes('adirampattinam') || (customer.pincode === '614701')) {
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

    // 5. Generate unique order ID & Save Order
    const orderId = `GVN-${Math.floor(100000 + Math.random() * 900000)}`;

    const savedOrder = await db.createOrder({
      id: orderId,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email?.trim() || undefined,
      address: isPickup ? 'Local Studio Pickup / Adirampattinam' : (customer.address?.trim() || 'Address to confirm'),
      city: isPickup ? 'Adirampattinam' : (customer.city?.trim() || 'Adirampattinam'),
      state: isPickup ? 'Tamil Nadu' : (customer.state?.trim() || 'Tamil Nadu'),
      pincode: isPickup ? '614701' : (customer.pincode?.trim() || '614701'),
      status: 'Pending WhatsApp Confirmation',
      channel,
      paymentMethod: 'whatsapp',
      paymentStatus: 'Pending',
      subtotal: calculatedSubtotal,
      giftWrap: !!giftWrap,
      giftNote: giftNote?.trim() || undefined,
      sendAsGift: !!sendAsGift,
      recipientName: recipientName?.trim() || undefined,
      recipientPhone: recipientPhone?.trim() || undefined,
      deliveryFee,
      deliveryRule: selectedRule.name,
      total: grandTotal,
      items: validatedOrderItems,
      createdAt: new Date().toISOString(),
    });

    // 6. Execute stock decrements
    for (const dec of stockDecrements) {
      try {
        await dec();
      } catch (err) {
        console.error('Error decrementing stock:', err);
      }
    }

    // 7. Format order summary text for WhatsApp and Instagram
    const waPhone = '919344013255'; // Givento business WhatsApp number
    let orderMsg = `Hello Givento! 🌸\n`;
    orderMsg += `I just placed Order *#${orderId}* on givento.in!\n\n`;
    orderMsg += `*Customer:* ${customer.name.trim()} (${customer.phone.trim()})\n`;
    orderMsg += isPickup
      ? `*Fulfillment:* Direct Studio Pickup (Adirampattinam)\n`
      : `*Delivery Address:* ${customer.address || ''}, ${customer.city || 'Adirampattinam'} - ${customer.pincode || '614701'}\n`;

    if (sendAsGift && recipientName) {
      orderMsg += `*Recipient:* ${recipientName} (${recipientPhone || 'No phone'})\n`;
    }

    orderMsg += `\n*Order Items:*\n`;
    validatedOrderItems.forEach((it, idx) => {
      const priceDisp = it.price > 0 ? `₹${it.price * it.quantity}` : 'Price to confirm';
      orderMsg += `${idx + 1}. *${it.productName}* (x${it.quantity}) - ${priceDisp}\n`;

      if (it.personalisation) {
        Object.entries(it.personalisation).forEach(([k, v]) => {
          if (v) orderMsg += `   • ${k}: ${v}\n`;
        });
      }
    });

    if (giftWrap) {
      orderMsg += `\n🎁 *Gift Wrap:* Yes (+₹49, kraft paper & wax seal)\n`;
    }
    if (giftNote) {
      orderMsg += `💌 *Card Note:* "${giftNote}"\n`;
    }
    if (appliedCouponCode) {
      orderMsg += `🏷️ *Coupon:* ${appliedCouponCode} (-₹${discountAmount})\n`;
    }

    orderMsg += `\n🚚 *Delivery:* ${selectedRule.name} (${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`})\n`;
    orderMsg += `*Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}${
      hasPriceOnRequest ? ' (final amount to confirm on WhatsApp)' : ''
    }\n\n`;
    orderMsg += `*Order Tracking:* https://givento.in/track?orderId=${orderId}\n\n`;
    orderMsg += `Please confirm my order & share UPI payment details! Thank you ✨`;

    const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(orderMsg)}`;

    return NextResponse.json({
      success: true,
      orderId,
      status: 'Pending WhatsApp Confirmation',
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      deliveryFee,
      deliveryRule: selectedRule.name,
      total: grandTotal,
      hasPriceOnRequest,
      whatsappUrl,
      orderText: orderMsg,
      trackingUrl: `/order/${orderId}`,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error processing order checkout.' },
      { status: 500 }
    );
  }
}
