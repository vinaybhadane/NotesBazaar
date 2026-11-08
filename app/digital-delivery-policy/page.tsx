import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Delivery & Shipping Policy | NotesBazaar by AbhyasMitra',
  description:
    'Shipping and Digital Delivery Policy explaining delivery mechanisms for electronic educational notes on NotesBazaar by AbhyasMitra.',
  alternates: {
    canonical: '/digital-delivery-policy',
  },
};

export default function DigitalDeliveryPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Delivery Information</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Digital Delivery & Shipping Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Nature of Delivery</h2>
          <p>
            NotesBazaar by AbhyasMitra deals exclusively in <strong>digital academic notes in electronic PDF format</strong>. We do not dispatch physical books, printed spiral bounds, or postal parcels. As such, there are <strong>zero shipping fees, zero postal delays, and no physical courier dispatches</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Delivery Timeframe & Access</h2>
          <p>
            Digital delivery is <strong>instantaneous</strong> upon server-side confirmation of your Razorpay payment. Under normal operation:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivery occurs within <strong>0 to 30 seconds</strong> of payment authorization.</li>
            <li>The purchased document is automatically added to your personal account under <strong>My Downloads</strong>.</li>
            <li>An order confirmation containing your transaction reference is simultaneously dispatched to your registered email address.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. How to Access Your Purchased Notes</h2>
          <p>To access and download your note files at any time:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Log into your account on <strong>NotesBazaar</strong> using your registered email or Google login.</li>
            <li>Navigate to the <strong>My Downloads</strong> section in your student dashboard.</li>
            <li>Click the <strong>Download PDF</strong> button to save the file directly to your laptop, tablet, or smartphone.</li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">4. Delivery Assistance</h2>
          <p>
            If you have completed a payment but your download entitlement does not appear in your account within 5 minutes, please check your network connection or reach out to us at <strong>support@abhyasmitra.com</strong> with your order number. We will manually reconcile and provision your access immediately.
          </p>
        </section>
      </div>
    </div>
  );
}

