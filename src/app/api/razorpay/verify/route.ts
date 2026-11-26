import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_signature?: unknown;
    };

    const orderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id.trim() : '';
    const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
    const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature.trim() : '';

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Razorpay secret key not configured' },
        { status: 500 }
      );
    }

    const expectedHex = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const providedBuf = Buffer.from(signature, 'hex');

    const isMatch =
      providedBuf.length === expectedBuf.length &&
      expectedBuf.length > 0 &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (isMatch) {
      return NextResponse.json({
        success: true,
        verified: true,
        paymentId,
      });
    }

    return NextResponse.json(
      { success: false, verified: false, message: 'Invalid payment signature' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json(
      { success: false, verified: false, error: msg },
      { status: 500 }
    );
  }
}
