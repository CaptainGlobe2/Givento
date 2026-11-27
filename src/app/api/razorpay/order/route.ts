import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import {
  computeAuthoritativeCheckout,
  type CheckoutCustomerInput,
  type CheckoutItemInput,
} from '../../../../lib/checkoutPricing';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount?: unknown;
      receipt?: unknown;
      notes?: unknown;
      customer?: CheckoutCustomerInput;
      deliveryMode?: string;
      shippingRegion?: string;
      giftWrap?: boolean;
      couponCode?: string;
      items?: CheckoutItemInput[];
    };

    let payableAmount = 0;
    let pricingSummary: {
      subtotal: number;
      discount: number;
      deliveryFee: number;
      deliveryRule: string;
      giftWrapFee: number;
      total: number;
    } | null = null;

    if (Array.isArray(body?.items)) {
      const outcome = await computeAuthoritativeCheckout({
        customer: body.customer,
        deliveryMode: body.deliveryMode,
        shippingRegion: body.shippingRegion,
        giftWrap: body.giftWrap,
        couponCode: body.couponCode,
        items: body.items,
      });

      if (!outcome.ok) {
        return NextResponse.json(
          { success: false, error: outcome.error },
          { status: outcome.status }
        );
      }

      if (outcome.data.hasPriceOnRequest || outcome.data.grandTotal <= 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              'One or more items require a custom price quote and cannot be paid directly online. Please submit a Custom Studio quote instead.',
          },
          { status: 400 }
        );
      }

      payableAmount = outcome.data.grandTotal;
      pricingSummary = {
        subtotal: outcome.data.calculatedSubtotal,
        discount: outcome.data.discountAmount,
        deliveryFee: outcome.data.deliveryFee,
        deliveryRule: outcome.data.deliveryRule,
        giftWrapFee: outcome.data.giftWrapFee,
        total: outcome.data.grandTotal,
      };
    } else {
      const amount = Number(body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'A valid positive amount is required.' },
          { status: 400 }
        );
      }
      payableAmount = amount;
    }

    const receipt =
      typeof body?.receipt === 'string' && body.receipt.trim()
        ? body.receipt.trim()
        : `rcpt_${Date.now()}`;
    const notes =
      body?.notes && typeof body.notes === 'object'
        ? (body.notes as Record<string, string>)
        : {};

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (
      !keyId ||
      !keySecret ||
      keyId.includes('yourkey') ||
      keySecret.includes('your_secret')
    ) {
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.ALLOW_DEV_MOCK_RAZORPAY === 'true'
      ) {
        const mockOrderId = `order_mock_${Date.now()}`;
        return NextResponse.json({
          success: true,
          orderId: mockOrderId,
          amount: Math.round(payableAmount * 100),
          currency: 'INR',
          keyId: 'rzp_test_simulated',
          isMock: true,
          pricing: pricingSummary,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'Razorpay keys are not configured yet on this server. Add live/test NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to process online payments.',
        },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(payableAmount * 100),
      currency: 'INR',
      receipt,
      notes,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      isMock: false,
      pricing: pricingSummary,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
