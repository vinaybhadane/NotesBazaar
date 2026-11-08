import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CheckCircle2, Download, ArrowRight, FileText, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Successful | NotesBazaar by AbhyasMitra',
  robots: {
    index: false,
    follow: false,
  },
};

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const resolved = await searchParams;
  const orderId = typeof resolved.order_id === 'string' ? resolved.order_id : null;

  let order = null;
  if (orderId) {
    order = await db.getOrderById(orderId);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <span className="pill-badge pill-badge-cyan">Payment Verified</span>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Purchase Completed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Your payment was successfully verified by our server. Your purchased SPPU 2024 Pattern notes are unlocked in your account.
        </p>
      </div>

      {order && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-left space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Order Reference:</span>
            <span className="font-bold text-slate-900">{order.order_number}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-black text-slate-900">
              ₹{(order.final_amount_in_paise / 100).toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-600 uppercase">Paid & Fulfilled</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivered to:</span>
            <span className="font-semibold text-slate-700">{order.customer_email}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link
          href="/account/downloads"
          className="px-6 py-3.5 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white font-black text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Go to My Downloads</span>
        </Link>
        <Link
          href="/account/purchases"
          className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>View Orders History</span>
        </Link>
      </div>
    </div>
  );
}

