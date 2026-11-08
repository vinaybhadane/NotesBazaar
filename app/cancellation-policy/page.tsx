import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy | NotesBazaar by AbhyasMitra',
  description:
    'Cancellation Policy for digital study note orders on NotesBazaar by AbhyasMitra.',
  alternates: {
    canonical: '/cancellation-policy',
  },
};

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Order Policies</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Cancellation Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Instant Digital Orders</h2>
          <p>
            Due to our automated digital fulfillment pipeline, orders placed on NotesBazaar by AbhyasMitra are processed and delivered instantly upon successful Razorpay payment verification. As a consequence, <strong>orders cannot be cancelled after the payment has been completed and the file entitlement generated</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Pending or Incomplete Checkouts</h2>
          <p>
            If you initiate a checkout session but do not complete the payment on the Razorpay gateway, the order remains in &quot;Pending&quot; or &quot;Created&quot; status and will automatically expire without any financial liability. You may abandon or restart a checkout session at any time prior to payment capture.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. Contact Us</h2>
          <p>
            If you encountered an erroneous charge or have questions concerning your order status, please contact our support desk immediately at <strong>support@abhyasmitra.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

