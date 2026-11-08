import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Layers, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Catalog Structure | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminBranchesPage() {
  const branches = await db.getBranches();
  const academicYears = await db.getAcademicYears();
  const patterns = await db.getPatterns();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Branches, Years & Patterns
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Curriculum hierarchy governing the SPPU 2024 Pattern notes marketplace
        </p>
      </div>

      {/* Engineering Branches */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-950">
            Seeded Engineering Branches ({branches.length})
          </h2>
          <span className="pill-badge pill-badge-yellow text-[10px]">All 7 Seeded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">{b.name}</span>
                <span className="text-[10px] text-slate-400">
                  Slug: /{b.slug} · Code: {b.code}
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Academic Years & Pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-950">Configured Academic Years</h2>
          <div className="space-y-2">
            {academicYears.map((y) => (
              <div
                key={y.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs"
              >
                <span className="font-bold text-slate-800">{y.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">/{y.slug}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            First Year (FE) and Final Year (BE) can be enabled via database seed when needed.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-950">Active Syllabus Pattern</h2>
          <div className="space-y-2">
            {patterns.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex justify-between items-center text-xs"
              >
                <span className="font-bold text-amber-950">{p.name}</span>
                <span className="pill-badge pill-badge-yellow text-[10px]">Introduced {p.year_introduced}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            Pattern is stored as structured product metadata, enabling multi-pattern coexistence.
          </p>
        </div>
      </div>
    </div>
  );
}

