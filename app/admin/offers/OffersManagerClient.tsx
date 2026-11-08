'use client';

import React, { useState } from 'react';
import { Offer } from '@/lib/types';
import { Tag, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface OffersManagerClientProps {
  initialOffers: Offer[];
}

export default function OffersManagerClient({ initialOffers }: OffersManagerClientProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [minAmountRupees, setMinAmountRupees] = useState('49');
  const [creating, setCreating] = useState(false);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title || !discountValue) return;

    setCreating(true);
    try {
      const payload: Offer = {
        id: `off_${Date.now()}`,
        code: code.toUpperCase().trim(),
        title,
        description: `${discountType === 'percentage' ? discountValue + '%' : '₹' + discountValue} off on eligible notes`,
        discount_type: discountType,
        discount_value: parseInt(discountValue, 10),
        min_order_amount_in_paise: Math.round(parseFloat(minAmountRupees) * 100),
        current_uses: 0,
        per_user_limit: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOffers((prev) => [payload, ...prev]);
        setCode('');
        setTitle('');
        toast.success(`Coupon ${payload.code} created successfully!`);
      } else {
        toast.error('Failed to create offer.');
      }
    } catch {
      toast.error('Error creating offer.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Offer Form */}
      <form
        onSubmit={handleCreateOffer}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4"
      >
        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500" />
          <span>Create New Coupon Code</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SEM20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs uppercase font-bold border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 20% In-Sem Revision Off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Rupees (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Discount Value *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="15"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
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
            <span>{creating ? 'Creating...' : 'Create Coupon'}</span>
          </button>
        </div>
      </form>

      {/* Offers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-950">Active Coupons ({offers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-5">Code</th>
                <th className="py-2.5 px-5">Title</th>
                <th className="py-2.5 px-5">Discount</th>
                <th className="py-2.5 px-5">Status</th>
                <th className="py-2.5 px-5">Total Uses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="py-3.5 px-5 font-mono font-black text-slate-950">{offer.code}</td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">{offer.title}</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-600">
                    {offer.discount_type === 'percentage'
                      ? `${offer.discount_value}%`
                      : `₹${(offer.discount_value / 100).toFixed(0)}`}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="pill-badge pill-badge-cyan text-[10px]">Active</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">{offer.current_uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

