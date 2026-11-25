'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, AdminOrder } from '../../lib/database';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Package,
  Search,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Sparkles,
  Truck,
  Heart,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

export default function OrdersTrackPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search lookup state
  const [searchId, setSearchId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showLookupBox, setShowLookupBox] = useState(false);

  // Load orders for this customer / device
  useEffect(() => {
    let active = true;
    db.getUserOrders()
      .then((userOrders) => {
        if (active) setOrders(userOrders);
      })
      .catch((err) => {
        console.error('Failed to load user orders', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setIsSearching(true);

    const cleanId = searchId.trim().toUpperCase().replace(/^#/, '');
    const cleanPhone = searchPhone.replace(/\D/g, '');

    if (!cleanId && !cleanPhone) {
      setSearchError('Please enter an Order Number or Mobile Number.');
      setIsSearching(false);
      return;
    }

    try {
      let found: AdminOrder | null = null;
      if (cleanId) {
        found = await db.getOrderById(cleanId);
      }

      if (!found) {
        const all = await db.getOrders();
        found = all.find((o) => {
          const matchId =
            cleanId &&
            (o.id.toUpperCase() === cleanId ||
              o.id.toUpperCase() === `GVN-${cleanId}` ||
              o.id.toUpperCase().replace(/^GVN-/, '') === cleanId.replace(/^GVN-/, ''));
          const matchPhone = cleanPhone && o.customerPhone.replace(/\D/g, '').includes(cleanPhone);
          if (cleanId && cleanPhone) return matchId && matchPhone;
          return matchId || matchPhone;
        }) || null;
      }

      if (found) {
        // Add to orders list at the top if not already present
        setOrders((prev) => {
          if (prev.some((o) => o.id === found!.id)) {
            return prev.map((o) => (o.id === found!.id ? found! : o));
          }
          return [found!, ...prev];
        });
        setSearchId('');
        setSearchPhone('');
        setShowLookupBox(false);
      } else {
        setSearchError(
          `No order found matching ${cleanId ? '#' + cleanId : ''} ${cleanPhone ? 'phone: ' + cleanPhone : ''}. Please verify the order number or WhatsApp mobile number.`
        );
      }
    } catch {
      setSearchError('Error searching orders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending WhatsApp Confirmation':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pending Confirmation',
          icon: Clock,
        };
      case 'Received':
      case 'Order Confirmed':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          dot: 'bg-blue-600',
          label: 'Order Confirmed',
          icon: CheckCircle2,
        };
      case 'Crafting':
      case 'Making':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-200',
          dot: 'bg-purple-600',
          label: 'On Workshop Desk',
          icon: Sparkles,
        };
      case 'Packed':
      case 'Packed & Sealed':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          dot: 'bg-indigo-600',
          label: 'Packed & Sealed',
          icon: Package,
        };
      case 'Dispatched':
      case 'Shipped':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Dispatched with Courier',
          icon: Truck,
        };
      case 'Delivered':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-200',
          dot: 'bg-teal-600',
          label: 'Delivered with Love',
          icon: Heart,
        };
      default:
        return {
          bg: 'bg-[#F6E9EE] text-[#7A1C3B] border-[#FADDE3]',
          dot: 'bg-[#7A1C3B]',
          label: status,
          icon: Package,
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans selection:bg-[#F6E9EE] selection:text-[#7A1C3B] pb-28">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1C3B] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </Link>
              <span className="text-[#D5CCC3]">/</span>
              <span className="text-xs text-[#8C827A]">Orders &amp; Tracking</span>
            </div>
            <h1 className="font-heading font-medium text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-[#78716C] mt-0.5">
              Complete details, tracking IDs, item breakdown, and live workshop status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLookupBox(!showLookupBox)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#EFE8E1] hover:border-[#7A1C3B] text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>{showLookupBox ? 'Hide Lookup' : 'Search by Phone / ID'}</span>
            </button>
          </div>
        </div>

        {/* Optional Search / Lookup Box */}
        {showLookupBox && (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-normal text-base text-[#1C1917]">
                  Lookup Order from Another Phone / Device
                </h3>
                <p className="text-xs text-[#8C827A]">
                  Enter your Order Number or WhatsApp Mobile Number.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                    Order Number (Tracking ID)
                  </label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="e.g. GVN-849201"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#7A1C3B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                    WhatsApp Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="e.g. 9344013255"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7A1C3B]"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl text-xs font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Searching...' : 'Find Order'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#EFE8E1] p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#1C1917]">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <div className="bg-white rounded-3xl border border-[#EFE8E1] p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F6E9EE] text-2xl flex items-center justify-center mx-auto border border-[#FADDE3]">
              📦
            </div>
            <h2 className="font-heading font-normal text-2xl text-[#1C1917]">
              No Orders Placed Yet
            </h2>
            <p className="text-xs text-[#8C827A] max-w-sm mx-auto leading-relaxed">
              When you confirm an order from your bag, all details including products, quantities, prices, tracking ID, and workshop status will appear here.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/category/all"
                className="px-6 py-3 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-full font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition cursor-pointer"
              >
                Explore Collection 🌻
              </Link>
              <button
                type="button"
                onClick={() => setShowLookupBox(true)}
                className="px-5 py-3 bg-white border border-[#EFE8E1] hover:bg-[#FAF7F2] text-[#1C1917] rounded-full font-semibold text-xs sm:text-sm active:scale-95 transition cursor-pointer"
              >
                Track by Mobile Number
              </button>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Placed Orders ({orders.length})
              </span>
              <span className="text-[11px] text-[#8C827A]">
                Sorted by newest first
              </span>
            </div>

            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const BadgeIcon = badge.icon;
              const isCopied = copiedId === order.id;

              return (
                <article
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#EFE8E1] p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#DFD5CB] transition-all"
                >
                  {/* Top Bar: Tracking ID, Date, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE8E1]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#8C827A]">Tracking ID:</span>
                        <span className="font-mono text-sm font-bold text-[#1C1917]">
                          #{order.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(order.id)}
                          title="Copy Tracking ID"
                          className="p-1 rounded-md hover:bg-[#FAF7F2] text-[#8C827A] hover:text-[#7A1C3B] transition cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] text-[#78716C] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#8C827A]" />
                        <span>Order Date: <strong>{formatDate(order.createdAt)}</strong></span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Products List (Every item with Image, Name, Qty, Price Per Item, Total) */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block">
                      Ordered Items ({order.items.length}):
                    </span>

                    <div className="space-y-2.5">
                      {order.items.map((it, idx) => {
                        const itemImage =
                          it.image ||
                          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80';
                        const itemTotal = it.price * it.quantity;

                        return (
                          <div
                            key={idx}
                            className="bg-[#FAF7F2] rounded-2xl p-3 sm:p-3.5 border border-[#EFE8E1] flex items-center gap-3.5"
                          >
                            {/* Product Image */}
                            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-white shrink-0 border border-[#EFE8E1] flex items-center justify-center">
                              <img
                                src={itemImage}
                                alt={it.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="font-heading font-medium text-sm sm:text-base text-[#1C1917] line-clamp-1 leading-snug">
                                {it.productName}
                              </h4>

                              {/* Variants / Personalisation if any */}
                              {it.variants && Object.keys(it.variants).length > 0 && (
                                <p className="text-[11px] text-[#78716C] line-clamp-1">
                                  {Object.entries(it.variants)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' · ')}
                                </p>
                              )}
                              {it.personalisation && Object.keys(it.personalisation).length > 0 && (
                                <p className="text-[10px] text-[#7A1C3B] font-medium line-clamp-1">
                                  {Object.entries(it.personalisation)
                                    .map(([k, v]) => `"${v}"`)
                                    .join(' · ')}
                                </p>
                              )}

                              {/* Quantity and Price per item */}
                              <div className="flex items-center gap-3 text-xs text-[#57534E] pt-0.5">
                                <span className="font-semibold text-[#1C1917]">
                                  Qty: {it.quantity}
                                </span>
                                <span>·</span>
                                <span className="text-[#78716C]">
                                  ₹{it.price.toLocaleString('en-IN')} per item
                                </span>
                              </div>
                            </div>

                            {/* Total Price for this item */}
                            <div className="text-right shrink-0">
                              <div className="font-mono font-bold text-sm sm:text-base text-[#1C1917] tabular-nums">
                                ₹{itemTotal.toLocaleString('en-IN')}
                              </div>
                              <span className="text-[10px] text-[#8C827A]">Item total</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Financial Breakdown & Destination */}
                  <div className="pt-3 border-t border-[#EFE8E1] space-y-3">
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EFE8E1] space-y-2 text-xs">
                      {/* Subtotal, Shipping, Discount, Total */}
                      <div className="flex justify-between items-center text-[#57534E]">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-[#1C1917] tabular-nums">
                          ₹{order.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {Boolean(order.discount && order.discount > 0) && (
                        <div className="flex justify-between items-center text-[#7A1C3B]">
                          <span>Coupon Discount:</span>
                          <span className="font-bold tabular-nums">
                            −₹{(order.discount ?? 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[#57534E]">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold text-[#1C1917] tabular-nums">
                          {order.deliveryFee === 0 ? (
                            <strong className="text-[#7A1C3B]">FREE</strong>
                          ) : (
                            `₹${order.deliveryFee}`
                          )}
                        </span>
                      </div>

                      <div className="h-px bg-[#EFE8E1] my-1" />

                      {/* Total Price */}
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-heading font-medium text-sm sm:text-base text-[#1C1917]">
                          Total Price:
                        </span>
                        <span className="font-display font-bold text-xl sm:text-2xl text-[#7A1C3B] tabular-nums">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Delivery Address */}
                      <div className="pt-2 border-t border-[#EFE8E1] text-[11px] text-[#78716C] space-y-0.5">
                        <div className="font-semibold text-[#1C1917]">
                          Delivery To: {order.customerName} (+91 {order.customerPhone})
                        </div>
                        <div>
                          {order.address}, {order.city} - {order.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1">
                      <Link
                        href={`/order/${order.id}`}
                        className="w-full py-3 px-4 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>View Live Tracking &amp; Fulfillment Timeline</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
