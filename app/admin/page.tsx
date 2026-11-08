import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  BookOpen,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NotesBazaar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const stats = await db.getAdminStats();
  const dbStatus = await db.getDatabaseStatus();
  const recentOrders = await db.getAllOrders();

  const totalRevenueRupees = (stats.revenueTotalInPaise / 100).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Top Header & DB Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Marketplace Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics and catalog metrics from Azure SQL / Database
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Note</span>
        </Link>
      </div>

      {/* Database Status Alert Banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-slate-700" />
          <div>
            <span className="font-bold text-slate-900">Database Engine: </span>
            <span className="text-slate-600 font-mono text-[11px]">{dbStatus.info}</span>
          </div>
        </div>
        <span className="pill-badge pill-badge-cyan text-[10px]">Active</span>
      </div>

      {/* Key Metric Tiles (Strictly Real Database Records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Published Notes
          </span>
          <span className="text-3xl font-black text-slate-950 block">
            {stats.totalPublished}
          </span>
          <span className="text-[10px] text-slate-500">Live in Catalog</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Coming Soon Notes
          </span>
          <span className="text-3xl font-black text-amber-600 block">
            {stats.totalComingSoon}
          </span>
          <span className="text-[10px] text-slate-500">Checkout Strictly Disabled</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Paid Orders
          </span>
          <span className="text-3xl font-black text-emerald-600 block">
            {stats.successfulPayments}
          </span>
          <span className="text-[10px] text-slate-500">Verified via Razorpay</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-3xl font-black text-slate-950 block">
            ₹{totalRevenueRupees}
          </span>
          <span className="text-[10px] text-slate-500">Settled INR</span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
          <span className="text-slate-600 font-medium">Draft Notes:</span>
          <span className="font-bold text-slate-900">{stats.totalDrafts}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
          <span className="text-slate-600 font-medium">Pending Payments:</span>
          <span className="font-bold text-amber-600">{stats.pendingPayments}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
          <span className="text-slate-600 font-medium">Registered Students:</span>
          <span className="font-bold text-slate-900">{stats.totalUsers}</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Order Ref</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{o.order_number}</td>
                    <td className="py-3 px-4 text-slate-600">{o.customer_email}</td>
                    <td className="py-3 px-4 font-black text-slate-950">
                      ₹{(o.final_amount_in_paise / 100).toFixed(0)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No customer orders placed yet. Metrics will update dynamically upon actual checkouts.
          </div>
        )}
      </div>
    </div>
  );
}

