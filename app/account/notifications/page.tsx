'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Notification } from '@/lib/types';
import { Bell, Check, ArrowRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/user/dashboard-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.warn('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [firebaseUser]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/user/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        toast.success('Notification marked as read.');
      }
    } catch {
      toast.error('Could not update notification.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Important updates regarding your notes, syllabus changes, and announcements.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition-all ${
                n.is_read
                  ? 'bg-white border-slate-200/80'
                  : 'bg-amber-50/40 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-950">{n.title}</h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.link_url && (
                    <Link
                      href={n.link_url}
                      className="px-3 py-1.5 rounded-full bg-slate-950 text-white text-[11px] font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-colors"
                    >
                      View
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-900">No notifications</h2>
          <p className="text-xs text-slate-500">
            You are all caught up with your academic announcements.
          </p>
        </div>
      )}
    </div>
  );
}

