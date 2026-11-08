import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ 'order-id': string }>;
}

export const metadata: Metadata = {
  title: 'Order Details | NotesBazaar by AbhyasMitra',
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolved = await params;
  const orderId = resolved['order-id'];
  const order = await db.getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Fetch entitlements for direct download buttons if paid
  let entitlements: any[] = [];
  if (order.status === 'paid') {
    entitlements = await db.getEntitlementsByUser(order.user_id);
  }

  const finalRupees = (order.final_amount_in_paise / 100).toFixed(0);
  const totalRupees = (order.total_amount_in_paise / 100).toFixed(0);
  const discountRupees = (order.discount_amount_in_paise / 100).toFixed(0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/account/purchases"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <span className="text-[11px] font-mono text-slate-400">ID: {order.id}</span>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-black text-slate-950">
                Order #{order.order_number}
              </span>
              {order.status === 'paid' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Paid & Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3" />
                  {order.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Delivered To
            </span>
            <span className="font-semibold text-slate-900">{order.customer_email}</span>
          </div>
        </div>

        {/* Razorpay Transaction Details */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Razorpay Order ID
            </span>
            <span className="font-mono text-[11px] text-slate-800 font-semibold">
              {order.razorpay_order_id || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Payment Reference
            </span>
            <span className="font-mono text-[11px] text-slate-800 font-semibold">
              {order.razorpay_payment_id || 'Verification in progress'}
            </span>
          </div>
        </div>

        {/* Itemized Purchased Notes */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Purchased Study Materials
          </h2>

          <div className="space-y-2">
            {order.items &&
              order.items.map((item) => {
                const ent = entitlements.find((e) => e.product_id === item.product_id);

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-950">
                          {item.product_title || 'SPPU Engineering Notes'}
                        </h3>
                        <span className="text-[10px] text-slate-500 block">
                          Format: PDF Document · SPPU 2024 Pattern
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs font-black text-slate-950">
                        ₹{(item.final_price_in_paise / 100).toFixed(0)}
                      </span>

                      {order.status === 'paid' && ent && (
                        <a
                          href={`/api/download/${ent.id}`}
                          className="px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Total Calculations */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>₹{totalRupees}</span>
          </div>

          {order.discount_amount_in_paise > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promotional Discount:</span>
              <span>- ₹{discountRupees}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-base font-black text-slate-950">
            <span>Total Amount Paid:</span>
            <span className="text-2xl text-slate-950">₹{finalRupees}</span>
          </div>
        </div>

        {/* Security & Verification Note */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This digital receipt confirms cryptographic HMAC-SHA256 payment verification via Razorpay. Your download entitlement is permanent in your account under &quot;My Downloads&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
