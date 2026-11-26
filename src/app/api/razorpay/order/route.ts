import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount?: unknown;
      receipt?: unknown;
      notes?: unknown;
    };

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid positive amount is required.' },
        { status: 400 }
      );
    }

    const receipt = typeof body?.receipt === 'string' && body.receipt.trim()
      ? body.receipt.trim()
      : `rcpt_${Date.now()}`;
    const notes = body?.notes && typeof body.notes === 'object' ? (body.notes as Record<string, string>) : {};

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('yourkey')) {
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_MOCK_RAZORPAY === 'true') {
        const mockOrderId = `order_mock_${Date.now()}`;
        return NextResponse.json({
          success: true,
          orderId: mockOrderId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          keyId: 'rzp_test_simulated',
          isMock: true,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Payment gateway is not configured on this server.' },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
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
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
