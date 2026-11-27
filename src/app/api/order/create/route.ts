import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../../../../lib/database';
import {
  computeAuthoritativeCheckout,
  type CheckoutCustomerInput,
  type CheckoutItemInput,
} from '../../../../lib/checkoutPricing';

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

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const providedBuf = Buffer.from(signature, 'hex');

  return (
    providedBuf.length === expectedBuf.length &&
    expectedBuf.length > 0 &&
    crypto.timingSafeEqual(expectedBuf, providedBuf)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer?: CheckoutCustomerInput;
      deliveryMode?: string;
      shippingRegion?: string;
      giftWrap?: boolean;
      giftNote?: string;
      sendAsGift?: boolean;
      recipientName?: string;
      recipientPhone?: string;
      couponCode?: string;
      items?: CheckoutItemInput[];
      channel?: 'website' | 'whatsapp' | 'instagram' | 'walkin_expo' | 'phone' | 'in_person';
      paymentMethod?: 'whatsapp' | 'razorpay';
      razorpayPayment?: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      };
    };

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
      paymentMethod = 'whatsapp',
      razorpayPayment,
    } = body;

    const clientKey = customer?.phone?.trim() || 'anon-client';
    if (!checkCheckoutRateLimit(clientKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many order attempts. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide customer name and WhatsApp number.' },
        { status: 400 }
      );
    }

    const checkoutOutcome = await computeAuthoritativeCheckout({
      customer,
      deliveryMode,
      shippingRegion: requestedRegion,
      giftWrap,
      couponCode,
      items,
    });

    if (!checkoutOutcome.ok) {
      return NextResponse.json(
        { success: false, error: checkoutOutcome.error },
        { status: checkoutOutcome.status }
      );
    }

    const {
      validatedOrderItems,
      stockDecrements,
      calculatedSubtotal,
      discountAmount,
      appliedCouponCode,
      deliveryFee,
      deliveryRule,
      isPickup,
      grandTotal,
      hasPriceOnRequest,
    } = checkoutOutcome.data;

    let verifiedPaymentId = '';
    let verifiedRzpOrderId = '';
    const isRazorpayOrder = paymentMethod === 'razorpay';

    if (isRazorpayOrder) {
      const rzpOrderId = razorpayPayment?.razorpay_order_id?.trim() || '';
      const rzpPaymentId = razorpayPayment?.razorpay_payment_id?.trim() || '';
      const rzpSignature = razorpayPayment?.razorpay_signature?.trim() || '';

      if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
        return NextResponse.json(
          { success: false, error: 'Missing verified Razorpay payment details.' },
          { status: 400 }
        );
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret || keyId.includes('yourkey') || keySecret.includes('your_secret')) {
        return NextResponse.json(
          { success: false, error: 'Razorpay payment verification is not configured on this server.' },
          { status: 503 }
        );
      }

      if (!verifyRazorpaySignature(rzpOrderId, rzpPaymentId, rzpSignature, keySecret)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Razorpay payment signature.' },
          { status: 400 }
        );
      }

      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const rzpOrder = await razorpay.orders.fetch(rzpOrderId);
      const expectedPaise = Math.round(grandTotal * 100);
      if (Number(rzpOrder.amount) !== expectedPaise || rzpOrder.currency !== 'INR') {
        return NextResponse.json(
          { success: false, error: 'Paid Razorpay amount does not match the order total.' },
          { status: 400 }
        );
      }

      verifiedPaymentId = rzpPaymentId;
      verifiedRzpOrderId = rzpOrderId;
    }

    const orderId = `GVN-${Math.floor(100000 + Math.random() * 900000)}`;
    const initialStatus = isRazorpayOrder ? 'Received' : 'Pending WhatsApp Confirmation';

    const savedOrder = await db.createOrder({
      id: orderId,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email?.trim() || undefined,
      address: isPickup
        ? 'Local Studio Pickup / Adirampattinam'
        : customer.address?.trim() || 'Address to confirm',
      city: isPickup ? 'Adirampattinam' : customer.city?.trim() || 'Adirampattinam',
      state: isPickup ? 'Tamil Nadu' : customer.state?.trim() || 'Tamil Nadu',
      pincode: isPickup ? '614701' : customer.pincode?.trim() || '614701',
      status: initialStatus,
      channel,
      paymentMethod: isRazorpayOrder ? 'razorpay' : 'whatsapp',
      paymentStatus: isRazorpayOrder ? 'Fully Paid' : 'Pending',
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      giftWrap: !!giftWrap,
      giftNote: giftNote?.trim() || undefined,
      sendAsGift: !!sendAsGift,
      recipientName: recipientName?.trim() || undefined,
      recipientPhone: recipientPhone?.trim() || undefined,
      deliveryFee,
      deliveryRule,
      total: grandTotal,
      adminNotes: isRazorpayOrder
        ? `Paid Online via Razorpay | Order: ${verifiedRzpOrderId} | Payment: ${verifiedPaymentId}`
        : undefined,
      items: validatedOrderItems,
      createdAt: new Date().toISOString(),
    });

    for (const dec of stockDecrements) {
      try {
        await dec();
      } catch (err) {
        console.error('Error decrementing stock:', err);
      }
    }

    const waPhone = '919344013255';
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

    orderMsg += `\n🚚 *Delivery:* ${deliveryRule} (${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`})\n`;
    orderMsg += `*Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}${
      hasPriceOnRequest ? ' (final amount to confirm on WhatsApp)' : ''
    }\n`;
    if (isRazorpayOrder) {
      orderMsg += `✅ *Payment Status:* Paid Online via Razorpay (${verifiedPaymentId})\n\n`;
      orderMsg += `*Order Tracking:* https://givento.in/track?orderId=${orderId}\n\n`;
      orderMsg += `Payment completed! Looking forward to my handcrafted parcel ✨`;
    } else {
      orderMsg += `\n*Order Tracking:* https://givento.in/track?orderId=${orderId}\n\n`;
      orderMsg += `Please confirm my order & share UPI payment details! Thank you ✨`;
    }

    const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(orderMsg)}`;

    return NextResponse.json({
      success: true,
      orderId,
      order: savedOrder,
      status: initialStatus,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      deliveryFee,
      deliveryRule,
      total: grandTotal,
      hasPriceOnRequest,
      whatsappUrl,
      orderText: orderMsg,
      trackingUrl: `/order/${orderId}`,
      razorpayPaymentId: verifiedPaymentId || undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error processing order checkout.';
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
