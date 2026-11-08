import React from 'react';
import type { Metadata } from 'next';
import ContactForm from './ContactForm';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Support | NotesBazaar by AbhyasMitra',
  description:
    'Have questions about notes, payment verification, or downloads? Get in touch with the NotesBazaar by AbhyasMitra student support team.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="pill-badge pill-badge-yellow">Help & Support</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Contact Student Support
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Need help with your download entitlement, Razorpay transaction, or syllabus inquiries? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Support Email
                </span>
                <a
                  href="mailto:support@abhyasmitra.com"
                  className="text-xs font-bold text-slate-900 hover:text-amber-600"
                >
                  support@abhyasmitra.com
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Support Desk
                </span>
                <span className="text-xs font-bold text-slate-900">+91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Operational Hours
                </span>
                <span className="text-xs font-semibold text-slate-700 block">
                  Mon – Sat: 9:00 AM – 7:00 PM IST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

