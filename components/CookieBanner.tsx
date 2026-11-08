'use client';

import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Settings2 } from 'lucide-react';
import { CookiePreferences } from '@/lib/types';

const COOKIE_STORAGE_KEY = 'notesbazaar_cookie_consent_v1';

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<{
    strictly_necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  }>({
    strictly_necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if consent has already been recorded
    const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!saved) {
      // Delay slightly for smooth page load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(saved);
        setPreferences({
          strictly_necessary: true,
          analytics: parsed.analytics,
          marketing: parsed.marketing,
          functional: parsed.functional,
        });
      } catch {
        setIsOpen(true);
      }
    }

    // Listen for custom event triggered from footer
    const handleOpenSettings = () => {
      setIsCustomizeOpen(true);
      setIsOpen(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  const saveConsent = (prefs: {
    strictly_necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  }) => {
    const record: CookiePreferences = {
      ...prefs,
      strictly_necessary: true,
      timestamp: new Date().toISOString(),
      policy_version: '1.0',
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(record));
    setIsOpen(false);
    setIsCustomizeOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      strictly_necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      strictly_necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 text-slate-900">
        {!isCustomizeOpen ? (
          <div>
            <div className="flex items-start gap-3.5 mb-3">
              <div className="p-2 bg-amber-100 rounded-2xl text-amber-900 flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Cookie & Privacy Preferences
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  We use cookies and secure storage to enable login authentication, payment verification, and protect digital downloads. Optional cookies help us understand platform usage. You have complete control over optional cookies.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Customize
              </button>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-4 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-1.5 text-xs font-bold text-slate-950 bg-[#FFE500] hover:bg-amber-400 rounded-full shadow-sm transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950">Customize Cookie Preferences</h3>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Strictly Necessary</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Required for user authentication, Razorpay security checks, and verified file entitlements.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-not-allowed mt-1"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900">Platform Analytics</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Helps us understand which engineering branches and subjects are most needed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-amber-400 w-4 h-4 cursor-pointer mt-1"
                />
              </div>

              {/* Functional */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900">Functional Preferences</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Remembers your preferred branch and academic year filters during your session.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-amber-400 w-4 h-4 cursor-pointer mt-1"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900">Marketing & Promotional</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Allows tailored notifications on relevant syllabus announcements and discounted bundles.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-amber-400 w-4 h-4 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-[#FFE500] hover:bg-amber-400 rounded-full"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

