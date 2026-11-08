import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import NoteCard from '@/components/NoteCard';
import { ArrowRight, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface BranchPageProps {
  params: Promise<{ 'branch-slug': string }>;
}

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const resolved = await params;
  const branch = await db.getBranchBySlug(resolved['branch-slug']);
  if (!branch) return { title: 'Branch Not Found' };

  return {
    title: `${branch.name} Notes – SPPU 2024 Pattern | NotesBazaar`,
    description: `Browse Second Year and Third Year ${branch.name} notes for the SPPU 2024 Pattern. Explore subject-wise study material on NotesBazaar by AbhyasMitra.`,
    alternates: {
      canonical: `/branches/${branch.slug}`,
    },
    openGraph: {
      title: `${branch.name} Notes – SPPU 2024 Pattern`,
      description: branch.description,
    },
  };
}

export default async function BranchDetailPage({ params }: BranchPageProps) {
  const resolved = await params;
  const branchSlug = resolved['branch-slug'];
  const branch = await db.getBranchBySlug(branchSlug);

  if (!branch) {
    notFound();
  }

  const { products } = await db.getProducts({
    branch_slug: branchSlug,
    status: 'published',
  });

  const subjects = await db.getSubjects({ branch_id: branch.id });

  const seProducts = products.filter((p) => p.year_id === 'yr_se');
  const teProducts = products.filter((p) => p.year_id === 'yr_te');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium flex items-center gap-2">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/branches" className="hover:text-slate-900">
          Branches
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{branch.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill-badge pill-badge-yellow">SPPU 2024 Pattern</span>
          <span className="pill-badge pill-badge-gray">Branch Code: {branch.code}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
          {branch.name} Notes
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {branch.description} Verified study material mapped directly to the SPPU 2024 Pattern syllabus.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/branches/${branch.slug}/second-year`}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-sm transition-all"
          >
            Second Year (SE) Notes →
          </Link>
          <Link
            href={`/branches/${branch.slug}/third-year`}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-sm transition-all"
          >
            Third Year (TE) Notes →
          </Link>
        </div>
      </div>

      {/* Second Year Notes Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Second Year (SE) Notes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester 3 & Semester 4 curriculum notes
            </p>
          </div>
          <Link
            href={`/branches/${branch.slug}/second-year`}
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            View SE Page →
          </Link>
        </div>

        {seProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seProducts.map((p) => (
              <NoteCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            SE notes for this branch are currently being prepared for the 2024 Pattern.
          </div>
        )}
      </section>

      {/* Third Year Notes Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Third Year (TE) Notes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester 5 & Semester 6 curriculum notes
            </p>
          </div>
          <Link
            href={`/branches/${branch.slug}/third-year`}
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            View TE Page →
          </Link>
        </div>

        {teProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teProducts.map((p) => (
              <NoteCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            TE notes for this branch are currently being prepared for the 2024 Pattern.
          </div>
        )}
      </section>

      {/* Branch Subjects List */}
      {subjects.length > 0 && (
        <section className="pt-6 border-t border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-950">Curriculum Subjects in {branch.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.slug}`}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors block">
                    {sub.name}
                  </span>
                  {sub.code && (
                    <span className="text-[10px] text-slate-400">Code: {sub.code}</span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

