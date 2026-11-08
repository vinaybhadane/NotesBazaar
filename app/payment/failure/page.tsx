import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AlertCircle, RotateCcw, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Failed | NotesBazaar by AbhyasMitra',
  robots: {
    index: false,
    follow: false,
  },
};

interface FailurePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentFailurePage({ searchParams }: FailurePageProps) {
  const resolved = await searchParams;
  const orderId = typeof resolved.order_id === 'string' ? resolved.order_id : null;

  let order = null;
  if (orderId) {
    order = await db.getOrderById(orderId);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Payment Incomplete
        </h1>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          The transaction could not be verified or was cancelled. No charges were captured, or any deducted amount will be automatically refunded by Razorpay/your bank within 3-5 business days.
        </p>
      </div>

      {order && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
          <p>
            <strong>Order Reference:</strong> {order.order_number}
          </p>
          <p>
            <strong>Amount:</strong> ₹{(order.final_amount_in_paise / 100).toFixed(0)}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {order ? (
          <Link
            href={`/checkout/${order.id}`}
            className="px-6 py-3 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Payment</span>
          </Link>
        ) : (
          <Link
            href="/notes"
            className="px-6 py-3 bg-slate-950 text-white font-bold text-xs rounded-full"
          >
            Browse Notes
          </Link>
        )}
        <Link
          href="/contact"
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Contact Support</span>
        </Link>
      </div>
    </div>
  );
}

