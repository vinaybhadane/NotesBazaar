'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Branch, AcademicYear, Pattern, Subject } from '@/lib/types';
import { Save, Upload, FileText, ToggleLeft, ToggleRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface NoteEditorFormProps {
  initialProduct?: Product;
  branches: Branch[];
  academicYears: AcademicYear[];
  patterns: Pattern[];
  subjects?: Subject[];
}

export default function NoteEditorForm({
  initialProduct,
  branches,
  academicYears,
  patterns,
  subjects = [],
}: NoteEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [subjectName, setSubjectName] = useState(initialProduct?.subject_name || '');
  const [branchId, setBranchId] = useState(initialProduct?.branch_id || branches[0]?.id || 'br_comp');
  const [yearId, setYearId] = useState(initialProduct?.year_id || academicYears[0]?.id || 'yr_se');
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
  const [pageCount, setPageCount] = useState(initialProduct?.page_count?.toString() || '65');
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialProduct?.full_description || '');
  const [topicsText, setTopicsText] = useState(
    initialProduct?.topics_covered?.join('\n') || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  // Auto-generate slug and prefill subject from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
      if (!subjectName) {
        // e.g. "Data Structures and Algorithms Notes" -> "Data Structures and Algorithms"
        const cleanSub = val.replace(/\s+(notes|complete notes|handbook|guide|unit\s*\d.*)$/i, '').trim();
        setSubjectName(cleanSub);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !priceRupees.trim()) {
      toast.error('Title, slug, and price are required.');
      return;
    }

    const priceNum = parseFloat(priceRupees);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price in INR.');
      return;
    }

    setSaving(true);
    setUploadStatusMsg(selectedFile ? 'Uploading PDF file to secure storage & saving note...' : 'Saving note to catalog...');

    try {
      const topicsArray = topicsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const pricePaise = Math.round(priceNum * 100);
      const comparePricePaise = comparePriceRupees
        ? Math.round(parseFloat(comparePriceRupees) * 100)
        : null;

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('slug', slug.trim());
      formData.append('branch_id', branchId);
      formData.append('year_id', yearId);
      formData.append('pattern_id', patternId);
      formData.append('subject_name', subjectName.trim() || title.trim());
      formData.append('price_in_paise', pricePaise.toString());
      if (comparePricePaise !== null) {
        formData.append('compare_at_price_in_paise', comparePricePaise.toString());
      }
      formData.append('publication_status', publicationStatus);
      formData.append('is_coming_soon', isComingSoon ? 'true' : 'false');
      formData.append('short_description', shortDesc.trim());
      formData.append('full_description', fullDesc.trim());
      formData.append('topics_covered', JSON.stringify(topicsArray));
      formData.append('page_count', (parseInt(pageCount, 10) || 65).toString());

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = isEditing
        ? `/api/admin/notes/${initialProduct?.id}`
        : '/api/admin/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
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
    } catch (err: any) {
      console.error('[NoteEditorForm Save Error]:', err);
      toast.error(err.message || 'Error saving note.');
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

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              list="sppu-subjects-list"
              placeholder="e.g. Data Structures and Algorithms, Object Oriented Programming, Mathematics III"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 font-medium"
            />
            {subjects && subjects.length > 0 && (
              <datalist id="sppu-subjects-list">
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Type or pick a subject. Will be automatically registered in the SPPU curriculum hierarchy.
            </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Page Count
              </label>
              <input
                type="number"
                min="1"
                placeholder="65"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
              />
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

          {isEditing && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Existing note PDF is securely stored. Upload a new file below only to replace it.</span>
              </span>
              {initialProduct?.file_size_bytes && (
                <span className="font-mono text-[11px] text-slate-400 font-medium">
                  {formatFileSize(initialProduct.file_size_bytes)}
                </span>
              )}
            </div>
          )}

          <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2 hover:border-amber-400 transition-colors bg-slate-50/50">
            {selectedFile ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] font-mono text-emerald-600 font-semibold">
                  {formatFileSize(selectedFile.size)} ready to upload
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-900">
                  {isEditing ? 'Click to select a new PDF to replace current document' : 'Choose note PDF to upload'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Strictly PDF format only. File signature will be verified server-side.
                </p>
              </>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 cursor-pointer pt-2"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {saving && uploadStatusMsg && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                {uploadStatusMsg}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditing ? 'Updating Note...' : 'Publishing Note...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Note' : 'Publish Note'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
