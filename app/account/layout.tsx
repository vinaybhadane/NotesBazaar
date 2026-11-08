'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  ShoppingBag,
  Download,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  HelpCircle,
} from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, dbUser, isAdmin, logout, loading } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/account', icon: User },
    { label: 'My Downloads', href: '/account/downloads', icon: Download },
    { label: 'My Purchases', href: '/account/purchases', icon: ShoppingBag },
    { label: 'Notifications', href: '/account/notifications', icon: Bell },
    { label: 'Settings', href: '/account/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading your student account...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-950">Student Login Required</h1>
        <p className="text-xs text-slate-600">
          Please sign in to view your account dashboard, purchases, and note downloads.
        </p>
        <Link
          href="/login?redirect=/account"
          className="inline-block px-6 py-2.5 bg-slate-950 text-white rounded-full text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-all shadow-sm"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-4">
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200/90 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-base font-black mb-3">
              {firebaseUser.email ? firebaseUser.email[0].toUpperCase() : 'U'}
            </div>
            <h2 className="text-sm font-bold text-slate-950 truncate">
              {firebaseUser.displayName || 'Engineering Student'}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 pill-badge pill-badge-yellow text-[10px]">
                Platform Administrator
              </span>
            )}
          </div>

          <nav className="bg-white rounded-3xl border border-slate-200/90 p-2 space-y-1 shadow-xs">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#FFE500] text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="border-t border-slate-100 my-1 pt-1">
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}

