'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { db, AdminOrder } from '../../../lib/database';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Heart,
  ArrowLeft,
  Sparkles,
  Gift,
  ShieldCheck,
} from 'lucide-react';

export default function OrderTrackingClient({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(paramsPromise);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const found = await db.getOrderById(orderId);
      if (found) {
        setOrder(found);
      } else {
        setOrder(null);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="font-display font-normal text-xl text-[#7A1C3B]">
          Checking parcel tracking status... ✨
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-28">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#FDF0F3] text-[#7A1C3B] border border-[#FADDE3] flex items-center justify-center text-2xl mb-4">
            📦
          </div>
          <h1 className="font-display font-normal text-2xl sm:text-3xl text-[#1C1917] mb-2">
            Order Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-sm mb-6 leading-relaxed">
            We couldn&apos;t find an order matching <span className="font-mono font-bold text-[#1C1917] break-all">#{orderId}</span>. Please verify your order number or search with your mobile number.
          </p>
          <div className="w-full space-y-2.5">
            <Link
              href="/track"
              className="w-full py-3.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:scale-95 transition"
            >
              <span>Search by WhatsApp Phone / Order ID</span>
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-white border border-[#EFE8E1] hover:bg-[#FAF7F2] text-[#1C1917] rounded-xl font-semibold text-xs flex items-center justify-center active:scale-95 transition"
            >
              Back to Storefront
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: 'Pending WhatsApp Confirmation', label: 'Order Placed', desc: 'Awaiting WhatsApp verification & UPI QR', icon: Clock },
    { key: 'Received', label: 'Order Confirmed', desc: 'Confirmed by studio artisan', icon: CheckCircle2 },
    { key: 'Crafting', label: 'On Workshop Desk', desc: 'Craft being hand-assembled & cured', icon: Sparkles },
    { key: 'Packed', label: 'Packed & Sealed', desc: 'Wrapped in boutique gift packaging', icon: Package },
    { key: 'Dispatched', label: 'Dispatched with Courier', desc: 'In transit to your destination', icon: Truck },
    { key: 'Delivered', label: 'Delivered With Love', desc: 'Safely arrived at your hands', icon: Heart },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending WhatsApp Confirmation':
        return 0;
      case 'Received':
        return 1;
      case 'Crafting':
      case 'Making':
        return 2;
      case 'Packed & Sealed':
      case 'Packed':
        return 3;
      case 'Dispatched':
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#F6E9EE] selection:text-[#7A1C3B] font-sans pb-28">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10 w-full">
        {/* Back to Orders Link */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EFE8E1] hover:border-[#7A1C3B] text-xs font-semibold text-[#7A1C3B] shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <span className="text-[#D5CCC3]">/</span>
          <span className="text-xs text-[#8C827A]">Order #{order.id}</span>
        </div>

        {/* Tracking Card */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE8E1]">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                isCancelled
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-[#F3ECE2] border border-[#E5DACD] text-[#7A1C3B]'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {order.status}</span>
              </div>
              <h1 className="font-display font-normal text-2xl sm:text-3xl md:text-4xl text-[#1C1917] tracking-tight break-words">
                Order Tracking #{order.id}
              </h1>
              <p className="font-sans text-xs text-[#78716C] mt-1">
                Customer: <strong>{order.customerName}</strong> (+91 {order.customerPhone})
              </p>
            </div>
          </div>

          {/* Cancelled Banner if Order Cancelled */}
          {isCancelled && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
              <span className="text-xl">⚠️</span>
              <div>
                <strong className="text-sm font-bold block">Order Cancelled</strong>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  This order was marked as cancelled. A cancellation update with details was shared to your WhatsApp (+91 {order.customerPhone}). If you have questions or wish to place a replacement order, please message our studio maker.
                </p>
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          {!isCancelled && (
            <div className="space-y-4">
              <h2 className="font-display font-normal text-lg text-[#1C1917]">
                Order Fulfillment Progress:
              </h2>

              <div className="relative pl-7 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFE8E1]">
                {steps.map((st, idx) => {
                  const IconComponent = st.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={st.key} className="relative flex items-start gap-4">
                      {/* Step Icon Node */}
                      <div
                        className={`absolute -left-7 sm:-left-8 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-[#7A1C3B] text-white border-[#7A1C3B]'
                            : 'bg-white text-[#A8A29E] border-[#EFE8E1]'
                        } ${isCurrent ? 'ring-4 ring-[#F8EED6]' : ''}`}
                      >
                        <IconComponent className="w-3 h-3" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-sans text-sm font-semibold ${
                              isCompleted ? 'text-[#1C1917]' : 'text-[#A8A29E]'
                            }`}
                          >
                            {st.label}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#F8EED6] border border-[#B98A2E]/30 rounded text-[10px] font-semibold text-[#7A1C3B]">
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-[#78716C]">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier Tracking Info if Shipped or Tracking Available */}
          {(order.trackingNumber || order.trackingUrl) && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-900 font-sans">
                  Dispatched via {order.trackingCourier || 'Courier Service'} 🚚
                </span>
                {order.trackingNumber && (
                  <div className="font-mono text-sm font-bold text-[#1C1917] break-all">
                    AWB Tracking Number: {order.trackingNumber}
                  </div>
                )}
                <p className="text-[11px] text-emerald-800">
                  Estimated arrival: 2–4 working days. Direct doorstep delivery.
                </p>
              </div>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
                >
                  <span>Track Live on Courier Portal</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          )}

          {/* Items & Shipping Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#EFE8E1] text-xs font-sans">
            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-display font-normal text-base text-[#1C1917]">
                Ordered Parcel Items:
              </h3>
              <div className="space-y-2.5">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8E1] flex items-center gap-3"
                  >
                    {/* Item Thumbnail */}
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-[#EFE8E1] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white border border-[#EFE8E1] flex items-center justify-center text-lg shrink-0">
                        🎁
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1C1917] truncate">
                        {it.quantity}x {it.productName}
                      </div>
                      {it.variants && Object.keys(it.variants).length > 0 && (
                        <div className="text-[10px] text-[#78716C] truncate">
                          {Object.entries(it.variants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                      {it.personalisation && (
                        <div className="text-[10px] text-[#78716C] mt-0.5 space-y-0.5">
                          {Object.entries(it.personalisation).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <strong>{k}:</strong> {v}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="font-mono font-bold text-sm text-[#7A1C3B] tabular-nums shrink-0">
                      {it.price > 0 ? `₹${it.price * it.quantity}` : 'ask us'}
                    </span>
                  </div>
                ))}
              </div>

              {order.giftNote && (
                <div className="p-3 bg-[#F8EED6]/40 border border-[#B98A2E]/30 rounded-xl text-xs text-[#7A1C3B]">
                  <strong>Card Note:</strong> &ldquo;{order.giftNote}&rdquo;
                </div>
              )}
            </div>

            {/* Delivery & Total Details */}
            <div className="space-y-3">
              <h3 className="font-display font-normal text-base text-[#1C1917]">
                Delivery &amp; Payment Summary:
              </h3>
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] space-y-2.5 text-xs">
                <div>
                  <span className="text-[#8C827A] uppercase font-semibold text-[10px]">Destination Address:</span>
                  <div className="font-medium text-[#1C1917] mt-0.5">{order.address}</div>
                  <div className="text-[#78716C]">{order.city}, {order.state} - {order.pincode}</div>
                </div>

                <div className="pt-2 border-t border-[#EFE8E1]">
                  <span className="text-[#8C827A] uppercase font-semibold text-[10px]">Method:</span>
                  <div className="font-medium text-[#1C1917]">{order.deliveryRule || 'Standard Delivery'}</div>
                </div>

                <div className="pt-2 border-t border-[#EFE8E1] flex justify-between items-center">
                  <span className="text-xs text-[#78716C]">Order Bill:</span>
                  <span className="font-display font-normal text-2xl text-[#7A1C3B] tabular-nums">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#EFE8E1] rounded-xl text-[11px] text-[#78716C] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Givento Studio Guarantee: Direct confirmation on WhatsApp.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
