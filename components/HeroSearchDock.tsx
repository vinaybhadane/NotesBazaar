'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, BookOpen, Layers, Calendar, Sparkles } from 'lucide-react';
import { Branch } from '@/lib/types';

interface HeroSearchDockProps {
  branches: Branch[];
}

export default function HeroSearchDock({ branches }: HeroSearchDockProps) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedBranch) params.set('branch', selectedBranch);
    if (selectedYear) params.set('year', selectedYear);
    router.push(`/notes?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-3xl sm:rounded-full border border-slate-200/90 shadow-xl p-3 sm:p-2.5 transition-all hover:border-slate-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center">
        {/* Branch Selector */}
        <div className="flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
          <label className="block text-[11px] font-bold text-slate-900 tracking-wide">
            Branch
          </label>
          <div className="relative mt-0.5">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer"
            >
              <option value="">All Engineering Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
          <label className="block text-[11px] font-bold text-slate-900 tracking-wide">
            Academic Year
          </label>
          <div className="relative mt-0.5">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer"
            >
              <option value="">SE & TE (All Years)</option>
              <option value="second-year">Second Year (SE)</option>
              <option value="third-year">Third Year (TE)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Pattern (Fixed for SPPU 2024 Pattern) */}
        <div className="hidden md:block flex-1 px-4 py-2 border-r border-slate-100">
          <label className="block text-[11px] font-bold text-slate-900 tracking-wide">
            Pattern
          </label>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-800">SPPU 2024</span>
          </div>
        </div>

        {/* Keyword Search Input */}
        <div className="flex-[1.5] px-4 py-2">
          <label className="block text-[11px] font-bold text-slate-900 tracking-wide">
            Subject / Keyword
          </label>
          <input
            type="text"
            placeholder="e.g. Data Structures, TOC, DBMS"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full text-xs font-medium text-slate-700 bg-transparent placeholder:text-slate-400 focus:outline-none mt-0.5"
          />
        </div>

        {/* Action Button: Circular Black button with Search Icon (matching SkyBound reference) */}
        <div className="pt-2 sm:pt-0 sm:pr-1 flex items-center justify-end">
          <button
            type="submit"
            aria-label="Search notes"
            className="w-12 h-12 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white flex items-center justify-center transition-all duration-200 shadow-md flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </form>
  );
}

