import React, { Suspense } from 'react';
import OrderTrackingClient from './OrderTrackingClient';

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-display text-xl text-[#7A1C3B]">
          Checking parcel tracking... ✨
        </div>
      }
    >
      <OrderTrackingClient paramsPromise={params} />
    </Suspense>
  );
}
