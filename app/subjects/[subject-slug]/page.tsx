import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import NoteCard from '@/components/NoteCard';

interface SubjectPageProps {
  params: Promise<{ 'subject-slug': string }>;
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const resolved = await params;
  const subject = await db.getSubjectBySlug(resolved['subject-slug']);
  if (!subject) return { title: 'Subject Not Found' };

  return {
    title: `${subject.name} Notes – SPPU 2024 Pattern | NotesBazaar`,
    description: `Complete study material and revision notes for ${subject.name} under SPPU 2024 Pattern. Unit-wise breakdowns and question solutions.`,
    alternates: {
      canonical: `/subjects/${subject.slug}`,
    },
  };
}

export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  const resolved = await params;
  const subject = await db.getSubjectBySlug(resolved['subject-slug']);

  if (!subject) {
    notFound();
  }

  const { products } = await db.getProducts({
    subject_slug: subject.slug,
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
        <Link href="/notes" className="hover:text-slate-900">
          Subjects
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{subject.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <span className="pill-badge pill-badge-yellow">SPPU 2024 Pattern</span>
          {subject.code && (
            <span className="pill-badge pill-badge-gray">Code: {subject.code}</span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {subject.name} Notes
        </h1>

        {subject.description && (
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {subject.description}
          </p>
        )}
      </div>

      {/* Notes list */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 mb-6">
          Related Notes ({products.length})
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <NoteCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            Notes for this subject are currently being reviewed and formatted. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}

