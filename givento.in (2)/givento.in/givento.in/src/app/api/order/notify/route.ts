import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Format email confirmation log / mock
    console.log(`[Order Confirmation] Order #${orderData.id} placed by ${orderData.customerName} (${orderData.customerPhone})`);
    console.log(`[Notification Email Dispatched] To: ${orderData.customerEmail || 'no-email@givento.in'} and studio: orders@givento.in`);

    return NextResponse.json({
      success: true,
      message: 'Order confirmation logged and dispatched',
      orderId: orderData.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Notification error' },
      { status: 500 }
    );
  }
}
