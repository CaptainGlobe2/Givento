import React, { Suspense } from 'react';
import OrderTrackingClient from './OrderTrackingClient';

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF7F4] flex items-center justify-center font-heading text-lg text-[#7A1C30]">
          Checking parcel tracking... ✨
        </div>
      }
    >
      <OrderTrackingClient paramsPromise={params} />
    </Suspense>
  );
}
