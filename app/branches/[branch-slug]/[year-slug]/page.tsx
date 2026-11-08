import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import NoteCard from '@/components/NoteCard';

interface YearPageProps {
  params: Promise<{
    'branch-slug': string;
    'year-slug': string;
  }>;
}

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
  const resolved = await params;
  const branch = await db.getBranchBySlug(resolved['branch-slug']);
  const year = await db.getYearBySlug(resolved['year-slug']);

  if (!branch || !year) return { title: 'Not Found' };

  return {
    title: `${year.name} ${branch.name} Notes – SPPU 2024 Pattern | NotesBazaar`,
    description: `Download verified ${year.name} ${branch.name} notes for the SPPU 2024 Pattern. Unit-wise diagrams, solved questions, and exam revision guides.`,
    alternates: {
      canonical: `/branches/${branch.slug}/${year.slug}`,
    },
  };
}

export default async function BranchYearPage({ params }: YearPageProps) {
  const resolved = await params;
  const branch = await db.getBranchBySlug(resolved['branch-slug']);
  const year = await db.getYearBySlug(resolved['year-slug']);

  if (!branch || !year) {
    notFound();
  }

  const { products } = await db.getProducts({
    branch_slug: branch.slug,
    year_slug: year.slug,
    status: 'published',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium flex items-center gap-2">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/branches" className="hover:text-slate-900">
          Branches
        </Link>
        <span>/</span>
        <Link href={`/branches/${branch.slug}`} className="hover:text-slate-900">
          {branch.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{year.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <span className="pill-badge pill-badge-yellow">SPPU 2024 Pattern</span>
          <span className="pill-badge pill-badge-gray">{branch.name}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {year.name} {branch.name} Notes
        </h1>

        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          High-yield notes covering all curriculum units for {year.name} students under the revised 2024 Pattern syllabus.
        </p>
      </div>

      {/* Notes Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 mb-6">
          Available Notes ({products.length})
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <NoteCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            No notes currently published for this year. New study materials are being added regularly.
          </div>
        )}
      </div>
    </div>
  );
}

