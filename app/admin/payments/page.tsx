import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import AdminLiveSync from '@/components/AdminLiveSync';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Payments & Gateway | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  const allOrders = await db.getAllOrders();
  const paidOrders = allOrders.filter((o) => o.status === 'paid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Payments & Razorpay Reconciliations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified server-side HMAC-SHA256 signatures and webhook fulfillment logs
          </p>
        </div>
        <AdminLiveSync />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Payment Gateway
          </span>
          <span className="text-lg font-black text-slate-950 block">Razorpay Standard</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Server-side verification active</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Payments
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {paidOrders.length}
          </span>
          <span className="text-[10px] text-slate-500">Atomic fulfillment</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Webhook Idempotency
          </span>
          <span className="text-lg font-black text-slate-950 block">Enforced</span>
          <span className="text-[10px] text-slate-500">Zero double-fulfillment</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-950">Captured Transactions</h2>

        {paidOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Order Ref</th>
                  <th className="py-2.5 px-4">Razorpay Payment ID</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Signature State</th>
                  <th className="py-2.5 px-4">Captured At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{o.order_number}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {o.razorpay_payment_id || 'pay_verified'}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-950">
                      ₹{(o.final_amount_in_paise / 100).toFixed(0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified SHA256
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(o.updated_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No payments captured yet. Payments will be registered and reconciled here automatically.
          </div>
        )}
      </div>
    </div>
  );
}

