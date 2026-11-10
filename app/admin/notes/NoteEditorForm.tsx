'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Branch, AcademicYear, Pattern, Subject, ProductFile } from '@/lib/types';
import {
  Save,
  Upload,
  FileText,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle2,
  Database,
  Trash2,
  Search,
  X,
  Check,
  Plus,
  ImageIcon,
} from 'lucide-react';
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
  const [thumbnailUrl, setThumbnailUrl] = useState(initialProduct?.thumbnail_url || '');
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Multi-note purchase bundle management
  const [existingFiles, setExistingFiles] = useState<ProductFile[]>([]);
  const [selectedDbFiles, setSelectedDbFiles] = useState<Array<{
    id: string;
    original_filename: string;
    file_size_bytes: number;
    product_title?: string;
  }>>([]);
  const [newUploadFiles, setNewUploadFiles] = useState<File[]>([]);

  // Database notes selector modal states
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [availableDbFiles, setAvailableDbFiles] = useState<Array<{
    id: string;
    original_filename: string;
    file_size_bytes: number;
    product_title?: string;
    created_at: string;
  }>>([]);
  const [loadingDbFiles, setLoadingDbFiles] = useState(false);
  const [dbSearchTerm, setDbSearchTerm] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  // Load existing attached notes when editing
  useEffect(() => {
    if (initialProduct?.id) {
      fetch(`/api/admin/notes/${initialProduct.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.files && Array.isArray(data.files)) {
            setExistingFiles(data.files);
          }
        })
        .catch((e) => console.warn('Failed to load note files:', e));
    }
  }, [initialProduct?.id]);

  // Open modal and fetch all files across DB
  const handleOpenDbModal = async () => {
    setIsDbModalOpen(true);
    setLoadingDbFiles(true);
    try {
      const res = await fetch('/api/admin/files');
      if (res.ok) {
        const data = await res.json();
        setAvailableDbFiles(data.files || []);
      }
    } catch {
      toast.error('Failed to load files from database.');
    } finally {
      setLoadingDbFiles(false);
    }
  };

  const handleToggleDbFile = (file: typeof availableDbFiles[0]) => {
    const isAlreadyAttached = existingFiles.some((f) => f.id === file.id);
    if (isAlreadyAttached) {
      toast.info('This note is already attached to this product.');
      return;
    }
    const isSelected = selectedDbFiles.some((f) => f.id === file.id);
    if (isSelected) {
      setSelectedDbFiles((prev) => prev.filter((f) => f.id !== file.id));
    } else {
      setSelectedDbFiles((prev) => [...prev, file]);
    }
  };

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

  const cropTo16x9Image = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const targetWidth = 1280;
          const targetHeight = 720; // strict 16:9 ratio
          const targetAspect = 16 / 9;
          const srcAspect = img.width / img.height;

          let sx = 0;
          let sy = 0;
          let sw = img.width;
          let sh = img.height;

          if (srcAspect > targetAspect) {
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
          } else if (srcAspect < targetAspect) {
            sh = img.width / targetAspect;
            sy = (img.height - sh) / 2;
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objUrl);
            resolve(file);
            return;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objUrl);
              if (!blob) {
                resolve(file);
                return;
              }
              const baseName = file.name.replace(/\.[^.]+$/, '') || 'thumbnail';
              resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.9
          );
        } catch (err) {
          URL.revokeObjectURL(objUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        reject(new Error('Could not read thumbnail image.'));
      };
      img.src = objUrl;
    });
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumb(true);
    try {
      const croppedFile = await cropTo16x9Image(file);
      const fd = new FormData();
      fd.append('file', croppedFile);
      const res = await fetch('/api/admin/upload-thumbnail', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload thumbnail.');
        return;
      }
      setThumbnailUrl(data.url);
      toast.success('16:9 cover thumbnail uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Thumbnail upload failed.');
    } finally {
      setUploadingThumb(false);
    }
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

    const totalAttachedCount = existingFiles.length + selectedDbFiles.length + newUploadFiles.length;
    if (publicationStatus === 'published' && !isComingSoon && totalAttachedCount === 0) {
      toast.error(
        'Please upload or select at least one PDF document before publishing a purchasable note (or mark it as Coming Soon / Draft).'
      );
      return;
    }

    setSaving(true);
    const hasFilesToUpload = newUploadFiles.length > 0;
    setUploadStatusMsg(
      hasFilesToUpload
        ? `Uploading ${newUploadFiles.length} note document(s) to secure storage...`
        : 'Saving note configuration to catalog...'
    );

    try {
      const topicsArray = topicsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const pricePaise = Math.round(priceNum * 100);
      const comparePricePaise = comparePriceRupees
        ? Math.round(parseFloat(comparePriceRupees) * 100)
        : null;

      // Upload new PDF files directly to Azure Blob Storage via SAS URL when supported (supports >4.5MB files cleanly)
      const uploadedBlobs: Array<{
        blob_name: string;
        blob_container: string;
        original_filename: string;
        file_size_bytes: number;
        mime_type: string;
      }> = [];
      const fallbackFiles: File[] = [];

      for (let i = 0; i < newUploadFiles.length; i++) {
        const f = newUploadFiles[i];
        setUploadStatusMsg(`Uploading document ${i + 1} of ${newUploadFiles.length}: ${f.name}...`);

        // Validate PDF magic bytes client-side first
        const headText = await f.slice(0, 4).text();
        if (headText !== '%PDF') {
          toast.error(`"${f.name}" is not a valid PDF document.`);
          setSaving(false);
          return;
        }

        let uploadedDirectly = false;
        try {
          const sasRes = await fetch('/api/admin/upload-sas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: f.name,
              productId: initialProduct?.id || 'prod',
            }),
          });
          if (sasRes.ok) {
            const sasData = await sasRes.json();
            if (sasData.supported && sasData.uploadUrl) {
              const cleanFilename = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const putRes = await fetch(sasData.uploadUrl, {
                method: 'PUT',
                headers: {
                  'x-ms-blob-type': 'BlockBlob',
                  'Content-Type': 'application/pdf',
                  'x-ms-blob-content-type': 'application/pdf',
                  'x-ms-blob-content-disposition': `attachment; filename="${cleanFilename}"`,
                },
                body: f,
              });
              if (putRes.ok) {
                uploadedBlobs.push({
                  blob_name: sasData.blobName,
                  blob_container: sasData.container,
                  original_filename: f.name,
                  file_size_bytes: f.size,
                  mime_type: f.type || 'application/pdf',
                });
                uploadedDirectly = true;
              } else {
                console.warn('[NoteEditorForm] Direct Azure SAS PUT returned', putRes.status);
              }
            }
          }
        } catch (sasErr) {
          console.warn('[NoteEditorForm] Direct SAS upload fallback:', sasErr);
        }

        if (!uploadedDirectly) {
          if (f.size > 4 * 1024 * 1024) {
            toast.error(
              `Direct cloud upload failed for large PDF "${f.name}" (${formatFileSize(f.size)}). Please retry.`
            );
            setSaving(false);
            return;
          }
          fallbackFiles.push(f);
        }
      }

      setUploadStatusMsg('Finalizing note details & saving catalog record...');

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
      formData.append('thumbnail_url', thumbnailUrl.trim());

      if (uploadedBlobs.length > 0) {
        formData.append('uploaded_blobs', JSON.stringify(uploadedBlobs));
      }

      // Append any non-SAS fallback files
      for (const f of fallbackFiles) {
        formData.append('files', f);
      }

      // Append selected files from DB
      formData.append(
        'selected_file_ids',
        JSON.stringify(selectedDbFiles.map((f) => f.id))
      );

      // In edit mode, record which existing files were kept
      if (isEditing) {
        formData.append(
          'kept_file_ids',
          JSON.stringify(existingFiles.map((f) => f.id))
        );
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

        {/* 16:9 Cover Thumbnail for Notes / Important Questions */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
                16:9 Cover Thumbnail (Notes &amp; Question Papers)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a cover image (automatically fitted to crisp 16:9 widescreen ratio) displayed responsively on note cards and product pages.
              </p>
            </div>
            <label className="px-4 py-2 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto flex-shrink-0">
              {uploadingThumb ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>{uploadingThumb ? 'Uploading 16:9...' : 'Upload 16:9 Thumbnail'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingThumb}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleThumbnailUpload(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Live 16:9 Aspect Ratio Preview */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt="16:9 Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/80 hover:bg-red-600 text-white transition-colors shadow-sm cursor-pointer"
                    title="Remove Thumbnail"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/75 text-white text-[10px] font-bold">
                    16:9 Preview
                  </span>
                </>
              ) : (
                <div className="text-center p-4 space-y-1.5">
                  <ImageIcon className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-500">16:9 Thumbnail Preview</p>
                  <p className="text-[10px] text-slate-400">
                    Any uploaded image is automatically center-cropped to 1280×720 (16:9)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Or Paste Thumbnail Image URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://... or leave blank for auto-uploaded image"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-mono focus:bg-white focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Supports JPG, PNG, and WebP. All thumbnails automatically preserve responsive 16:9 framing across mobile, tablet, and desktop.
              </p>
            </div>
          </div>
        </div>

        {/* Document Files & Multi-Note Bundling (Single Purchase) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
                Document Files (Single Purchase Bundle)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin can add multiple notes inside a single purchase. Students who buy this product will get access to download all attached notes.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Option A: Upload New PDFs */}
              <label className="px-4 py-2 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New PDF(s)</span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const filesArray = Array.from(e.target.files);
                      const validPdfs: File[] = [];
                      for (const f of filesArray) {
                        const head = await f.slice(0, 4).text();
                        if (head !== '%PDF') {
                          toast.error(`Skipped "${f.name}" — only valid PDF files are accepted.`);
                        } else {
                          validPdfs.push(f);
                        }
                      }
                      if (validPdfs.length > 0) {
                        setNewUploadFiles((prev) => [...prev, ...validPdfs]);
                        toast.success(`Added ${validPdfs.length} PDF document(s) to upload queue`);
                      }
                      e.target.value = '';
                    }
                  }}
                />
              </label>

              {/* Option B: Select from Database Notes */}
              <button
                type="button"
                onClick={handleOpenDbModal}
                className="px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-all border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Database className="w-3.5 h-3.5 text-amber-700" />
                <span>Select from DB Notes</span>
              </button>
            </div>
          </div>

          {/* Attached Files Summary Card */}
          {existingFiles.length === 0 && selectedDbFiles.length === 0 && newUploadFiles.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2 bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No note documents attached yet</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Use the buttons above to <strong>Upload New PDF(s)</strong> or <strong>Select from Database Notes</strong>. You can bundle multiple units or chapters into this single purchase.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200/80">
                <span>
                  Attached Notes ({existingFiles.length + selectedDbFiles.length + newUploadFiles.length} file{existingFiles.length + selectedDbFiles.length + newUploadFiles.length === 1 ? '' : 's'})
                </span>
                <span className="font-mono text-slate-500 font-medium text-[11px]">
                  Total Size:{' '}
                  {formatFileSize(
                    existingFiles.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0) +
                    selectedDbFiles.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0) +
                    newUploadFiles.reduce((sum, f) => sum + f.size, 0)
                  )}
                </span>
              </div>

              <div className="divide-y divide-slate-200/60">
                {/* 1. Existing Attached Files */}
                {existingFiles.map((file) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {file.original_filename}
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Stored Document · {formatFileSize(file.file_size_bytes)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExistingFiles((prev) => prev.filter((f) => f.id !== file.id))}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove from this purchase bundle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* 2. Selected Files From Database */}
                {selectedDbFiles.map((file) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {file.original_filename}
                        </p>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                          From DB · {formatFileSize(file.file_size_bytes)}
                          {file.product_title ? ` (${file.product_title})` : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDbFiles((prev) => prev.filter((f) => f.id !== file.id))}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* 3. Newly Uploaded Files */}
                {newUploadFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {file.name}
                        </p>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                          New Upload · {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewUploadFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Database Notes Selection Modal */}
        {isDbModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Select Notes From Database
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose existing note documents to bundle into this single purchase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search filter */}
              <div className="py-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by file name or note title..."
                    value={dbSearchTerm}
                    onChange={(e) => setDbSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Files List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {loadingDbFiles ? (
                  <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading files from database...</span>
                  </div>
                ) : availableDbFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No files found in database.
                  </div>
                ) : (
                  availableDbFiles
                    .filter((f) => {
                      if (!dbSearchTerm.trim()) return true;
                      const term = dbSearchTerm.toLowerCase();
                      return (
                        f.original_filename?.toLowerCase().includes(term) ||
                        f.product_title?.toLowerCase().includes(term)
                      );
                    })
                    .map((file) => {
                      const isAttached = existingFiles.some((f) => f.id === file.id);
                      const isSelected = selectedDbFiles.some((f) => f.id === file.id);
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleToggleDbFile(file)}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isAttached
                              ? 'bg-slate-100/70 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-50 border border-amber-300'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors border-slate-300 bg-white">
                              {(isAttached || isSelected) && (
                                <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {file.original_filename}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {formatFileSize(file.file_size_bytes)} · {file.product_title || 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          {isAttached ? (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                              Already Attached
                            </span>
                          ) : isSelected ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              Selected
                            </span>
                          ) : null}
                        </div>
                      );
                    })
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {selectedDbFiles.length} file{selectedDbFiles.length === 1 ? '' : 's'} chosen
                </span>
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-all shadow-sm"
                >
                  Done (Attach Selected)
                </button>
              </div>
            </div>
          </div>
        )}

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
