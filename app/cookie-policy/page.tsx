import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | NotesBazaar by AbhyasMitra',
  description:
    'Cookie Policy explaining how NotesBazaar by AbhyasMitra uses cookies and local storage tokens for authentication and security.',
  alternates: {
    canonical: '/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Cookies & Storage</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. What Are Cookies?</h2>
          <p>
            Cookies and browser storage mechanisms (such as LocalStorage) are small data files placed on your computer or mobile device when you visit our website. They enable the platform to keep you logged in, maintain shopping cart integrity, verify Razorpay security tokens, and preserve your customized preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Cookie Categories We Use</h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-xs">A. Strictly Necessary Cookies (Always Active)</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Essential for the website to function properly. Includes Firebase user authentication session tokens, Razorpay checkout fraud prevention tokens, and download authorization tokens. Without these, secure purchasing and file access cannot occur.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-xs">B. Functional Cookies (Optional)</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Remembers your selected branch and academic year filter preferences during your browsing sessions so you do not have to reselect them upon returning.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-xs">C. Performance & Analytics Cookies (Optional)</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Collects aggregated, anonymous data regarding which engineering notes are most frequently viewed, helping us prioritize future curriculum uploads.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. Managing Your Cookie Choices</h2>
          <p>
            You can customize or withdraw your optional cookie preferences at any time by clicking the <strong>Cookie Preferences</strong> link located in the footer of any page on NotesBazaar.
          </p>
        </section>
      </div>
    </div>
  );
}

