'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DownloadEntitlement } from '@/lib/types';
import { Download, FileText, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';

export default function MyDownloadsPage() {
  const { firebaseUser } = useAuth();
  const [entitlements, setEntitlements] = useState<DownloadEntitlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDownloads() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/user/dashboard-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEntitlements(data.entitlements || []);
        }
      } catch (err) {
        console.warn('Error loading downloads:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDownloads();
  }, [firebaseUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">My Downloads</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized notes unlocked through verified Razorpay purchases.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading downloads...</div>
      ) : entitlements.length > 0 ? (
        <div className="space-y-4">
          {entitlements.map((e) => (
            <div
              key={e.id}
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="pill-badge pill-badge-yellow">SPPU 2024 Pattern</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified Purchase
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-950">
                    {e.product?.title || 'SPPU Engineering Notes'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {e.product?.short_description}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Granted: {new Date(e.granted_at).toLocaleDateString()} · Format: PDF Document
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                <a
                  href={`/api/download/${e.id}`}
                  className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-900">No downloads available yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you purchase a note, it will appear here with an authorized download button.
          </p>
          <Link
            href="/notes"
            className="inline-block mt-3 px-5 py-2 bg-slate-950 text-white text-xs font-bold rounded-full hover:bg-[#FFE500] hover:text-slate-950 transition-all"
          >
            Browse Available Notes
          </Link>
        </div>
      )}
    </div>
  );
}

