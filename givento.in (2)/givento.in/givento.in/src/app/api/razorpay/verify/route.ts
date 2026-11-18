import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    // Handle mock verification
    if (isMock || razorpay_order_id?.startsWith('order_mock_')) {
      return NextResponse.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
        message: 'Mock payment verified successfully',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: 'Razorpay secret key not configured' },
        { status: 500 }
      );
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isMatch = generatedSignature === razorpay_signature;

    if (isMatch) {
      return NextResponse.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        { success: false, verified: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
