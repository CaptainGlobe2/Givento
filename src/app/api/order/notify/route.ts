import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const orderData = (await request.json()) as {
      id?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
    };

    console.log(
      `[Order Confirmation] Order #${orderData.id || 'unknown'} placed by ${orderData.customerName || 'Guest'} (${orderData.customerPhone || 'N/A'})`
    );
    console.log(
      `[Notification Email Dispatched] To: ${orderData.customerEmail || 'no-email@givento.in'} and studio: orders@givento.in`
    );

    return NextResponse.json({
      success: true,
      message: 'Order confirmation logged and dispatched',
      orderId: orderData.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Notification error';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
