'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, Branch, AcademicYear } from '@/lib/types';
import { Edit, Trash2, Eye, Search, AlertCircle, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface NotesListClientProps {
  initialProducts: Product[];
  branches: Branch[];
  academicYears: AcademicYear[];
}

export default function NotesListClient({
  initialProducts,
  branches,
  academicYears,
}: NotesListClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (selectedBranch && p.branch_id !== selectedBranch) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return p.title.toLowerCase().includes(q) || p.short_description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleComingSoon = async (product: Product) => {
    setUpdatingId(product.id);
    const newValue = !product.is_coming_soon;

    try {
      const res = await fetch('/api/admin/notes/toggle-coming-soon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          isComingSoon: newValue,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_coming_soon: newValue } : p))
        );
        toast.success(
          `Product "${product.title}" is now ${newValue ? 'marked as COMING SOON' : 'READY TO BUY'}.`
        );
      } else {
        toast.error('Failed to update Coming Soon status.');
      }
    } catch {
      toast.error('Network error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success('Note removed from catalog.');
      } else {
        toast.error('Could not delete note.');
      }
    } catch {
      toast.error('Error deleting note.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Title & Branch</th>
                <th className="py-3 px-5">Year / Pattern</th>
                <th className="py-3 px-5">Price (INR)</th>
                <th className="py-3 px-5">Publication</th>
                <th className="py-3 px-5">Coming Soon Toggle</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900 block line-clamp-1">
                      {product.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        {product.branch_name || 'Engineering'} · {product.file_format} Document
                        {product.file_size_bytes && product.file_size_bytes > 0
                          ? ` (${(product.file_size_bytes / (1024 * 1024)).toFixed(2)} MB)`
                          : ''}
                      </span>
                      {(!product.file_size_bytes || product.file_size_bytes <= 0) && !product.is_coming_soon && (
                        <Link
                          href={`/admin/notes/${product.id}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-[10px] font-bold transition-colors"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>No PDF Attached — Click to Upload</span>
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-slate-700 font-semibold block">
                      {product.year_name || 'Year'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">SPPU 2024</span>
                  </td>
                  <td className="py-4 px-5 font-black text-slate-950">
                    ₹{(product.price_in_paise / 100).toFixed(0)}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        product.publication_status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.publication_status === 'draft'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.publication_status}
                    </span>
                  </td>

                  {/* Mandated Coming Soon Toggle Button */}
                  <td className="py-4 px-5">
                    <button
                      onClick={() => handleToggleComingSoon(product)}
                      disabled={updatingId === product.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                        product.is_coming_soon
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {product.is_coming_soon ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-amber-600" />
                          <span>COMING SOON: ON</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Purchasable: OFF</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-5 text-right space-x-2">
                    <Link
                      href={`/notes/${product.slug}`}
                      target="_blank"
                      title="View live page"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 inline-block hover:bg-slate-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/admin/notes/${product.id}/edit`}
                      title="Edit note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 inline-block hover:bg-amber-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      title="Delete note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 inline-block hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

