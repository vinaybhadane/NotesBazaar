'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AdminLiveSync() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastUpdated(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    });
  };

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    // Light auto-refresh every 15s while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    }, 15000);

    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-70"
      title="Sync latest orders, payments, and analytics from Azure SQL"
    >
      <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isPending ? 'animate-spin' : ''}`} />
      <span>{isPending ? 'Syncing...' : 'Live Sync'}</span>
      {lastUpdated && (
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          · {lastUpdated}
        </span>
      )}
    </button>
  );
}

