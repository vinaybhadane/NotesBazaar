'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6 text-center">
        <div className="space-y-2">
          <div className="relative h-12 w-12 mx-auto mb-2 overflow-hidden rounded-2xl bg-white p-1 border border-slate-100 shadow-sm">
            <Image src="/logo.png" alt="AbhyasMitra Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Google Sign-In Only
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            NotesBazaar exclusively uses Google Sign-In for account access. No separate NotesBazaar password is required or stored.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Simply continue with your Google account to log in.</span>
        </div>

        <Link
          href="/login"
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-black transition-all shadow-md inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to Google Sign In</span>
        </Link>
      </div>
    </div>
  );
}
