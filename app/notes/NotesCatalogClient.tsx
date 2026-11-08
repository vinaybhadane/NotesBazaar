'use client';

import React, { useState, useMemo } from 'react';
import { Product, Branch, AcademicYear } from '@/lib/types';
import NoteCard from '@/components/NoteCard';
import { Search, Filter, X, SlidersHorizontal, BookOpen } from 'lucide-react';

interface NotesCatalogClientProps {
  initialProducts: Product[];
  branches: Branch[];
  academicYears: AcademicYear[];
  initialBranch: string;
  initialYear: string;
  initialQuery: string;
}

export default function NotesCatalogClient({
  initialProducts,
  branches,
  academicYears,
  initialBranch,
  initialYear,
  initialQuery,
}: NotesCatalogClientProps) {
  const [search, setSearch] = useState(initialQuery);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'ready' | 'coming_soon'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'title'>('newest');

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Branch filter
    if (selectedBranch) {
      result = result.filter((p) => {
        const br = branches.find((b) => b.slug === selectedBranch);
        return br ? p.branch_id === br.id : true;
      });
    }

    // Year filter
    if (selectedYear) {
      result = result.filter((p) => {
        const yr = academicYears.find((y) => y.slug === selectedYear);
        return yr ? p.year_id === yr.id : true;
      });
    }

    // Availability filter
    if (selectedAvailability === 'ready') {
      result = result.filter((p) => !p.is_coming_soon && p.is_available);
    } else if (selectedAvailability === 'coming_soon') {
      result = result.filter((p) => p.is_coming_soon);
    }

    // Keyword search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.topics_covered.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price_in_paise - b.price_in_paise);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price_in_paise - a.price_in_paise);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [initialProducts, branches, academicYears, selectedBranch, selectedYear, selectedAvailability, search, sortBy]);

  const hasActiveFilters = Boolean(
    search.trim() || selectedBranch || selectedYear || selectedAvailability !== 'all'
  );

  const clearAllFilters = () => {
    setSearch('');
    setSelectedBranch('');
    setSelectedYear('');
    setSelectedAvailability('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Dock */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Bar + Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by note title, subject, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-800"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            Filters:
          </span>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Academic Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.slug}>
                {y.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <div className="inline-flex rounded-full bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              onClick={() => setSelectedAvailability('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedAvailability === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedAvailability('ready')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedAvailability === 'ready'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ready to Buy
            </button>
            <button
              onClick={() => setSelectedAvailability('coming_soon')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedAvailability === 'coming_soon'
                  ? 'bg-[#FFE500] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Coming Soon
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 py-1 px-2.5 rounded-full hover:bg-red-50"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> notes
        </span>
        <span>Pattern: SPPU 2024</span>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <NoteCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No notes found matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search keywords, switching the branch or academic year filter, or resetting all filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2 text-xs font-bold text-slate-900 bg-[#FFE500] hover:bg-amber-400 rounded-full shadow-sm transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

