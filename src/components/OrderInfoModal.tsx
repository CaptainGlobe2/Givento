'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Hash,
  FileText,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { AdminOrder } from '../lib/database';
import { type CheckoutItemInput } from '../lib/checkoutPricing';
import { loadRazorpayCheckoutScript } from '../lib/razorpayClient';
import { useAuth } from '../context/AuthContext';
import { ParticleButton } from '@/components/ui/particle-button';

export interface OrderInfoData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  instructions: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  checkoutContext: {
    giftWrap: boolean;
    giftNote: string;
    couponCode?: string;
    items: CheckoutItemInput[];
  };
  onOrderConfirmed: (order: AdminOrder) => void;
}

export default function OrderInfoModal({
  isOpen,
  onClose,
  totalAmount,
  checkoutContext,
  onOrderConfirmed,
}: Props) {
  const { user, displayName, customerEmail, customerPhone } = useAuth();

  const [form, setForm] = useState<OrderInfoData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Partial<OrderInfoData>>({});
  const [paymentError, setPaymentError] = useState('');
  const [statusLabel, setStatusLabel] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<AdminOrder | null>(null);
  const [paymentId, setPaymentId] = useState('');

  // Auto-prefill customer details from logged-in account when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;
    Promise.resolve().then(() => {
      setForm((prev) => ({
        ...prev,
        name: prev.name || (displayName && displayName !== 'Guest' ? displayName : ''),
        phone: prev.phone || customerPhone,
        email: prev.email || customerEmail,
      }));
    });
  }, [isOpen, user, displayName, customerPhone, customerEmail]);

  const validate = (): boolean => {
    const e: Partial<OrderInfoData> = {};
    if (!form.name.trim()) e.name = 'Your name is required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildOrderItemsPayload = () =>
    checkoutContext.items.map((it) => ({
      ...it,
      personalisationData: {
        ...(it.personalisationData || {}),
        ...(form.instructions.trim() ? { 'Special Notes': form.instructions.trim() } : {}),
      },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    if (!validate()) return;
    setIsSubmitting(true);
    setStatusLabel('Preparing secure Razorpay checkout...');

    const customerPayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
    };
    const itemsPayload = buildOrderItemsPayload();

    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerPayload,
          giftWrap: checkoutContext.giftWrap,
          couponCode: checkoutContext.couponCode,
          items: itemsPayload,
          receipt: `gvn_${Date.now()}`,
        }),
      });

      const rzpOrderData = (await orderRes.json()) as {
        success?: boolean;
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        pricing?: {
          total: number;
          deliveryFee: number;
          deliveryRule: string;
        };
      };

      if (!orderRes.ok || !rzpOrderData.success || !rzpOrderData.orderId || !rzpOrderData.keyId) {
        setPaymentError(
          rzpOrderData.error || 'Could not initialize Razorpay checkout. Please try again.'
        );
        setIsSubmitting(false);
        setStatusLabel('');
        return;
      }

      const sdkLoaded = await loadRazorpayCheckoutScript();
      if (!sdkLoaded || !window.Razorpay) {
        setPaymentError('Unable to load Razorpay payment window. Check your connection and retry.');
        setIsSubmitting(false);
        setStatusLabel('');
        return;
      }

      setStatusLabel('Waiting for Razorpay payment completion...');

      const rzp = new window.Razorpay({
        key: rzpOrderData.keyId,
        amount: rzpOrderData.amount || Math.round(totalAmount * 100),
        currency: rzpOrderData.currency || 'INR',
        name: 'Givento.in',
        description: 'Handcrafted Gifts & Keepsakes',
        order_id: rzpOrderData.orderId,
        prefill: {
          name: customerPayload.name,
          email: customerPayload.email,
          contact: `+91${customerPayload.phone}`,
        },
        notes: {
          city: customerPayload.city,
          pincode: customerPayload.pincode,
        },
        theme: {
          color: '#7A1C3B',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setStatusLabel('');
            setPaymentError('Payment window closed. Your bag items are safe — click Pay to retry.');
          },
        },
        handler: async (rzpResponse) => {
          setStatusLabel('Verifying Razorpay payment signature...');
          try {
            const createRes = await fetch('/api/order/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: customerPayload,
                giftWrap: checkoutContext.giftWrap,
                giftNote: checkoutContext.giftNote,
                couponCode: checkoutContext.couponCode,
                channel: 'website',
                paymentMethod: 'razorpay',
                razorpayPayment: rzpResponse,
                items: itemsPayload,
              }),
            });

            const createData = (await createRes.json()) as {
              success?: boolean;
              error?: string;
              order?: AdminOrder;
              razorpayPaymentId?: string;
            };

            if (!createRes.ok || !createData.success || !createData.order) {
              setPaymentError(
                createData.error ||
                  `Payment verified (${rzpResponse.razorpay_payment_id}) but order creation failed. Contact support with this payment ID.`
              );
              setIsSubmitting(false);
              setStatusLabel('');
              return;
            }

            setPaymentId(createData.razorpayPaymentId || rzpResponse.razorpay_payment_id);
            setCreatedOrder(createData.order);
            onOrderConfirmed(createData.order);
            setSubmitted(true);
            setIsSubmitting(false);
            setStatusLabel('');
          } catch {
            setPaymentError(
              `Network error recording verified payment (${rzpResponse.razorpay_payment_id}). Please contact studio support.`
            );
            setIsSubmitting(false);
            setStatusLabel('');
          }
        },
      });

      rzp.on('payment.failed', (failure) => {
        setIsSubmitting(false);
        setStatusLabel('');
        setPaymentError(failure?.error?.description || 'Razorpay payment failed. Please try another method.');
      });

      rzp.open();
    } catch {
      setPaymentError('Network connection error starting Razorpay checkout. Please try again.');
      setIsSubmitting(false);
      setStatusLabel('');
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setPaymentError('');
    setStatusLabel('');
    setErrors({});
    setCreatedOrder(null);
    setPaymentId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[#EFE8E1] shadow-2xl max-h-[92dvh] overflow-y-auto safe-bottom"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#EFE8E1] px-4 sm:px-6 py-4 flex items-center justify-between gap-3 rounded-t-3xl z-10">
              <div className="min-w-0">
                <h2 className="font-display font-normal text-xl text-[#1C1917] tracking-tight">
                  {submitted ? 'Payment Confirmed' : 'Delivery & Razorpay Checkout'}
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {submitted
                    ? 'Online payment verified securely'
                    : 'Enter delivery details to pay securely with Razorpay'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="shrink-0 w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              /* Razorpay Payment Success Receipt Screen */
              <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                    Paid Online via Razorpay
                  </span>
                  <h3 className="font-display font-normal text-2xl text-[#1C1917] mb-1">
                    Thank You, {form.name.trim()}!
                  </h3>
                  {createdOrder?.id && (
                    <div className="inline-block px-3.5 py-1 bg-[#FAF7F2] border border-[#EFE8E1] rounded-full text-xs font-mono font-bold text-[#7A1C3B] mb-1.5">
                      Order ID: #{createdOrder.id}
                    </div>
                  )}
                  {paymentId && (
                    <p className="text-[11px] font-mono text-[#78716C]">
                      Razorpay Ref: {paymentId}
                    </p>
                  )}
                </div>

                {/* Ordered Items Preview */}
                {createdOrder && createdOrder.items && createdOrder.items.length > 0 && (
                  <div className="w-full text-left bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] p-3.5 space-y-2">
                    <div className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                      Paid Items ({createdOrder.items.length}):
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {createdOrder.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 text-xs bg-white p-2 rounded-xl border border-[#EFE8E1]"
                        >
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.productName}
                              className="w-10 h-10 rounded-lg object-cover bg-[#FAF7F2] border border-[#EFE8E1] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center shrink-0 text-sm">
                              🎁
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[#1C1917] truncate">
                              {it.quantity}x {it.productName}
                            </div>
                            {it.price > 0 && (
                              <span className="text-[#7A1C3B] font-mono text-[11px] font-bold">
                                ₹{it.price * it.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] text-left text-xs space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EFE8E1]">
                    <span className="text-[#8C827A] font-medium">Total Paid:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹{(createdOrder?.total ?? totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#8C827A] font-medium">Delivery Address:</span>
                    <span className="font-medium text-[#1C1917] text-right max-w-[200px]">
                      {form.address.trim()}, {form.city.trim()} - {form.pincode.trim()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-2 pt-1">
                  <Link
                    href="/track"
                    onClick={handleClose}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <span>Track My Order Live</span>
                    <span>→</span>
                  </Link>

                  {createdOrder?.id && (
                    <Link
                      href={`/order/${createdOrder.id}`}
                      onClick={handleClose}
                      className="w-full py-2.5 px-4 rounded-xl border border-[#7A1C3B]/20 bg-[#FAF7F2] hover:bg-[#F6E9EE] text-[#7A1C3B] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>View Receipt (#{createdOrder.id})</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl border border-[#EFE8E1] text-[#6A5B60] hover:text-[#1C1917] hover:bg-[#FAF7F2] font-medium text-xs cursor-pointer transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5">
                {/* Razorpay Security Banner */}
                <div className="p-3 bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl text-xs text-[#57534E] flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#7A1C3B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <strong className="text-[#1C1917] block font-semibold">
                      Razorpay Instant Checkout
                    </strong>
                    <span>Pay via UPI, GPay, PhonePe, Credit/Debit Card or NetBanking.</span>
                  </div>
                </div>

                {/* Customer Session Indicator / Quick Sign In */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FDF6F8] border border-[#FADDE3] text-[11px]">
                  {user ? (
                    <span className="text-[#1C1917] truncate">
                      Signed in as <strong>{displayName}</strong> ({customerEmail})
                    </span>
                  ) : (
                    <>
                      <span className="text-[#6A5B60]">Have a Givento account?</span>
                      <Link
                        href="/login?redirect=/cart"
                        onClick={onClose}
                        className="font-bold text-[#7A1C3B] hover:underline shrink-0"
                      >
                        Sign In to Autofill →
                      </Link>
                    </>
                  )}
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B3261E] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                    <User className="w-3.5 h-3.5 text-[#7A1C3B]" />
                    Full Name <span className="text-[#B3261E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${
                      errors.name
                        ? 'border-[#B3261E]'
                        : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-[#B3261E]">{errors.name}</p>}
                </div>

                {/* Phone + Optional Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                      <Phone className="w-3.5 h-3.5 text-[#7A1C3B]" />
                      WhatsApp Phone <span className="text-[#B3261E]">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 bg-[#FAF7F2] border border-r-0 border-[#EFE8E1] rounded-l-xl text-xs font-semibold text-[#6A5B60]">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))
                        }
                        placeholder="9876543210"
                        className={`flex-1 min-w-0 px-3 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-r-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${
                          errors.phone
                            ? 'border-[#B3261E]'
                            : 'border-[#EFE8E1] focus:border-[#7A1C3B]'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-[#B3261E]">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                      <Mail className="w-3.5 h-3.5 text-[#7A1C3B]" />
                      Receipt Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                    <MapPin className="w-3.5 h-3.5 text-[#7A1C3B]" />
                    Delivery Address <span className="text-[#B3261E]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="House / Flat No., Street, Landmark"
                    className={`w-full px-3.5 py-2 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition resize-none ${
                      errors.address ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B]'
                    }`}
                  />
                  {errors.address && <p className="text-[11px] text-[#B3261E]">{errors.address}</p>}
                </div>

                {/* City + Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                      <Building2 className="w-3.5 h-3.5 text-[#7A1C3B]" />
                      City / State <span className="text-[#B3261E]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${
                        errors.city ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B]'
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-[#B3261E]">{errors.city}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                      <Hash className="w-3.5 h-3.5 text-[#7A1C3B]" />
                      Pincode <span className="text-[#B3261E]">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))
                      }
                      placeholder="600001"
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${
                        errors.pincode ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B]'
                      }`}
                    />
                    {errors.pincode && <p className="text-[11px] text-[#B3261E]">{errors.pincode}</p>}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                    <FileText className="w-3.5 h-3.5 text-[#7A1C3B]" />
                    Special Instructions <span className="text-xs font-normal text-[#8C827A]">(Optional)</span>
                  </label>
                  <textarea
                    rows={1}
                    value={form.instructions}
                    onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                    placeholder="Delivery notes, colour preferences, etc."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] resize-none"
                  />
                </div>

                {statusLabel && (
                  <p className="text-[11px] text-center font-medium text-[#7A1C3B] animate-pulse">
                    {statusLabel}
                  </p>
                )}

                {/* Razorpay Checkout Submit Button */}
                <ParticleButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-auto py-3.5 px-5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Opening Razorpay...'
                      : `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`}
                  </span>
                </ParticleButton>

                <p className="text-[10px] text-center text-[#8C827A] flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Server-verified amount &amp; 256-bit Razorpay encryption</span>
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
