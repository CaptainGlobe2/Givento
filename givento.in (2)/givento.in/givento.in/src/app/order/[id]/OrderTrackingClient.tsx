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
  MessageCircle,
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
      const orders = await db.getOrders();
      const found = orders.find((o) => o.id === orderId);
      if (found) {
        setOrder(found);
      } else {
        // Fallback simulated order for preview
        setOrder({
          id: orderId,
          customerName: 'Valued Customer',
          customerPhone: '9840012345',
          address: 'Main Street / Studio Handover',
          city: 'Adirampattinam',
          state: 'Tamil Nadu',
          pincode: '614701',
          status: 'Pending WhatsApp Confirmation',
          paymentMethod: 'whatsapp',
          paymentStatus: 'Pending',
          subtotal: 799,
          giftWrap: true,
          giftNote: 'Happy Birthday! Handcrafted with lots of love ✨',
          deliveryFee: 0,
          deliveryRule: 'Adirampattinam Express Local Delivery',
          total: 848,
          items: [
            {
              productName: 'Handcrafted Bouquet & Keepsake Parcel',
              quantity: 1,
              price: 799,
            },
          ],
          createdAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center">
        <div className="font-serif text-xl text-[#7a1c3b]">
          Checking parcel tracking status... ✨
        </div>
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
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#F6E9EE] selection:text-[#7A1C3B] font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10 w-full">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1C3B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Givento.in Home</span>
          </Link>
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
              <h1 className="font-display font-normal text-2xl sm:text-3xl md:text-4xl text-[#1C1917] tracking-tight">
                Order Tracking #{order.id}
              </h1>
              <p className="font-sans text-xs text-[#78716C] mt-1">
                Customer: <strong>{order.customerName}</strong> (+91 {order.customerPhone})
              </p>
            </div>

            <a
              href={`https://wa.me/919344013255?text=Hello%20Givento!%20Checking%20in%20on%20my%20order%20%23${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#F8EED6]" />
              <span>Message Maker on WhatsApp</span>
            </a>
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
              <h2 className="font-serif text-base text-[#1c1917]">
                Order Fulfillment Progress:
              </h2>

              <div className="relative pl-7 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e7e5e4]">
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
                            ? 'bg-[#7a1c3b] text-white border-[#7a1c3b]'
                            : 'bg-white text-[#a8a29e] border-[#e7e5e4]'
                        } ${isCurrent ? 'ring-4 ring-[#f8eed6]' : ''}`}
                      >
                        <IconComponent className="w-3 h-3" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-serif text-sm font-semibold ${
                              isCompleted ? 'text-[#1c1917]' : 'text-[#a8a29e]'
                            }`}
                          >
                            {st.label}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#f8eed6] border border-[#b98a2e]/30 rounded text-[10px] font-semibold text-[#7a1c3b]">
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-[#78716c]">{st.desc}</p>
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
                  <div className="font-mono text-sm font-bold text-[#1c1917]">
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
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
                >
                  <span>Track Live on Courier Portal</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          )}

          {/* Items & Shipping Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#f5f5f4] text-xs font-sans">
            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm text-[#1c1917]">
                Ordered Parcel Items:
              </h3>
              <div className="space-y-2.5">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#faf7f2] rounded-xl border border-[#e7e5e4] flex items-center gap-3"
                  >
                    {/* Item Thumbnail */}
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-[#e7e5e4] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white border border-[#e7e5e4] flex items-center justify-center text-lg shrink-0">
                        🎁
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1c1917] truncate">
                        {it.quantity}x {it.productName}
                      </div>
                      {it.variants && Object.keys(it.variants).length > 0 && (
                        <div className="text-[10px] text-[#78716c] truncate">
                          {Object.entries(it.variants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                      {it.personalisation && (
                        <div className="text-[10px] text-[#78716c] mt-0.5 space-y-0.5">
                          {Object.entries(it.personalisation).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <strong>{k}:</strong> {v}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="font-mono font-bold text-sm text-[#7a1c3b] tabular-nums shrink-0">
                      {it.price > 0 ? `₹${it.price * it.quantity}` : 'ask us'}
                    </span>
                  </div>
                ))}
              </div>

              {order.giftNote && (
                <div className="p-3 bg-[#f8eed6]/40 border border-[#b98a2e]/30 rounded-lg text-xs text-[#7a1c3b]">
                  <strong>Card Note:</strong> &ldquo;{order.giftNote}&rdquo;
                </div>
              )}
            </div>

            {/* Delivery & Total Details */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm text-[#1c1917]">
                Delivery &amp; Payment Summary:
              </h3>
              <div className="p-3 bg-[#faf7f2] rounded-lg border border-[#e7e5e4] space-y-2 text-xs">
                <div>
                  <span className="text-[#a8a29e] uppercase font-semibold text-[10px]">Destination Address:</span>
                  <div className="font-medium text-[#1c1917] mt-0.5">{order.address}</div>
                  <div className="text-[#78716c]">{order.city}, {order.state} - {order.pincode}</div>
                </div>

                <div className="pt-2 border-t border-[#e7e5e4]">
                  <span className="text-[#a8a29e] uppercase font-semibold text-[10px]">Method:</span>
                  <div className="font-medium text-[#1c1917]">{order.deliveryRule || 'Standard Delivery'}</div>
                </div>

                <div className="pt-2 border-t border-[#e7e5e4] flex justify-between items-center">
                  <span className="text-xs text-[#78716c]">Order Bill:</span>
                  <span className="font-serif text-lg font-bold text-[#7a1c3b] tabular-nums">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#e7e5e4] rounded-lg text-[11px] text-[#78716c] flex items-center gap-2">
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
