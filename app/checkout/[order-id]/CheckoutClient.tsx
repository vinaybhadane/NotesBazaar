'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';
import { ShieldCheck, Lock, FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutClientProps {
  order: Order;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutClient({ order }: CheckoutClientProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const createdAtMs = new Date(order.created_at).getTime();
  const FIFTEEN_MIN_MS = 15 * 60 * 1000;
  const isInitiallyExpired = order.status === 'cancelled' || order.status === 'failed' || (Date.now() - createdAtMs > FIFTEEN_MIN_MS);
  const [isExpired, setIsExpired] = useState(isInitiallyExpired);
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const elapsed = Date.now() - createdAtMs;
    return Math.max(0, Math.floor((FIFTEEN_MIN_MS - elapsed) / 1000));
  });

  useEffect(() => {
    if (isExpired || order.status === 'paid') return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - createdAtMs;
      const left = Math.max(0, Math.floor((FIFTEEN_MIN_MS - elapsed) / 1000));
      setSecondsRemaining(left);
      if (left <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAtMs, isExpired, order.status]);

  useEffect(() => {
    // Dynamically load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => toast.error('Could not load payment gateway. Please check your internet connection.');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayNow = () => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId || !window.Razorpay) {
      // In development or when key is not configured, support simulated test payment confirmation
      handleSimulatedTestPayment();
      return;
    }

    setProcessing(true);

    const options = {
      key: keyId,
      amount: order.final_amount_in_paise,
      currency: 'INR',
      name: 'NotesBazaar by AbhyasMitra',
      description: `SPPU 2024 Pattern Notes (Order ${order.order_number})`,
      image: '/logo.png',
      order_id: order.razorpay_order_id,
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              internalOrderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            toast.success('Payment verified successfully!');
            router.push(`/payment/success?order_id=${order.id}`);
          } else {
            toast.error(verifyData.error || 'Payment signature verification failed.');
            router.push(`/payment/failure?order_id=${order.id}`);
          }
        } catch (err: any) {
          toast.error('Network error during verification.');
          router.push(`/payment/failure?order_id=${order.id}`);
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        email: order.customer_email,
        name: order.customer_name || '',
      },
      theme: {
        color: '#0F172A',
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      toast.error(response.error?.description || 'Payment failed.');
      setProcessing(false);
      router.push(`/payment/failure?order_id=${order.id}`);
    });
    rzp.open();
  };

  const handleSimulatedTestPayment = async () => {
    setProcessing(true);
    toast.info('Processing test mode payment verification...');
    try {
      const res = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internalOrderId: order.id,
          razorpay_order_id: order.razorpay_order_id || `order_sim_${Date.now()}`,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'test_mode_signature',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Test payment verified!');
        router.push(`/payment/success?order_id=${order.id}`);
      } else {
        toast.error(data.error || 'Verification failed.');
      }
    } catch {
      toast.error('Verification error.');
    } finally {
      setProcessing(false);
    }
  };

  const finalRupees = (order.final_amount_in_paise / 100).toFixed(0);
  const totalRupees = (order.total_amount_in_paise / 100).toFixed(0);
  const discountRupees = (order.discount_amount_in_paise / 100).toFixed(0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Item Summary */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Order Items
        </h2>

        {order.items &&
          order.items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.product_title || 'SPPU Engineering Notes'}
                  </h3>
                  <span className="text-[11px] text-slate-500">PDF Document · Digital Download</span>
                </div>
              </div>
              <span className="text-sm font-black text-slate-950">
                ₹{(item.unit_price_in_paise / 100).toFixed(0)}
              </span>
            </div>
          ))}
      </div>

      {/* Price Calculations */}
      <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span>₹{totalRupees}</span>
        </div>

        {order.discount_amount_in_paise > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Discount Applied:</span>
            <span>- ₹{discountRupees}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-base font-black text-slate-950">
          <span>Total Payable:</span>
          <span className="text-2xl text-slate-950">₹{finalRupees}</span>
        </div>
      </div>

      {/* Expiry Warning or Expired Box */}
      {isExpired ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-red-950">Payment Session Expired</h3>
          <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">
            This checkout session was pending for more than 15 minutes and has been automatically cancelled. The payment link has been removed. Please browse the catalog to place a fresh order.
          </p>
          <div className="pt-2">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white hover:bg-[#FFE500] hover:text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <span>Browse Notes Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 15-Minute Countdown Indicator */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Checkout session expires in:</span>
            </span>
            <span className="font-mono font-bold text-amber-950">
              {Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s
            </span>
          </div>

          {/* Payment Button */}
          <div className="pt-2">
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full py-4 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {processing ? (
                <span>Verifying Payment...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Securely with Razorpay (₹{finalRupees})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Encrypted 256-bit SSL transaction via Razorpay</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

