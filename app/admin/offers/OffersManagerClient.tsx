'use client';

import React, { useState } from 'react';
import { Offer } from '@/lib/types';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Sliders } from 'lucide-react';
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
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('25');
  const [maxUses, setMaxUses] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        min_order_amount_in_paise: Math.round(parseFloat(minAmountRupees || '0') * 100),
        max_discount_in_paise: maxDiscountRupees ? Math.round(parseFloat(maxDiscountRupees) * 100) : undefined,
        max_uses: maxUses ? parseInt(maxUses, 10) : undefined,
        current_uses: 0,
        per_user_limit: parseInt(perUserLimit || '1', 10),
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setOffers((prev) => [data.offer || payload, ...prev]);
        setCode('');
        setTitle('');
        setMaxUses('');
        toast.success(`Coupon ${payload.code} created with limit ${payload.max_uses || 'unlimited'}!`);
      } else {
        toast.error(data.error || 'Failed to create coupon.');
      }
    } catch {
      toast.error('Error creating coupon.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteOffer = async (offerId: string, offerCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${offerCode}"?`)) {
      return;
    }

    setDeletingId(offerId);
    try {
      const res = await fetch(`/api/admin/offers?id=${offerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        toast.success(`Coupon ${offerCode} deleted successfully.`);
      } else {
        toast.error(data.error || 'Failed to delete coupon.');
      }
    } catch {
      toast.error('Network error deleting coupon.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateLimit = async (offer: Offer) => {
    const currentLimit = offer.max_uses !== undefined && offer.max_uses !== null ? String(offer.max_uses) : '';
    const newLimitStr = prompt(
      `Set new Total Usage Limit for coupon "${offer.code}" (enter a number, or leave empty for unlimited):`,
      currentLimit
    );

    if (newLimitStr === null) return; // User cancelled

    const newLimit = newLimitStr.trim() === '' ? null : parseInt(newLimitStr.trim(), 10);
    if (newLimit !== null && (isNaN(newLimit) || newLimit < 0)) {
      toast.error('Please enter a valid positive number or leave empty for unlimited.');
      return;
    }

    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer.id,
          max_uses: newLimit,
        }),
      });

      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, max_uses: newLimit || undefined } : o))
        );
        toast.success(`Usage limit for "${offer.code}" updated to ${newLimit !== null ? newLimit : 'unlimited'}.`);
      } else {
        toast.error('Failed to update limit.');
      }
    } catch {
      toast.error('Error updating coupon limit.');
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    const nextStatus = !offer.is_active;
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer.id,
          is_active: nextStatus,
        }),
      });

      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_active: nextStatus } : o))
        );
        toast.success(`Coupon "${offer.code}" is now ${nextStatus ? 'Active' : 'Inactive'}.`);
      } else {
        toast.error('Failed to change status.');
      }
    } catch {
      toast.error('Error changing coupon status.');
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
              placeholder="e.g. EXAM25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs uppercase font-mono font-bold border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 25% Off Exam Special"
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
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Discount {discountType === 'percentage' ? '(%)' : '(₹)'} *
            </label>
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

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Total Usage Limit (Max Uses)
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50 (or blank for unlimited)"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Per-Student Limit
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Min Order Amount (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="49"
              value={minAmountRupees}
              onChange={(e) => setMinAmountRupees(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Max Discount Cap (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="25 (cap for % discount)"
              value={maxDiscountRupees}
              onChange={(e) => setMaxDiscountRupees(e.target.value)}
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
          <h2 className="text-base font-bold text-slate-950">Coupons & Offers ({offers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-5">Code</th>
                <th className="py-2.5 px-5">Title</th>
                <th className="py-2.5 px-5">Discount</th>
                <th className="py-2.5 px-5">Usage Limit</th>
                <th className="py-2.5 px-5">Min Order</th>
                <th className="py-2.5 px-5">Status</th>
                <th className="py-2.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No coupon codes created yet. Use the form above to add your first coupon!
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-black text-slate-950 text-sm">{offer.code}</td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">{offer.title}</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-600">
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}%`
                        : `₹${(offer.discount_value / 100).toFixed(0)}`}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-950">{offer.current_uses}</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-semibold text-slate-600">
                          {offer.max_uses ? `${offer.max_uses} uses` : 'Unlimited'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateLimit(offer)}
                          title="Edit Limit"
                          className="ml-1 p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {offer.per_user_limit ? `${offer.per_user_limit} per student` : '1 per student'}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      ₹{Math.round((offer.min_order_amount_in_paise || 0) / 100)}
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(offer)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          offer.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {offer.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        disabled={deletingId === offer.id}
                        onClick={() => handleDeleteOffer(offer.id, offer.code)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-xl transition-all disabled:opacity-50"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === offer.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

