'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams changes, complete loading
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const currentOrigin = window.location.origin;
      // Trigger only for same-origin links without modifiers and not downloading/blank
      if (
        target.href.startsWith(currentOrigin) &&
        !target.href.includes('#') &&
        target.target !== '_blank' &&
        !target.download &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const nextUrl = new URL(target.href);
        const isDifferentPath =
          nextUrl.pathname !== window.location.pathname || nextUrl.search !== window.location.search;

        if (isDifferentPath) {
          setLoading(true);
          setProgress(30);

          const t1 = setTimeout(() => setProgress(65), 180);
          const t2 = setTimeout(() => setProgress(88), 450);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-[#FFE500] to-blue-400 shadow-[0_0_12px_rgba(255,229,0,0.9)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
