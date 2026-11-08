import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Target, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | NotesBazaar by AbhyasMitra',
  description:
    'Learn about NotesBazaar by AbhyasMitra — dedicated academic notes marketplace for SPPU engineering students under the 2024 Pattern.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center space-y-3">
        <div className="relative h-14 w-14 mx-auto mb-3 overflow-hidden rounded-2xl bg-white p-1 border border-slate-100 shadow-sm">
          <Image src="/logo.png" alt="AbhyasMitra Logo" fill className="object-contain" priority />
        </div>
        <span className="pill-badge pill-badge-yellow">Our Mission</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          About NotesBazaar by AbhyasMitra
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Built by engineers for engineers. Providing high-yield, structured, and exam-oriented academic study notes for Savitribai Phule Pune University engineering students.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-950">Why NotesBazaar Was Created</h2>
          <p className="mt-2 text-slate-600">
            With the introduction of the <strong>SPPU 2024 Pattern</strong>, engineering curricula across Computer, Information Technology, AI & Data Science, E&TC, Electrical, Mechanical, and Civil streams underwent significant updates. Engineering students often struggle to find authentic, clean, unit-wise notes that map directly to the newly introduced course objectives and in-semester exam structures.
          </p>
          <p className="mt-2 text-slate-600">
            NotesBazaar was built as an official initiative of <strong>AbhyasMitra</strong> to solve this exact problem: providing students with a transparent, safe, and curated platform where verified academic notes can be acquired and accessed with complete confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs text-slate-900">Strictly 2024 Pattern Aligned</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every note product is labeled with its respective academic year, subject code, and syllabus unit boundaries.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-xs text-slate-900">Truthful & Secure Access</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              No fabricated reviews or fake ratings. Verified Razorpay checkout with instant digital delivery to your personal student account.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-black text-slate-950">Independent Academic Resource Notice</h2>
          <p className="mt-2 text-slate-600 text-xs">
            NotesBazaar and AbhyasMitra are independent student educational services. We are not officially affiliated with, endorsed by, or sponsored by Savitribai Phule Pune University (SPPU) or any government entity. All syllabus outlines and subject titles are cited for reference and academic study purposes under fair dealing principles.
          </p>
        </div>
      </div>
    </div>
  );
}

