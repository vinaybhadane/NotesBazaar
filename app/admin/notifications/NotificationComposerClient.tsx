'use client';

import React, { useState } from 'react';
import { Product, Branch, NotificationCampaign } from '@/lib/types';
import { Bell, Send, CheckCircle2, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationComposerProps {
  totalUsersCount: number;
  products: Product[];
  branches: Branch[];
  campaigns: NotificationCampaign[];
}

export default function NotificationComposerClient({
  totalUsersCount,
  products,
  branches,
  campaigns,
}: NotificationComposerProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('/account/downloads');
  const [audienceType, setAudienceType] = useState<'all' | 'product_purchasers' | 'branch_purchasers'>('all');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignList, setCampaignList] = useState<NotificationCampaign[]>(campaigns);

  // Calculate estimated audience
  const estimatedCount = audienceType === 'all' ? Math.max(1, totalUsersCount) : 1;

  const handleBroadcast = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          linkUrl,
          audienceType,
          selectedProductId: audienceType === 'product_purchasers' ? selectedProductId : undefined,
          selectedBranchId: audienceType === 'branch_purchasers' ? selectedBranchId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Announcement dispatched to ${data.sentCount} students!`);
        setTitle('');
        setMessage('');
        setPreviewOpen(false);
        if (data.campaign) {
          setCampaignList([data.campaign, ...campaignList]);
        }
      } else {
        toast.error(data.error || 'Failed to dispatch announcement.');
      }
    } catch {
      toast.error('Network error dispatching broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Composer Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Compose New Announcement</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 3 Errata & Solved Question Added to TOC Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Message Content *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain the update, revision, or academic notice clearly..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Target Audience Segment *
              </label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Enrolled Students ({totalUsersCount} users)</option>
                <option value="product_purchasers">Purchasers of a Specific Note</option>
                <option value="branch_purchasers">Students in a Specific Branch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Call to Action Link</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/account/downloads"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
              />
            </div>
          </div>

          {audienceType === 'product_purchasers' && (
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Select Note Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audienceType === 'branch_purchasers' && (
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Select Branch</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Confirmation & Preview Step (Mandatory Requirement) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Estimated Recipients: <strong className="text-slate-900">{estimatedCount} students</strong>
          </span>

          <button
            type="button"
            disabled={!title || !message}
            onClick={() => setPreviewOpen(true)}
            className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Review & Broadcast</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-950">Confirm Campaign Broadcast</h3>
            <p className="text-xs text-slate-500">
              Please review the notification message and audience before confirming transmission:
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block">{title}</span>
              <p className="text-slate-600 leading-relaxed">{message}</p>
              <span className="text-[10px] text-slate-400 block pt-1">
                Target: {audienceType.replace('_', ' ').toUpperCase()} ({estimatedCount} recipients)
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleBroadcast}
                className="px-5 py-2 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-colors shadow-sm"
              >
                {sending ? 'Transmitting...' : 'Confirm & Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Log */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-950">Dispatched Campaigns</h2>

        {campaignList.length > 0 ? (
          <div className="space-y-3">
            {campaignList.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{c.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Sent on {new Date(c.sent_at).toLocaleString()} · Audience: {c.audience_type}
                  </span>
                </div>
                <span className="pill-badge pill-badge-cyan text-[10px] flex-shrink-0">
                  {c.sent_count} Delivered
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No broadcast campaigns sent yet.
          </div>
        )}
      </div>
    </div>
  );
}

