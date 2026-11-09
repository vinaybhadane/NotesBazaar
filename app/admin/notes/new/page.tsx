import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import NoteEditorForm from '../NoteEditorForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Note | Admin NotesBazaar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewNotePage() {
  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();
  const patterns = await db.getPatterns();
  const subjects = await db.getSubjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Add New Note</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Publish a new curriculum study guide for SPPU 2024 Pattern engineering students
        </p>
      </div>

      <NoteEditorForm
        branches={branches}
        academicYears={academicYears}
        patterns={patterns}
        subjects={subjects}
      />
    </div>
  );
}
