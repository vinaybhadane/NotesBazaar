import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import SettingsManagerClient from './SettingsManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Site Settings | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await db.getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, support contact details, independent disclaimer, and announcement bar
        </p>
      </div>

      <SettingsManagerClient initialSettings={settings} />
    </div>
  );
}

