'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Incorrect password. Please try again.');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans flex flex-col justify-center items-center p-4 selection:bg-[#F6E9EE] selection:text-[#7A1C3B]">
      {/* Back to site */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Givento.in Store</span>
        </Link>
      </div>

      <div className="relative bg-white border border-[#EFE8E1] rounded-3xl p-8 max-w-sm w-full shadow-lg overflow-hidden">
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-16 h-16 rounded-2xl border border-[#EFE8E1] shadow-2xs overflow-hidden bg-[#FAF7F2] mx-auto p-1">
            <Image
              src="/images/givento-logo.png"
              alt="Givento.in Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-xl"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] font-semibold uppercase tracking-wider text-[#8C827A]">
            <Sparkles className="w-3 h-3 text-[#7A1C3B]" />
            <span>Studio Admin</span>
          </div>

          <h1 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
            Studio Sign In
          </h1>
          <p className="font-sans text-xs text-[#78716C] leading-relaxed">
            Enter your boutique studio password to manage orders, catalog, inventory, and tracking.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-xs font-semibold text-[#1C1917]">
              Master Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter studio password"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#EFE8E1] focus:border-[#7A1C3B] focus:bg-white focus:ring-2 focus:ring-[#7A1C3B]/20 rounded-xl text-sm text-[#1C1917] focus:outline-none transition placeholder:text-[#A89F91]"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium pt-1">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full py-3 bg-[#7A1C3B] hover:bg-[#5A1230] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>{isSubmitting ? 'Verifying...' : 'Enter Studio Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#EFE8E1] text-center">
          <span className="text-[11px] text-[#8C827A]">
            Protected area for Givento Studio Admin
          </span>
        </div>
      </div>
    </div>
  );
}
