import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import HeroSearchDock from '@/components/HeroSearchDock';
import NoteCard from '@/components/NoteCard';
import {
  Laptop,
  Globe,
  Cpu,
  Radio,
  Zap,
  Settings,
  Building,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  DownloadCloud,
  FileCheck2,
  HelpCircle,
  Tag,
} from 'lucide-react';

export const revalidate = 60; // Refresh public page cache every minute

export default async function HomePage() {
  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();
  const { products: featuredNotes } = await db.getProducts({
    status: 'published',
    limit: 6,
  });
  const activeBanners = await db.getActiveBanners();
  const activeOffers = await db.getActiveOffers();

  // Branch icon mapping helper
  const getBranchIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-6 h-6 text-slate-800" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-slate-800" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-slate-800" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-slate-800" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-slate-800" />;
      case 'Settings':
        return <Settings className="w-6 h-6 text-slate-800" />;
      case 'Building':
        return <Building className="w-6 h-6 text-slate-800" />;
      default:
        return <BookOpen className="w-6 h-6 text-slate-800" />;
    }
  };

  const badgeStyles = [
    'pill-badge-yellow',
    'pill-badge-peach',
    'pill-badge-cyan',
    'pill-badge-gray',
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* =========================================================================
          HERO SECTION (Directly inspired by SkyBound reference screenshot)
          ========================================================================= */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Soft abstract circular backdrop design */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-40">
          <div className="w-[650px] h-[650px] rounded-full border border-slate-200/80"></div>
          <div className="absolute w-[900px] h-[900px] rounded-full border border-slate-100"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-50/40 via-yellow-50/30 to-transparent blur-3xl"></div>
        </div>

        {/* Floating Accent Badges (like in reference screenshot) */}
        <div className="hidden lg:block absolute left-4 top-20 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-3 max-w-[220px]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-900 flex-shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-snug">SE Computer</p>
              <p className="text-[10px] text-slate-500">SPPU 2024 Pattern</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute right-4 top-24 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-3 max-w-[220px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-900 flex-shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-snug">Verified Syllabus</p>
              <p className="text-[10px] text-slate-500">Unit-wise & Exam Focused</p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.08]">
            Your SPPU Notes. <br />
            <span className="text-slate-900">One Smarter Place.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            Curriculum-aligned engineering notes for the SPPU 2024 Pattern. Organized branch-wise, year-wise, and subject-wise with instant verified access.
          </p>

          {/* Social Proof Pill (truthful, non-fake) */}
          <div className="pt-1 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/70 text-slate-700 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Updated for Second Year & Third Year SPPU 2024 Pattern</span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Floating Search Dock (matching SkyBound reference capsule) */}
        <div className="mt-10 max-w-4xl mx-auto">
          <HeroSearchDock branches={branches} />
        </div>
      </section>

      {/* =========================================================================
          BRANCH CATEGORIES SECTION (Matching "Select Category" in reference image)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Select Branch
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Explore subject-wise study material across all SPPU engineering branches
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notes"
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center gap-1.5"
            >
              View All Notes
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="w-9 h-9 rounded-full bg-[#FFE500] text-slate-950 flex items-center justify-center shadow-sm">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Row of Horizontal Rounded Cards (Matching SkyBound Category Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {branches.map((branch, idx) => {
            const badgeClass = badgeStyles[idx % badgeStyles.length];
            const badgeLabel = idx === 0 ? 'Top Choice' : idx === 1 ? 'Trending' : idx === 2 ? 'New Pattern' : 'Core Branch';

            return (
              <Link
                key={branch.id}
                href={`/branches/${branch.slug}`}
                className="group p-5 bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#FFE500]/20 transition-colors">
                      {getBranchIcon(branch.icon_name)}
                    </div>
                    <span className={`pill-badge ${badgeClass}`}>{badgeLabel}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {branch.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">SE & TE</span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          ACTIVE OFFERS & BANNERS (Real DB Records)
          ========================================================================= */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-[#FFE500] to-yellow-300 text-slate-950 shadow-sm border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                Special Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {activeOffers[0].title}
              </h3>
              <p className="text-sm font-medium text-slate-900 max-w-xl">
                {activeOffers[0].description} Use code{' '}
                <span className="font-extrabold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {activeOffers[0].code}
                </span>{' '}
                at checkout.
              </p>
            </div>

            <Link
              href="/notes"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-md whitespace-nowrap transition-all"
            >
              Redeem Discount Now
            </Link>
          </div>
        </section>
      )}

      {/* =========================================================================
          FEATURED & RECENT NOTES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Curriculum Notes
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Verified chapter notes with diagrams, algorithm traces, and previous SPPU question analysis
            </p>
          </div>

          <Link
            href="/notes"
            className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1"
          >
            All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNotes.map((note) => (
              <NoteCard key={note.id} product={note} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No notes published yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon as new notes for SPPU 2024 Pattern are being published.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          HOW IT WORKS (4 Step Transparent Journey)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              How NotesBazaar Works
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Straightforward, safe, and transparent digital academic access for engineering students
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Find Your Subject</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by your branch (Computer, IT, AIDS, etc.) and year (SE or TE) for the SPPU 2024 Pattern.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Inspect Note Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review covered topics, syllabus units, page count, and clear Coming Soon availability status.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Pay Securely</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay using UPI, Debit/Credit Card, or NetBanking via the verified Razorpay gateway.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-black text-sm">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">Instant Download</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Server immediately verifies the payment and provides permanent download access in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ PREVIEW SECTION
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Common questions about note formats, payments, and syllabus updates
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Are these notes strictly updated for the SPPU 2024 Pattern?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Yes. All our academic materials are organized specifically around the revised SPPU 2024 Pattern curriculum for Second Year (SE) and Third Year (TE).
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              How do I receive my notes after completing the payment?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Delivery is 100% digital and immediate. Once Razorpay verifies the payment on our server, the note is unlocked in your account under &quot;My Downloads&quot; for instant access.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              What does the &quot;Coming Soon!&quot; badge mean?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Notes marked with &quot;Coming Soon!&quot; are currently being compiled or reviewed by subject matter experts. They cannot be purchased yet and checkout is strictly disabled until the final document is published.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-xs font-bold text-slate-800 hover:text-amber-600 underline"
          >
            Read all frequently asked questions →
          </Link>
        </div>
      </section>
    </div>
  );
}

