import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import NotesCatalogClient from './NotesCatalogClient';

export const metadata: Metadata = {
  title: 'Browse SPPU Engineering Notes | NotesBazaar by AbhyasMitra',
  description:
    'Browse and search verified SPPU 2024 Pattern engineering notes by branch, year, subject, and syllabus unit. Instant digital access.',
  alternates: {
    canonical: '/notes',
  },
};

export const dynamic = 'force-dynamic';

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const branchParam = typeof resolvedParams.branch === 'string' ? resolvedParams.branch : undefined;
  const yearParam = typeof resolvedParams.year === 'string' ? resolvedParams.year : undefined;
  const qParam = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;

  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();
  const { products } = await db.getProducts({
    branch_slug: branchParam,
    year_slug: yearParam,
    search: qParam,
    status: 'published',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Browse Notes Catalog
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          SPPU 2024 Pattern curriculum notes across all branches and academic years
        </p>
      </div>

      <NotesCatalogClient
        initialProducts={products}
        branches={branches}
        academicYears={academicYears}
        initialBranch={branchParam || ''}
        initialYear={yearParam || ''}
        initialQuery={qParam || ''}
      />
    </div>
  );
}

