'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';
import { ShoppingBag, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function MyPurchasesPage() {
  const { firebaseUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const emailParam = firebaseUser.email ? `?email=${encodeURIComponent(firebaseUser.email)}` : '';
        const res = await fetch(`/api/user/dashboard-data${emailParam}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.warn('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [firebaseUser]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Paid & Verified
          </span>
        );
      case 'pending':
      case 'created':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete purchase history with Razorpay references and receipts.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Order Reference</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Notes Purchased</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      <Link href={`/account/orders/${o.id}`} className="hover:text-amber-600 underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-medium">
                      {o.items?.map((it) => it.product_title).join(', ') || '1 Note'}
                    </td>
                    <td className="py-4 px-5 font-black text-slate-950">
                      ₹{(o.final_amount_in_paise / 100).toFixed(0)}
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(o.status)}</td>
                    <td className="py-4 px-5 text-right">
                      {o.status === 'paid' ? (
                        <Link
                          href="/account/downloads"
                          className="text-xs font-bold text-amber-600 hover:text-amber-700"
                        >
                          Downloads →
                        </Link>
                      ) : (
                        <Link
                          href={`/checkout/${o.id}`}
                          className="text-xs font-bold text-slate-700 hover:text-slate-950 underline"
                        >
                          Complete →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-900">No orders placed yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your verified orders and Razorpay transaction receipts will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

