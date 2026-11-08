import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import NotesListClient from './NotesListClient';
import { PlusCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manage Notes Catalog | Admin NotesBazaar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNotesPage() {
  const { products } = await db.getProducts({ status: 'all' });
  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Notes Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic notes, pricing, availability, and the Coming Soon status
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Note</span>
        </Link>
      </div>

      <NotesListClient
        initialProducts={products}
        branches={branches}
        academicYears={academicYears}
      />
    </div>
  );
}

