'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Branch, AcademicYear, Pattern } from '@/lib/types';
import { Save, ArrowLeft, Upload, FileText, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface NoteEditorFormProps {
  initialProduct?: Product;
  branches: Branch[];
  academicYears: AcademicYear[];
  patterns: Pattern[];
}

export default function NoteEditorForm({
  initialProduct,
  branches,
  academicYears,
  patterns,
}: NoteEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [branchId, setBranchId] = useState(initialProduct?.branch_id || branches[0]?.id || '');
  const [yearId, setYearId] = useState(initialProduct?.year_id || academicYears[0]?.id || '');
  const [patternId, setPatternId] = useState(initialProduct?.pattern_id || patterns[0]?.id || 'pat_2024');
  const [priceRupees, setPriceRupees] = useState(
    initialProduct ? (initialProduct.price_in_paise / 100).toString() : '79'
  );
  const [comparePriceRupees, setComparePriceRupees] = useState(
    initialProduct?.compare_at_price_in_paise
      ? (initialProduct.compare_at_price_in_paise / 100).toString()
      : ''
  );
  const [publicationStatus, setPublicationStatus] = useState<Product['publication_status']>(
    initialProduct?.publication_status || 'published'
  );
  const [isComingSoon, setIsComingSoon] = useState<boolean>(
    initialProduct?.is_coming_soon || false
  );
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialProduct?.full_description || '');
  const [topicsText, setTopicsText] = useState(
    initialProduct?.topics_covered?.join('\n') || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !priceRupees) {
      toast.error('Title, slug, and price are required.');
      return;
    }

    setSaving(true);
    try {
      const topicsArray = topicsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const pricePaise = Math.round(parseFloat(priceRupees) * 100);
      const comparePricePaise = comparePriceRupees
        ? Math.round(parseFloat(comparePriceRupees) * 100)
        : null;

      const payload = {
        title,
        slug,
        branch_id: branchId,
        year_id: yearId,
        subject_id: 'sub_' + slug.substring(0, 10),
        pattern_id: patternId,
        short_description: shortDesc,
        full_description: fullDesc,
        topics_covered: topicsArray,
        price_in_paise: pricePaise,
        compare_at_price_in_paise: comparePricePaise,
        publication_status: publicationStatus,
        is_coming_soon: isComingSoon,
        is_available: !isComingSoon,
        file_format: 'PDF',
      };

      const url = isEditing
        ? `/api/admin/notes/${initialProduct?.id}`
        : '/api/admin/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save note.');
        setSaving(false);
        return;
      }

      toast.success(isEditing ? 'Note updated successfully!' : 'Note published to catalog!');
      router.push('/admin/notes');
      router.refresh();
    } catch {
      toast.error('Error saving note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Core Catalog Fields */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Catalog & Identity
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures and Algorithms Complete Notes"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. data-structures-and-algorithms-se-comp"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-mono focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Branch *</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Year *</label>
              <select
                value={yearId}
                onChange={(e) => setYearId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Pattern *</label>
              <select
                value={patternId}
                onChange={(e) => setPatternId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                {patterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Mandatory Coming Soon Control */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Pricing & Availability Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Selling Price (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="79"
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Original Compare-at Price (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="129"
                  value={comparePriceRupees}
                  onChange={(e) => setComparePriceRupees(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Coming Soon Toggle Box */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950 text-xs">
                  Coming Soon Toggle (Purchases Disabled)
                </span>
                {isComingSoon && (
                  <span className="pill-badge pill-badge-yellow text-[10px]">
                    COMING SOON ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1 max-w-lg leading-relaxed">
                When enabled (ON), this note will be clearly labeled with a &quot;COMING SOON!&quot; badge on the storefront. Purchases and order creation will be strictly disabled both in the UI and on the server until toggled off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsComingSoon(!isComingSoon)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 flex-shrink-0 ${
                isComingSoon
                  ? 'bg-amber-400 text-slate-950 border border-amber-500'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {isComingSoon ? (
                <>
                  <ToggleRight className="w-5 h-5 text-slate-950" />
                  <span>Coming Soon: ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span>Purchasable: OFF</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Publication Status
            </label>
            <select
              value={publicationStatus}
              onChange={(e) => setPublicationStatus(e.target.value as any)}
              className="w-full sm:w-60 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="published">Published (Visible in Catalog)</option>
              <option value="draft">Draft (Hidden from Students)</option>
              <option value="archived">Archived (Decommissioned)</option>
            </select>
          </div>
        </div>

        {/* Descriptions & Topics */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Description & Syllabus Topics
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Short Summary Description
            </label>
            <input
              type="text"
              placeholder="e.g. Concise exam-focused chapter notes covering Units 1 to 6 for SPPU 2024 Pattern."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Full Description & Study Guide Overview
            </label>
            <textarea
              rows={4}
              placeholder="Detailed breakdown of what is included, exam question patterns, diagrams, proofs..."
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Syllabus Units Covered (One per line)
            </label>
            <textarea
              rows={5}
              placeholder="Unit 1: Introduction to Data Structures&#10;Unit 2: Linear Data Structures: Stacks and Queues&#10;Unit 3: Trees and Binary Search Trees..."
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 font-mono text-[11px] focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>
        </div>

        {/* PDF File Upload */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Document File (Private Storage)
          </h2>

          <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2 hover:border-amber-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-900">
              {selectedFile ? selectedFile.name : 'Choose note PDF to upload'}
            </p>
            <p className="text-[11px] text-slate-400">
              Strictly PDF format only. File signature will be verified server-side.
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Note...' : isEditing ? 'Update Note' : 'Publish Note'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

