import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import NoteEditorForm from '../../NoteEditorForm';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Note | Admin NotesBazaar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditNotePage({ params }: EditPageProps) {
  const resolved = await params;
  const product = await db.getProductById(resolved.id);

  if (!product) {
    notFound();
  }

  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();
  const patterns = await db.getPatterns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Edit Note</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Editing note: <span className="font-semibold text-slate-800">{product.title}</span>
        </p>
      </div>

      <NoteEditorForm
        initialProduct={product}
        branches={branches}
        academicYears={academicYears}
        patterns={patterns}
      />
    </div>
  );
}
