'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminLiveSync from '@/components/AdminLiveSync';
import {
  FileText,
  Trash2,
  Search,
  ExternalLink,
  HardDrive,
  Database,
  AlertTriangle,
  PlusCircle,
  Edit,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFileItem {
  id: string;
  product_id: string;
  blob_container: string;
  blob_name: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  product_title?: string;
  product_slug?: string;
  product_thumbnail_url?: string | null;
  product_status?: string;
}

interface StorageBlobItem {
  blobName: string;
  container: string;
  size: number;
  lastModified: string;
}

interface UploadedNotesClientProps {
  initialFiles: UploadedFileItem[];
  initialOrphanBlobs: StorageBlobItem[];
}

export default function UploadedNotesClient({
  initialFiles,
  initialOrphanBlobs,
}: UploadedNotesClientProps) {
  const [files, setFiles] = useState<UploadedFileItem[]>(initialFiles);
  const [orphanBlobs, setOrphanBlobs] = useState<StorageBlobItem[]>(initialOrphanBlobs);
  const [search, setSearch] = useState('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredFiles = files.filter((f) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      f.original_filename.toLowerCase().includes(q) ||
      (f.product_title || '').toLowerCase().includes(q) ||
      f.blob_name.toLowerCase().includes(q)
    );
  });

  const filteredOrphans = orphanBlobs.filter((b) => {
    if (!search.trim()) return true;
    return b.blobName.toLowerCase().includes(search.trim().toLowerCase());
  });

  const totalDbBytes = files.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0);
  const totalOrphanBytes = orphanBlobs.reduce((sum, b) => sum + (b.size || 0), 0);

  const handleDeleteDbFile = async (file: UploadedFileItem) => {
    const confirmed = confirm(
      `Delete "${file.original_filename}" from the database?\n\nThis will unlink it from "${
        file.product_title || file.product_id
      }" and remove the file from cloud storage if no other product uses it.`
    );
    if (!confirmed) return;

    setDeletingKey(file.id);
    try {
      const res = await fetch(`/api/admin/files?id=${encodeURIComponent(file.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not delete uploaded file.');
        return;
      }
      setFiles((prev) => prev.filter((item) => item.id !== file.id));
      toast.success(`Deleted "${file.original_filename}" from database.`);
    } catch {
      toast.error('Network error while deleting file.');
    } finally {
      setDeletingKey(null);
    }
  };

  const handleDeleteOrphanBlob = async (blob: StorageBlobItem) => {
    const confirmed = confirm(
      `Permanently delete unlinked storage blob "${blob.blobName}" from Azure Storage?`
    );
    if (!confirmed) return;

    setDeletingKey(blob.blobName);
    try {
      const res = await fetch(
        `/api/admin/files?blobName=${encodeURIComponent(blob.blobName)}&container=${encodeURIComponent(
          blob.container
        )}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not delete blob.');
        return;
      }
      setOrphanBlobs((prev) => prev.filter((b) => b.blobName !== blob.blobName));
      toast.success(`Removed "${blob.blobName}" from storage.`);
    } catch {
      toast.error('Network error deleting storage blob.');
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Uploaded Notes & Database Files
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect, preview, and delete any uploaded PDF documents stored in Azure SQL and Blob Storage
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AdminLiveSync />
          <Link
            href="/admin/notes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Note</span>
          </Link>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Database PDF Files
            </span>
            <span className="text-2xl font-black text-slate-950 mt-0.5 block">
              {files.length}
            </span>
            <span className="text-[10px] text-slate-500">{formatSize(totalDbBytes)} linked</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Unlinked Storage Blobs
            </span>
            <span className="text-2xl font-black text-amber-600 mt-0.5 block">
              {orphanBlobs.length}
            </span>
            <span className="text-[10px] text-slate-500">
              {formatSize(totalOrphanBytes)} unattached
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Cloud Size
            </span>
            <span className="text-2xl font-black text-slate-950 mt-0.5 block">
              {formatSize(totalDbBytes + totalOrphanBytes)}
            </span>
            <span className="text-[10px] text-slate-500">Azure Blob Private Container</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search uploaded files by filename or note title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Section 1: Linked Files in Database (product_files) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-950">
            All Uploaded Notes in Database ({filteredFiles.length})
          </h2>
          <span className="text-[11px] text-slate-400">Stored in product_files</span>
        </div>

        {filteredFiles.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* 16:9 Thumbnail Preview of linked product OR PDF placeholder */}
                  {file.product_thumbnail_url ? (
                    <div className="w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img
                        src={file.product_thumbnail_url}
                        alt={file.product_title || file.original_filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 sm:w-28 aspect-video rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span className="text-[9px] font-bold uppercase mt-0.5 text-slate-400 flex items-center gap-0.5">
                        <ImageIcon className="w-2.5 h-2.5" /> No 16:9 Cover
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                      {file.original_filename}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {formatSize(file.file_size_bytes)}
                      </span>
                      <span>
                        Uploaded{' '}
                        {new Date(file.created_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {file.product_title ? (
                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-400">Product:</span>
                        <Link
                          href={`/admin/notes/${file.product_id}/edit`}
                          className="font-bold text-amber-700 hover:underline truncate max-w-xs"
                        >
                          {file.product_title}
                        </Link>
                      </div>
                    ) : (
                      <span className="text-[10px] text-red-600 font-semibold">
                        Unlinked product ({file.product_id})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                  <Link
                    href={`/admin/notes/${file.product_id}/edit`}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Thumbnail</span>
                  </Link>

                  <a
                    href={`/api/admin/files/preview?id=${encodeURIComponent(file.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-[11px] font-bold transition-all inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open PDF</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteDbFile(file)}
                    disabled={deletingKey === file.id}
                    className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {deletingKey === file.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-14 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No uploaded PDF files found in database</p>
            <p className="text-xs text-slate-400">
              Upload PDF documents when creating or editing a note to see them listed here.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Unlinked / Orphaned Blobs in Cloud Storage */}
      {filteredOrphans.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-black text-amber-950">
                Unlinked Files in Cloud Storage ({filteredOrphans.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-800">
              Leftover blobs from deleted products — safe to inspect or delete from storage
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrphans.map((blob) => (
              <div
                key={blob.blobName}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 font-mono truncate">
                    {blob.blobName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatSize(blob.size)} · Last modified{' '}
                    {new Date(blob.lastModified).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/api/admin/files/preview?blobName=${encodeURIComponent(
                      blob.blobName
                    )}&container=${encodeURIComponent(blob.container)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteOrphanBlob(blob)}
                    disabled={deletingKey === blob.blobName}
                    className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {deletingKey === blob.blobName ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete from Storage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

