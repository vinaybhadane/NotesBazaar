import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ShoppingBag, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Customer Orders | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const orders = await db.getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Orders & Sales</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of student checkouts, transaction references, and payment verification states
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Order Reference</th>
                  <th className="py-3 px-5">Customer Email</th>
                  <th className="py-3 px-5">Notes Ordered</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Razorpay Order ID</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{o.order_number}</td>
                    <td className="py-3.5 px-5 text-slate-600">{o.customer_email}</td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {o.items?.map((it) => it.product_title).join(', ') || '1 Note'}
                    </td>
                    <td className="py-3.5 px-5 font-black text-slate-950">
                      ₹{(o.final_amount_in_paise / 100).toFixed(0)}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400">
                      {o.razorpay_order_id || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h2 className="text-sm font-bold text-slate-900">No orders recorded yet</h2>
            <p className="text-xs text-slate-400">
              Orders will appear here in real time as students complete checkouts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

