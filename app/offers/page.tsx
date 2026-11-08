import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Tag, Sparkles, Check, ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student Offers & Discount Coupons | NotesBazaar by AbhyasMitra',
  description:
    'Active student discount codes and special coupon offers for SPPU 2024 Pattern notes. Verified savings on semester exam revision materials.',
  alternates: {
    canonical: '/offers',
  },
};

export default async function OffersPage() {
  const offers = await db.getActiveOffers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Student Discounts</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Active Coupons & Offers
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          Apply these verified coupons during checkout to receive instant discounts on your SPPU 2024 Pattern notes.
        </p>
      </div>

      {offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}% Discount`
                        : `₹${(offer.discount_value / 100).toFixed(0)} Off`}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Active & Valid
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-950">{offer.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Coupon Code
                    </span>
                    <span className="text-base font-black tracking-wider text-slate-950">
                      {offer.code}
                    </span>
                  </div>
                  <Link
                    href={`/notes`}
                    className="px-4 py-2 bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    Use Code →
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p>• Minimum order amount: ₹{(offer.min_order_amount_in_paise / 100).toFixed(0)}</p>
                {offer.max_discount_in_paise && (
                  <p>• Maximum savings cap: ₹{(offer.max_discount_in_paise / 100).toFixed(0)}</p>
                )}
                <p>• Server-verified and limited to one redemption per student.</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-900">No active coupons at this moment</h2>
          <p className="text-xs text-slate-500 mt-1">
            Check back later for upcoming semester promo codes.
          </p>
        </div>
      )}
    </div>
  );
}

