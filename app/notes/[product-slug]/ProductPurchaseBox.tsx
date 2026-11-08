'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  Download,
  Clock,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductPurchaseBoxProps {
  product: Product;
}

export default function ProductPurchaseBox({ product }: ProductPurchaseBoxProps) {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discountRupees: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [initiatingCheckout, setInitiatingCheckout] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const isComingSoon = product.is_coming_soon;
  const originalPricePaise = product.price_in_paise;
  const discountPaise = appliedDiscount ? appliedDiscount.discountRupees * 100 : 0;
  const finalPricePaise = Math.max(0, originalPricePaise - discountPaise);

  const priceRupees = (finalPricePaise / 100).toFixed(0);
  const originalRupees = (originalPricePaise / 100).toFixed(0);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          amountInPaise: originalPricePaise,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Invalid or expired coupon code.');
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount({
          code: data.code,
          discountRupees: data.discountInPaise / 100,
        });
        toast.success(`Coupon applied! Saved ₹${data.discountInPaise / 100}`);
      }
    } catch {
      toast.error('Could not validate coupon. Please try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!firebaseUser) {
      router.push(`/login?redirect=/notes/${product.slug}`);
      return;
    }

    if (isComingSoon) {
      toast.error('This product is marked as Coming Soon and cannot be purchased.');
      return;
    }

    setInitiatingCheckout(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          couponCode: appliedDiscount?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to initialize checkout.');
        setInitiatingCheckout(false);
        return;
      }

      // Navigate to dedicated checkout screen
      router.push(`/checkout/${data.orderId}`);
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
      setInitiatingCheckout(false);
    }
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitted(true);
    toast.success('Thank you! You will be notified as soon as these notes are published.');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-6">
      {/* Price / Status Display */}
      {isComingSoon ? (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Product Status
            </span>
          </div>
          <p className="text-xl font-black text-slate-950">COMING SOON!</p>
          <p className="text-xs text-amber-900/80 leading-relaxed">
            This study guide is in preparation for the SPPU 2024 Pattern. Checkout is strictly disabled until publication.
          </p>
        </div>
      ) : (
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Student Price (INR)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-950">₹{priceRupees}</span>
            {appliedDiscount ? (
              <span className="text-sm text-slate-400 line-through">₹{originalRupees}</span>
            ) : product.compare_at_price_in_paise ? (
              <span className="text-sm text-slate-400 line-through">
                ₹{(product.compare_at_price_in_paise / 100).toFixed(0)}
              </span>
            ) : null}
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Digital PDF
            </span>
          </div>
        </div>
      )}

      {/* Coupon Form (Only if purchasable) */}
      {!isComingSoon && (
        <div className="pt-2 border-t border-slate-100">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Coupon code (e.g. ABHYAS15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-semibold text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={validatingCoupon || !couponCode.trim()}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              {validatingCoupon ? 'Checking...' : 'Apply'}
            </button>
          </form>

          {appliedDiscount && (
            <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center justify-between">
              <span>Code {appliedDiscount.code} applied!</span>
              <button
                type="button"
                onClick={() => {
                  setAppliedDiscount(null);
                  setCouponCode('');
                }}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {isComingSoon ? (
        <div className="space-y-3">
          <button
            type="button"
            disabled
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
          >
            Checkout Currently Disabled
          </button>

          {!notifySubmitted ? (
            <form onSubmit={handleNotifyMe} className="space-y-2 pt-2">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Notify me when notes go live:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your.email@college.edu"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                >
                  Notify
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium text-center">
              ✓ We will email you upon release!
            </div>
          )}
        </div>
      ) : firebaseUser ? (
        <button
          onClick={handleProceedToCheckout}
          disabled={initiatingCheckout}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {initiatingCheckout ? (
            <span>Preparing Order...</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Proceed to Checkout (₹{priceRupees})</span>
            </>
          )}
        </button>
      ) : (
        <Link
          href={`/login?redirect=/notes/${product.slug}`}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 text-center"
        >
          <span>Sign In to Buy (₹{priceRupees})</span>
        </Link>
      )}

      {/* Assurance / Trust Points */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <Download className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Immediate account download after payment</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Verified Razorpay payment gateway</span>
        </div>
      </div>
    </div>
  );
}

