import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | NotesBazaar by AbhyasMitra',
  description:
    'Answers to questions regarding SPPU 2024 Pattern notes, Razorpay payments, download delivery, refunds, and syllabus coverage.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is NotesBazaar by AbhyasMitra?',
      a: 'NotesBazaar is an academic notes platform created to provide SPPU (Savitribai Phule Pune University) engineering students with verified, unit-wise study notes aligned strictly with the updated SPPU 2024 Pattern syllabus.',
    },
    {
      q: 'How does digital delivery work?',
      a: 'All our products are 100% digital. Immediately after your payment is verified by our server via Razorpay, the PDF document is unlocked in your student account under "My Downloads" for direct access.',
    },
    {
      q: 'Why are some notes marked as "COMING SOON!"?',
      a: 'Notes marked as "COMING SOON!" are currently in active preparation, typesetting, or curriculum review. They cannot be purchased yet and checkout is strictly blocked to protect students from paying for unavailable content.',
    },
    {
      q: 'Which payment modes are supported?',
      a: 'We accept all major Indian payment methods through the secure Razorpay payment gateway, including UPI (Google Pay, PhonePe, Paytm, BHIM), Debit Cards, Credit Cards, and NetBanking.',
    },
    {
      q: 'What is your refund policy for digital notes?',
      a: 'Because notes are delivered immediately as downloadable digital PDF files, we do not issue generic refunds once a file has been downloaded. However, if a duplicate payment was charged due to a gateway glitch or a corrupted file cannot be opened, we promptly issue a full refund upon verification.',
    },
    {
      q: 'Are you officially connected with Savitribai Phule Pune University?',
      a: 'No. NotesBazaar by AbhyasMitra is an independent educational initiative. We have no formal affiliation with or endorsement from SPPU. All syllabus titles and codes are referenced solely for academic alignment under educational fair use.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10">
      <div className="text-center space-y-2">
        <span className="pill-badge pill-badge-yellow">Help Center</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Clear answers to common questions about our notes, payment verification, and digital delivery.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-2"
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-950 flex items-start gap-2.5">
              <span className="text-amber-500 font-black">Q.</span>
              <span>{f.q}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Still have questions?</h3>
        <p className="text-xs text-slate-500">
          Our support team is ready to help you with your inquiry.
        </p>
        <Link
          href="/contact"
          className="inline-block px-5 py-2 bg-slate-950 text-white rounded-full text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-colors"
        >
          Contact Support Desk
        </Link>
      </div>
    </div>
  );
}

