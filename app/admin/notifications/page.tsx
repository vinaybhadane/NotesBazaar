import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import NotificationComposerClient from './NotificationComposerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Announcements & Notifications | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminNotificationsPage() {
  const users = await db.getAllUsers();
  const { products } = await db.getProducts({ status: 'published' });
  const branches = await db.getBranches();
  const campaigns = await db.getNotificationCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Notifications & Student Announcements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Broadcast syllabus correction alerts and academic notices to targeted student audiences
        </p>
      </div>

      <NotificationComposerClient
        totalUsersCount={users.length}
        products={products}
        branches={branches}
        campaigns={campaigns}
      />
    </div>
  );
}

