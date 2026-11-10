'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Sparkles } from 'lucide-react';
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

  const { signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      const target = getDestinationUrl();
      router.push(target);
      router.refresh();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in popup was closed.');
      } else if (code === 'auth/popup-blocked') {
        toast.error('Pop-up blocked by browser. Please allow pop-ups for this site and retry.');
      } else if (code === 'auth/unauthorized-domain') {
        toast.error(
          'This domain is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.'
        );
      } else if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
        toast.error('Invalid Firebase API Key. Verify environment variables.');
      } else {
        toast.error(err?.message?.replace(/^Firebase:\s*/i, '') || 'Google sign-in failed.');
      }
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
          Sign In or Create Account
        </h1>
        <p className="text-xs text-slate-500">
          One-click access to your SPPU 2024 notes and purchases
        </p>
      </div>

      {/* Google Only Sign-In / Sign-Up */}
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3.5 px-5 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer disabled:opacity-60"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
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
          </span>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>New to NotesBazaar?</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Your student account is automatically created the first time you continue with Google—no separate password required.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured by Google Identity & Firebase</span>
        </div>
        <p className="text-[11px] text-slate-400">
          By continuing, you agree to our{' '}
          <Link href="/terms-and-conditions" className="text-amber-600 hover:underline font-medium">
            Terms
          </Link>{' '}
          &{' '}
          <Link href="/privacy-policy" className="text-amber-600 hover:underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
