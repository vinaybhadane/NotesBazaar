import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import OffersManagerClient from './OffersManagerClient';

export const metadata: Metadata = {
  title: 'Discount Coupons & Offers | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminOffersPage() {
  const offers = await db.getActiveOffers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Offers & Coupons
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create promotional discount codes and configure student usage rules
        </p>
      </div>

      <OffersManagerClient initialOffers={offers} />
    </div>
  );
}

