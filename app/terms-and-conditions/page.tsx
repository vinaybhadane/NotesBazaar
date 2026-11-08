import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | NotesBazaar by AbhyasMitra',
  description:
    'Terms and Conditions governing the purchase, download, and personal academic use of study notes on NotesBazaar by AbhyasMitra.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Terms of Service</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Agreement to Terms</h2>
          <p>
            By accessing or using NotesBazaar by AbhyasMitra (&quot;the Platform&quot;), registering an account, or purchasing digital notes, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use this website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Nature of Digital Goods</h2>
          <p>
            NotesBazaar sells digital academic revision materials in PDF format created to support students preparing for SPPU engineering semester exams under the SPPU 2024 Pattern. Delivery is solely electronic through your authenticated student account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. Single-User License & Intellectual Property</h2>
          <p>
            All purchased notes are licensed exclusively for your <strong>individual, personal, non-commercial academic study</strong>. You may not re-upload, distribute, resell, sublicense, publish online, or share your access credentials with third parties. Any unauthorized reproduction or public sharing constitutes a violation of copyright laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">4. Pricing & Payments</h2>
          <p>
            All prices are quoted in Indian Rupees (INR) and are subject to change without prior notice. Payment is processed securely via Razorpay. We do not guarantee access or grant file downloads until the payment has been independently verified and captured by our server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">5. Limitation of Liability & Independent Disclaimer</h2>
          <p>
            While every effort is made to maintain complete curriculum accuracy according to the SPPU 2024 Pattern, NotesBazaar by AbhyasMitra does not guarantee specific examination results, passing grades, or exact question repetition. NotesBazaar is an independent supplemental study tool and does not replace official university textbooks, professor lectures, or institutional examinations.
          </p>
        </section>
      </div>
    </div>
  );
}

