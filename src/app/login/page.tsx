'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [safeRedirect, setSafeRedirect] = useState('/');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('redirect');
    if (param && param.startsWith('/') && !param.startsWith('//')) {
      Promise.resolve().then(() => setSafeRedirect(param));
    }
  }, []);

  const { user, isConfigured, displayName, customerPhone, customerEmail, signIn, signUp, signOut } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone.trim())) {
        setErrorMsg('Please enter a valid 10-digit Indian WhatsApp/mobile number.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        router.push(safeRedirect);
      } else {
        const res = await signUp({ fullName, phone, email, password });
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        if (res.needsEmailVerification) {
          setInfoMsg(
            'Account created! Please check your email inbox and click the verification link, then sign in here.'
          );
          setMode('login');
          setPassword('');
          return;
        }
        router.push(safeRedirect);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] font-sans pb-24">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:text-[#7A1C3B] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {user ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-3.5 border-b border-[#F3ECE2] pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7A1C3B] text-white font-display text-xl flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Customer Signed In</span>
              </span>
              <h1 className="font-heading text-xl text-[#1C1917] truncate mt-0.5">{displayName}</h1>
              <p className="text-xs text-[#78716C] truncate">{customerEmail}</p>
              {customerPhone && <p className="text-[11px] text-[#8C827A]">+91 {customerPhone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <Link
              href="/cart"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#7A1C3B] text-white font-semibold hover:bg-[#5A1230] transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Go to Cart</span>
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] font-semibold hover:border-[#7A1C3B] transition"
            >
              <Package className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>My Orders</span>
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] font-semibold hover:border-[#7A1C3B] transition"
            >
              <Heart className="w-3.5 h-3.5 text-[#E0607E]" />
              <span>Wishlist</span>
            </Link>
            <Link
              href="/category/all"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] font-semibold hover:border-[#7A1C3B] transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Browse Crafts</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-[#B3261E] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6E9EE] border border-[#FADDE3] text-[10px] font-bold uppercase tracking-wider text-[#7A1C3B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl text-[#1C1917]">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-[#78716C]">
              {mode === 'login'
                ? 'Sign in for faster Razorpay checkout & saved order history.'
                : 'Register once for prefilled delivery & order tracking.'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FAF7F2] border border-[#EFE8E1] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#7A1C3B] shadow-2xs font-bold' : 'text-[#78716C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#7A1C3B] shadow-2xs font-bold' : 'text-[#78716C]'
              }`}
            >
              Create Account
            </button>
          </div>

          {!isConfigured && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Supabase client auth is not configured in environment variables yet.
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              {infoMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B3261E]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label htmlFor="cust-name" className="block text-xs font-semibold text-[#1C1917]">
                    Full Name <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="cust-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:bg-white focus:border-[#7A1C3B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="cust-phone" className="block text-xs font-semibold text-[#1C1917]">
                    WhatsApp Phone Number <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="cust-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:bg-white focus:border-[#7A1C3B]"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label htmlFor="cust-email" className="block text-xs font-semibold text-[#1C1917]">
                Email Address <span className="text-[#B3261E]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="cust-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:bg-white focus:border-[#7A1C3B]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="cust-password" className="block text-xs font-semibold text-[#1C1917]">
                Password <span className="text-[#B3261E]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="cust-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:bg-white focus:border-[#7A1C3B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#1C1917] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isConfigured}
              className="w-full py-3 px-6 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition cursor-pointer mt-2"
            >
              <span>
                {submitting
                  ? mode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'login'
                    ? 'Sign In to My Account'
                    : 'Create Customer Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-[#EFE8E1] text-center text-[11px] text-[#8C827A]">
            Store owner?{' '}
            <Link href="/admin/login" className="text-[#7A1C3B] font-semibold hover:underline">
              Admin Sign In
            </Link>
          </div>
        </motion.div>
      )}
      </main>
      <Footer />
    </div>
  );
}
