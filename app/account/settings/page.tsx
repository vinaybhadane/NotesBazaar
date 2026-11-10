'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const { firebaseUser, dbUser } = useAuth();
  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || '');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Account preferences saved.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal profile and academic notification preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Profile Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Student Profile
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              disabled
              value={firebaseUser?.email || ''}
              className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Verified via Google Sign-In.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider text-[11px] text-slate-400">
            Email & Notification Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Purchased Notes File Updates
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Receive email alerts if an author publishes an errata, correction, or updated PDF for a note you bought.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={productUpdates}
                onChange={(e) => setProductUpdates(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  New Syllabus Pattern Releases
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Get notified when new SPPU 2024 Pattern notes matching your branch are released.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

