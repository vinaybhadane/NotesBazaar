'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DownloadEntitlement, Order, Notification } from '@/lib/types';
import {
  Download,
  ShoppingBag,
  Bell,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function AccountOverviewPage() {
  const { firebaseUser } = useAuth();
  const [entitlements, setEntitlements] = useState<DownloadEntitlement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
          setEntitlements(data.entitlements || []);
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [firebaseUser]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Welcome back, {firebaseUser?.displayName || 'Student'}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Access your purchased SPPU 2024 Pattern notes and view order receipts.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Purchased Notes
            </span>
            <span className="text-3xl font-black text-slate-950 mt-1 block">
              {entitlements.length}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-900 rounded-2xl">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-3xl font-black text-slate-950 mt-1 block">
              {orders.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pattern Enrolled
            </span>
            <span className="text-xl font-black text-slate-950 mt-1 block">
              SPPU 2024
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Notes Downloads */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950">Recent Downloads</h2>
          <Link
            href="/account/downloads"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {entitlements.length > 0 ? (
          <div className="space-y-3">
            {entitlements.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {e.product?.title || 'SPPU Engineering Notes'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Granted: {new Date(e.granted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/download/${e.id}`}
                  className="px-4 py-2 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You haven&apos;t purchased any notes yet.</p>
            <Link
              href="/notes"
              className="inline-block mt-2 px-4 py-1.5 bg-[#FFE500] text-slate-950 text-xs font-bold rounded-full"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

