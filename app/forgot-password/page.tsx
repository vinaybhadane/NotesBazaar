'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      toast.error(err.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="relative h-12 w-12 mx-auto mb-2 overflow-hidden rounded-2xl bg-white p-1 border border-slate-100 shadow-sm">
            <Image src="/logo.png" alt="AbhyasMitra Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-800">
              A password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox or spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-slate-950 text-white rounded-full text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-600 hover:text-slate-950 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

