'use client';

import React, { useState } from 'react';
import { SiteSettings } from '@/lib/types';
import { Save, Settings, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  initialSettings: SiteSettings;
}

export default function SettingsManagerClient({ initialSettings }: SettingsProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Platform settings successfully updated!');
      } else {
        toast.error('Failed to update settings.');
      }
    } catch {
      toast.error('Network error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand & Support */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Brand & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Platform Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Download Expiry (Hours)
              </label>
              <input
                type="number"
                value={settings.download_expiry_hours}
                onChange={(e) =>
                  setSettings({ ...settings, download_expiry_hours: parseInt(e.target.value, 10) })
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Top Announcement Ribbon
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_bar_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_bar_enabled: e.target.checked })
                }
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-slate-900">
                Enable Top Announcement Bar
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={settings.announcement_bar_text}
                onChange={(e) =>
                  setSettings({ ...settings, announcement_bar_text: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Official Non-Affiliation Disclaimer
          </h2>
          <textarea
            rows={3}
            value={settings.official_disclaimer}
            onChange={(e) =>
              setSettings({ ...settings, official_disclaimer: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

