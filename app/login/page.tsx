'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRedirect = searchParams.get('redirect');

  const getDestinationUrl = () => {
    if (queryRedirect) return queryRedirect;
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (
          refUrl.origin === window.location.origin &&
          !refUrl.pathname.startsWith('/login') &&
          !refUrl.pathname.startsWith('/register') &&
          !refUrl.pathname.startsWith('/forgot-password')
        ) {
          return refUrl.pathname + refUrl.search;
        }
      } catch {
        // fallback
      }
    }
    return '/';
  };

  const redirectUrl = getDestinationUrl();

  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    setLoading(true);
    try {
      await signInWithEmail(cleanEmail, password);
      toast.success('Signed in successfully!');
      const target = getDestinationUrl();
      router.push(target);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Invalid email or password.';
      const code = err?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.';
      } else if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
        msg = 'Invalid Firebase API Key. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in Vercel Environment Variables.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to multiple failed login attempts. Please try again later or reset password.';
      } else if (code === 'auth/user-disabled') {
        msg = 'This student account has been disabled. Please contact support.';
      } else if (err?.message) {
        msg = err.message.replace(/^Firebase:\s*/i, '');
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      const target = getDestinationUrl();
      router.push(target);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="relative h-12 w-12 mx-auto mb-2 overflow-hidden rounded-2xl bg-white p-1 border border-slate-100 shadow-sm">
          <Image src="/logo.png" alt="AbhyasMitra Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Sign In to NotesBazaar
        </h1>
        <p className="text-xs text-slate-500">
          Access your purchased notes and downloads
        </p>
      </div>

      {/* Google Login Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-3 shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-slate-100"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Or with email
        </span>
        <div className="flex-1 border-t border-slate-100"></div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
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

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-slate-900">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-slate-950 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

