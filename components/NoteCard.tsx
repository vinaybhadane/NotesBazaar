'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { FileText, Clock, Sparkles, Check, ArrowUpRight } from 'lucide-react';

interface NoteCardProps {
  product: Product;
}

export default function NoteCard({ product }: NoteCardProps) {
  const isComingSoon = product.is_coming_soon;
  const priceRupees = (product.price_in_paise / 100).toFixed(0);
  const compareRupees = product.compare_at_price_in_paise
    ? (product.compare_at_price_in_paise / 100).toFixed(0)
    : null;

  return (
    <div className="reference-card p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Meta Tags */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="pill-badge pill-badge-gray truncate max-w-[170px]">
            {product.branch_name || 'Engineering'}
          </span>

          {isComingSoon ? (
            <span className="pill-badge pill-badge-yellow animate-pulse">
              COMING SOON!
            </span>
          ) : (
            <span className="pill-badge pill-badge-cyan">
              {product.year_name || 'SPPU 2024'}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/notes/${product.slug}`} className="block">
          <h3 className="font-bold text-base text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Short description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {product.short_description}
        </p>

        {/* Topics preview */}
        {product.topics_covered && product.topics_covered.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Key Units Covered
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              {product.topics_covered.slice(0, 2).map((topic, i) => (
                <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="truncate text-[11px]">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Info: Format, Pages, Price & Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-950">₹{priceRupees}</span>
            {compareRupees && (
              <span className="text-xs text-slate-400 line-through">₹{compareRupees}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            {product.file_format} · {product.page_count || 50}+ Pages
          </span>
        </div>

        {isComingSoon ? (
          <Link
            href={`/notes/${product.slug}`}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            Details
          </Link>
        ) : (
          <Link
            href={`/notes/${product.slug}`}
            className="px-4 py-2 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <span>View Notes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

