import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | NotesBazaar by AbhyasMitra',
  description:
    'Refund Policy for digital educational notes purchased on NotesBazaar by AbhyasMitra.',
  alternates: {
    canonical: '/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Customer Protection</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Refund Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Nature of Digital Deliverables</h2>
          <p>
            At NotesBazaar by AbhyasMitra, we provide non-tangible, irrevocable digital study guides (PDF files). Because digital products are delivered instantly into your account upon server-side payment verification, <strong>general refunds or change-of-mind cancellations are not provided once a note has been downloaded</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Circumstances Where Refunds Are Granted</h2>
          <p>We are dedicated to honest student support. A 100% full refund will be granted under the following documented circumstances:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Duplicate Charges:</strong> If you were accidentally charged more than once for the same note due to a network timeout or payment gateway glitch.</li>
            <li><strong>Technical Corruption:</strong> If the delivered PDF file is damaged, corrupted, or cannot be rendered and our technical team cannot provide a working replacement within 48 hours.</li>
            <li><strong>Payment Captured Without Entitlement:</strong> If your bank account or UPI was debited but the platform failed to generate an active download entitlement after payment reconciliation.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. How to Request a Refund</h2>
          <p>
            To submit a refund request, send an email to <strong>support@abhyasmitra.com</strong> with the subject line <em>&quot;Refund Request – [Order Number]&quot;</em> within <strong>7 days</strong> of the transaction. Please include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your registered student email address.</li>
            <li>The NotesBazaar Order Reference (e.g. NBZ-XXXXX).</li>
            <li>The Razorpay Payment ID.</li>
            <li>A clear description of the technical issue or duplicate transaction.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">4. Processing Timelines</h2>
          <p>
            Once approved, refunds are initiated directly through the Razorpay refund API back to your original source of payment (bank account, debit/credit card, or UPI VPA). The amount typically reflects in your account within <strong>5 to 7 business days</strong> depending on your bank&apos;s processing cycles.
          </p>
        </section>
      </div>
    </div>
  );
}

