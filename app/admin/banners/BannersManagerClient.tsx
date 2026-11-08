'use client';

import React, { useState } from 'react';
import { Banner } from '@/lib/types';
import { Plus, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BannersManagerClientProps {
  initialBanners: Banner[];
}

export default function BannersManagerClient({ initialBanners }: BannersManagerClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('ANNOUNCEMENT');
  const [ctaLabel, setCtaLabel] = useState('Explore Catalog');
  const [ctaUrl, setCtaUrl] = useState('/notes');
  const [creating, setCreating] = useState(false);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setCreating(true);
    try {
      const payload: Banner = {
        id: `ban_${Date.now()}`,
        title,
        subtitle,
        badge_text: badgeText,
        cta_label: ctaLabel,
        cta_url: ctaUrl,
        is_active: true,
        display_order: banners.length + 1,
        created_at: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBanners((prev) => [...prev, payload]);
        setTitle('');
        setSubtitle('');
        toast.success('Banner added to homepage rotation!');
      } else {
        toast.error('Failed to create banner.');
      }
    } catch {
      toast.error('Network error creating banner.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        toast.success('Banner removed.');
      }
    } catch {
      toast.error('Could not remove banner.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Banner Form */}
      <form
        onSubmit={handleCreateBanner}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4"
      >
        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>Add Promotional Banner</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Banner Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. SPPU 2024 Pattern Notes Are Live"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Badge Tag</label>
            <input
              type="text"
              placeholder="e.g. NEW 2024 PATTERN"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-900 mb-1">Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Verified branch-wise study notes crafted strictly according to the updated syllabus."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Button Label</label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Target URL</label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Saving...' : 'Add Banner'}</span>
          </button>
        </div>
      </form>

      {/* Existing Banners */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-950">Active Banners ({banners.length})</h2>

        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4"
            >
              <div>
                <span className="pill-badge pill-badge-yellow text-[10px] mb-1 inline-block">
                  {b.badge_text || 'BANNER'}
                </span>
                <h3 className="text-xs font-bold text-slate-900">{b.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{b.subtitle}</p>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Link: {b.cta_url}
                </span>
              </div>

              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 flex-shrink-0"
                title="Remove banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

