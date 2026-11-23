'use client';

import React, { useState } from 'react';
import { X, MessageCircle, User, Phone, MapPin, Building2, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { AdminOrder } from '../lib/database';

export interface OrderInfoData {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  instructions: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-built WhatsApp message text (NOT encoded). Modal appends customer details then opens wa.me */
  waMessageTemplate: string;
  /** Label shown on submit button */
  submitLabel?: string;
  /** Optional callback to create the order in the database */
  onCompleteOrder?: (customerData: OrderInfoData) => Promise<AdminOrder | void> | AdminOrder | void;
}

const ADMIN_WA = '919344013255';

export default function OrderInfoModal({
  isOpen,
  onClose,
  waMessageTemplate,
  submitLabel = 'Send Order on WhatsApp',
  onCompleteOrder,
}: Props) {
  const [form, setForm] = useState<OrderInfoData>({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Partial<OrderInfoData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preparedWaUrl, setPreparedWaUrl] = useState('');
  const [createdOrder, setCreatedOrder] = useState<AdminOrder | null>(null);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      let placed: AdminOrder | null = null;
      if (onCompleteOrder) {
        const res = await onCompleteOrder(form);
        if (res && typeof res === 'object' && 'id' in res) {
          placed = res as AdminOrder;
          setCreatedOrder(placed);
        }
      }

      const orderRefTag = placed?.id ? `\nOrder ID: *#${placed.id}*` : '';
      const customerBlock =
        `\n\n📦 *Delivery Details*${orderRefTag}\n` +
        `Customer Name: *${form.name.trim()}*\n` +
        `Customer Phone: *+91 ${form.phone.trim()}*\n` +
        `Address: ${form.address.trim()}, ${form.city.trim()} - ${form.pincode.trim()}` +
        (form.instructions.trim() ? `\nSpecial Notes: ${form.instructions.trim()}` : '') +
        `\n\n_Payment mode: Chat confirmation with Admin (No website payment)_ 🎀`;

      const fullMessage = waMessageTemplate + customerBlock;
      const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(fullMessage)}`;
      setPreparedWaUrl(url);

      // Successfully saved order - show receipt screen without abruptly forcing open WhatsApp
      setSubmitted(true);
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: '', phone: '', address: '', city: '', pincode: '', instructions: '' });
    setErrors({});
    setCreatedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[#EFE8E1] shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#EFE8E1] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-display font-normal text-xl text-[#1C1917] tracking-tight">Delivery &amp; Order Details</h2>
            <p className="text-xs text-[#78716C] mt-0.5">Recorded directly in Givento Studio Admin</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center text-[#1C1917] hover:text-[#7A1C3B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* Order Confirmed Success Screen */
          <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDF0F3] text-[#7A1C3B] border border-[#FADDE3] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#FDF0F3] text-[#7A1C3B] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#FADDE3]">
                Order Placed Successfully
              </span>
              <h3 className="font-display font-normal text-2xl text-[#1C1917] mb-1">
                Thank You, {form.name.trim()}! 🌸
              </h3>
              {createdOrder?.id && (
                <div className="inline-block px-3.5 py-1 bg-[#FAF7F2] border border-[#EFE8E1] rounded-full text-xs font-mono font-bold text-[#7A1C3B] mb-2">
                  Order ID: #{createdOrder.id}
                </div>
              )}
              <p className="text-xs text-[#78716C] max-w-sm mx-auto leading-relaxed">
                Your handcrafted order has been recorded in our workshop system.
              </p>
            </div>

            {/* Ordered Items Preview */}
            {createdOrder && createdOrder.items && createdOrder.items.length > 0 && (
              <div className="w-full text-left bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                  Ordered Products ({createdOrder.items.length}):
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {createdOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs bg-white p-2 rounded-xl border border-[#EFE8E1]">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-[#FAF7F2] border border-[#EFE8E1] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center shrink-0 text-sm">
                          🎁
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#1C1917] truncate">{it.quantity}x {it.productName}</div>
                        {it.price > 0 && (
                          <span className="text-[#7A1C3B] font-mono text-[11px] font-bold">₹{it.price * it.quantity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8E1] text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#EFE8E1]">
                <span className="text-[#8C827A] font-medium">Customer Phone:</span>
                <span className="font-mono font-bold text-[#1C1917]">+91 {form.phone.trim()}</span>
              </div>
              <div className="flex justify-between items-start pb-2 border-b border-[#EFE8E1]">
                <span className="text-[#8C827A] font-medium">Delivery Address:</span>
                <span className="font-medium text-[#1C1917] text-right max-w-[200px]">
                  {form.address.trim()}, {form.city.trim()} - {form.pincode.trim()}
                </span>
              </div>
              <div className="pt-1 flex items-start gap-2 text-[#7A1C3B] bg-[#FDF0F3] p-3 rounded-xl border border-[#FADDE3]">
                <span className="text-sm">💬</span>
                <p className="text-[11px] leading-relaxed">
                  <strong>What happens next:</strong> Our studio admin will review your order and send your official confirmation and itemized bill directly to your WhatsApp at <strong>+91 {form.phone.trim()}</strong>!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2 pt-2">
              <a
                href={createdOrder ? `/order/${createdOrder.id}` : `/track`}
                className="w-full py-3.5 px-5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <span>View Order Details &amp; Live Tracking</span>
                <span>→</span>
              </a>

              {preparedWaUrl && (
                <a
                  href={preparedWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                  <span>Optional: Chat with Admin on WhatsApp</span>
                </a>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Informational banner */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl text-xs text-[#6A5B60] flex items-start gap-2.5">
              <span className="text-base leading-none">🌸</span>
              <div>
                <strong className="text-[#1C1917] block font-semibold">No Online Payment on Website</strong>
                <span>All product details and your image link will be sent to admin WhatsApp. Admin confirms your order and shares payment info on chat.</span>
              </div>
            </div>

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
                className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${errors.name ? 'border-[#B3261E] focus:border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'}`}
              />
              {errors.name && <p className="text-[11px] text-[#B3261E]">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                <Phone className="w-3.5 h-3.5 text-[#7A1C3B]" />
                Customer WhatsApp Number <span className="text-[#B3261E]">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-[#FAF7F2] border border-r-0 border-[#EFE8E1] rounded-l-xl text-xs font-semibold text-[#6A5B60]">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="9876543210"
                  className={`flex-1 px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-r-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${errors.phone ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'}`}
                />
              </div>
              <p className="text-[10px] text-[#8C827A]">Courier tracking details will reach this WhatsApp number automatically.</p>
              {errors.phone && <p className="text-[11px] text-[#B3261E]">{errors.phone}</p>}
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
                className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition resize-none ${errors.address ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'}`}
              />
              {errors.address && <p className="text-[11px] text-[#B3261E]">{errors.address}</p>}
            </div>

            {/* City + Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]">
                  <Building2 className="w-3.5 h-3.5 text-[#7A1C3B]" />
                  City <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Chennai"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${errors.city ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'}`}
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
                  onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
                  placeholder="600001"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none transition ${errors.pincode ? 'border-[#B3261E]' : 'border-[#EFE8E1] focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20'}`}
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
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20 transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'Recording order...' : submitLabel}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
