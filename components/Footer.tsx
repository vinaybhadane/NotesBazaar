'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, BookOpen, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenCookieSettings?: () => void;
}

export default function Footer({ onOpenCookieSettings }: FooterProps) {
  const branches = [
    { name: 'Computer Engineering', slug: 'computer-engineering' },
    { name: 'Information Technology', slug: 'information-technology' },
    { name: 'AI & Data Science', slug: 'artificial-intelligence-and-data-science' },
    { name: 'Electronics & Tele-Comm', slug: 'electronics-and-tele-communication' },
    { name: 'Electrical Engineering', slug: 'electrical-engineering' },
    { name: 'Mechanical Engineering', slug: 'mechanical-engineering' },
    { name: 'Civil Engineering', slug: 'civil-engineering' },
  ];

  const legalPolicies = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-and-conditions' },
    { name: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { name: 'Digital Delivery Policy', href: '/digital-delivery-policy' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'University Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-white p-1">
                <Image
                  src="/logo.png"
                  alt="AbhyasMitra Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  NotesBazaar
                </span>
                <span className="text-xs font-semibold text-amber-400 tracking-wider">
                  by AbhyasMitra
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The dedicated academic notes marketplace for SPPU engineering students. Discover verified, exam-oriented study material organized branch-wise, year-wise, and subject-wise for the SPPU 2024 Pattern.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Digital Access · Secure Razorpay Checkout</span>
            </div>
          </div>

          {/* Branches */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Engineering Branches
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {branches.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/branches/${b.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/notes" className="hover:text-amber-400 transition-colors">
                  All Notes Catalog
                </Link>
              </li>
              <li>
                <Link href="/branches" className="hover:text-amber-400 transition-colors">
                  Branches Overview
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-amber-400 transition-colors">
                  Student Offers & Coupons
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About AbhyasMitra
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Policies & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {legalPolicies.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="hover:text-amber-400 transition-colors">
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCookieSettings) onOpenCookieSettings();
                    else {
                      const evt = new CustomEvent('openCookieSettings');
                      window.dispatchEvent(evt);
                    }
                  }}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Independent Resource Disclaimer (Mandatory Requirement) */}
        <div className="pt-8 pb-6 border-b border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/60">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Independent Academic Resource Disclaimer: </strong>
              NotesBazaar by AbhyasMitra is an independent online learning and notes distribution platform created to support engineering students. NotesBazaar and AbhyasMitra are not affiliated with, endorsed by, or officially associated with Savitribai Phule Pune University (SPPU) or any affiliated college. All syllabus references, subject codes, and pattern names (including the SPPU 2024 Pattern) are used purely for accurate identification and educational guidance under fair use.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NotesBazaar by AbhyasMitra. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Crafted for SPPU Engineering Students</span>
            <span>•</span>
            <span className="text-slate-400">Strictly Verified Academic Records</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

