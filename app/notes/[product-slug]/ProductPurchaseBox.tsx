'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  BookOpen,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    checked: boolean;
    purchased: boolean;
    entitlementId?: string | null;
  }>({ checked: false, purchased: false });

  useEffect(() => {
    async function checkOwnership() {
      if (!firebaseUser) {
        setPurchaseStatus({ checked: true, purchased: false });
        return;
      }
      try {
        const token = await firebaseUser.getIdToken();
        const emailParam = firebaseUser.email ? `&email=${encodeURIComponent(firebaseUser.email)}` : '';
        const res = await fetch(`/api/user/check-purchase?productId=${product.id}${emailParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPurchaseStatus({
            checked: true,
            purchased: Boolean(data.purchased),
            entitlementId: data.entitlementId || null,
          });
        } else {
          setPurchaseStatus({ checked: true, purchased: false });
        }
      } catch {
        setPurchaseStatus({ checked: true, purchased: false });
      }
    }
    checkOwnership();
  }, [firebaseUser, product.id]);

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
          userEmail: firebaseUser.email,
          userName: firebaseUser.displayName,
          userId: firebaseUser.uid,
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
      ) : purchaseStatus.purchased ? (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Already Purchased & Unlocked
            </span>
          </div>
          <p className="text-lg font-black text-slate-950">Active Download Entitlement</p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            You already own this study guide! Single purchase only. Your notes are permanently saved in your student account.
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

      {/* Coupon Form (Only if purchasable and not already purchased) */}
      {!isComingSoon && !purchaseStatus.purchased && (
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
      ) : purchaseStatus.purchased ? (
        <div className="space-y-2.5">
          <a
            href={purchaseStatus.entitlementId ? `/api/download/${purchaseStatus.entitlementId}` : '/account/downloads'}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center"
          >
            <Download className="w-4 h-4" />
            <span>Download Notes PDF</span>
          </a>
          <Link
            href="/account/downloads"
            className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 text-center"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>View in My Downloads</span>
          </Link>
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

      {/* Sample Preview Button (Available even if Coming Soon) */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Preview Sample Pages</span>
      </button>

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

      {/* Sample Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="pill-badge pill-badge-yellow text-[10px] mb-1 inline-block">
                  SAMPLE PREVIEW · PAGE {previewPage} OF 3
                </span>
                <h3 className="text-sm font-black text-slate-950 line-clamp-1">
                  {product.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Sheet with Diagonal Watermark */}
            <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 relative min-h-[320px]">
              {/* Watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] rotate-[-25deg]">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 text-center tracking-widest uppercase">
                  NotesBazaar Sample Preview
                </span>
              </div>

              {previewPage === 1 && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed relative z-10">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      SPPU 2024 Pattern Curriculum
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Branch: {product.branch_name || 'Engineering'} · {product.year_name || 'SE & TE'}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-950 mb-1">Course Objectives & Scope:</h5>
                    <p className="text-slate-600">
                      This official revision guide is structured unit-wise according to the Savitribai Phule Pune University (SPPU) 2024 Pattern. Each module is cross-referenced with previous in-sem and end-sem exam distributions.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-950 mb-1">Key Modules Breakdown:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      {product.topics_covered?.slice(0, 4).map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {previewPage === 2 && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed relative z-10">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      Unit 1 Summary & Theoretical Framework
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      Core Foundations & Definitions
                    </h4>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      Concept Summary & High-Yield Exam Note:
                    </span>
                    <p className="text-slate-600">
                      Standard syllabus derivations, time and space complexity bounds, and step-by-step algorithm traces formatted specifically for clear handwritten presentation in university answer sheets.
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    [Diagram and formal mathematical proofs are fully rendered in the complete 60+ page document]
                  </p>
                </div>
              )}

              {previewPage === 3 && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed relative z-10">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      Solved Practice Problems
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      Previous Exam Pattern Analysis
                    </h4>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      Sample Question & Complete Solution Trace:
                    </span>
                    <p className="text-slate-600">
                      Includes step-by-step analytical breakdowns, state transition mappings, and common student errors identified during evaluation.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-center text-xs font-semibold">
                    ⭐ Complete document includes all 6 syllabus units, over 60+ pages, and quick revision formula cheat-sheets.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Controls & CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-100 gap-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPreviewPage(page)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      previewPage === page
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="text-[11px] text-slate-400 ml-2">Sample Page</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close Preview
                </button>
                {!isComingSoon && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewOpen(false);
                      handleProceedToCheckout();
                    }}
                    className="px-5 py-2 rounded-full bg-[#FFE500] hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-sm flex-1 sm:flex-none text-center"
                  >
                    Get Full Notes (₹{priceRupees})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

