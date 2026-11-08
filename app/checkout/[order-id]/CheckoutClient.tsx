'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';
import { ShieldCheck, Lock, FileText, ArrowRight, AlertCircle } from 'lucide-react';
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
  );
}

