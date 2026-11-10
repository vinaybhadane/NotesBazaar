import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  Laptop,
  Globe,
  Cpu,
  Radio,
  Zap,
  Settings,
  Building,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'SPPU Engineering Branches | NotesBazaar by AbhyasMitra',
  description:
    'Explore SPPU 2024 Pattern notes across Computer, IT, AI & Data Science, E&TC, Electrical, Mechanical, and Civil Engineering.',
  alternates: {
    canonical: '/branches',
  },
};

export default async function BranchesOverviewPage() {
  const branches = await db.getBranches();

  const getBranchIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-7 h-7 text-slate-800" />;
      case 'Globe':
        return <Globe className="w-7 h-7 text-slate-800" />;
      case 'Cpu':
        return <Cpu className="w-7 h-7 text-slate-800" />;
      case 'Radio':
        return <Radio className="w-7 h-7 text-slate-800" />;
      case 'Zap':
        return <Zap className="w-7 h-7 text-slate-800" />;
      case 'Settings':
        return <Settings className="w-7 h-7 text-slate-800" />;
      case 'Building':
        return <Building className="w-7 h-7 text-slate-800" />;
      default:
        return <BookOpen className="w-7 h-7 text-slate-800" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          SPPU Engineering Branches
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium max-w-2xl">
          Curriculum-aligned academic notes for Second Year (SE) and Third Year (TE) students under the SPPU 2024 Pattern.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(async (branch) => {
          const { total } = await db.getProducts({ branch_slug: branch.slug });

          return (
            <div
              key={branch.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {getBranchIcon(branch.icon_name)}
                  </div>
                  <span className="pill-badge pill-badge-yellow">
                    {total} {total === 1 ? 'Note' : 'Notes'} Available
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-950 hover:text-amber-600 transition-colors">
                  <Link href={`/branches/${branch.slug}`}>{branch.name}</Link>
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {branch.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <Link
                    href={`/branches/${branch.slug}/second-year`}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80"
                  >
                    SE Notes
                  </Link>
                  <Link
                    href={`/branches/${branch.slug}/third-year`}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80"
                  >
                    TE Notes
                  </Link>
                </div>

                <Link
                  href={`/branches/${branch.slug}`}
                  className="w-8 h-8 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white flex items-center justify-center transition-all"
                  aria-label={`Explore ${branch.name}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

