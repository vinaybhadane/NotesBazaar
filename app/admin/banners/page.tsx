import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import BannersManagerClient from './BannersManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Homepage Banners | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage() {
  const banners = await db.getAllBanners();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Homepage Banners
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage promotional hero banners, scheduled alerts, and announcement cards
        </p>
      </div>

      <BannersManagerClient initialBanners={banners} />
    </div>
  );
}

