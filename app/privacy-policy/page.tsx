import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NotesBazaar by AbhyasMitra',
  description:
    'Privacy Policy for NotesBazaar by AbhyasMitra in accordance with applicable Indian digital data protection standards.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Legal Compliance</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective Date: {new Date().toLocaleDateString()} · Version 1.0
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Introduction</h2>
          <p>
            Welcome to <strong>NotesBazaar by AbhyasMitra</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines our practices regarding data collection, usage, processing, and protection in compliance with the Digital Personal Data Protection (DPDP) Act of India and relevant consumer protection regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Information We Collect</h2>
          <p>We collect only the minimum data required to facilitate digital notes transactions and maintain platform security:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Data:</strong> Your name, email address, and Firebase authentication credentials.</li>
            <li><strong>Order & Transaction Records:</strong> Purchased note IDs, internal order references, amount paid, and Razorpay payment identifiers. (We do NOT store or have access to your credit/debit card numbers, CVVs, or UPI PINs; all sensitive card processing is executed directly by RBI-licensed payment aggregators like Razorpay).</li>
            <li><strong>Download Security & Audit Logs:</strong> IP address, timestamp, and device user-agent recorded when an authorized file is accessed to prevent unauthorized file distribution.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. How We Use Your Information</h2>
          <p>Your data is used strictly for legitimate educational commerce purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To verify payments server-side and unlock note download entitlements.</li>
            <li>To dispatch critical transactional notifications (such as note corrections or updated PDF files).</li>
            <li>To provide customer support and troubleshoot payment verification queries.</li>
            <li>To detect and prevent fraudulent transactions or security violations.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">4. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal data. We disclose necessary information only to trusted operational service providers who adhere to strict data security standards:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Razorpay:</strong> Payment processing and webhook transaction reconciliation.</li>
            <li><strong>Firebase / Google Cloud:</strong> Authentication and user session tokens.</li>
            <li><strong>Microsoft Azure:</strong> Encrypted SQL database and Blob storage for digital files.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">5. Your Data Rights</h2>
          <p>
            Under applicable Indian data protection principles, you have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or request account closure. To exercise any of these rights, contact our Data Grievance Officer at <strong>support@abhyasmitra.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

