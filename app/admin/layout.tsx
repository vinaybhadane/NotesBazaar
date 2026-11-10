'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderOpen,
  Layers,
  ShoppingBag,
  CreditCard,
  Tag,
  Image as ImageIcon,
  Bell,
  Users,
  Settings,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { firebaseUser, isAdmin, loading, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Notes Catalog', href: '/admin/notes', icon: BookOpen },
    { label: 'Add New Note', href: '/admin/notes/new', icon: PlusCircle },
    { label: 'Uploaded Notes', href: '/admin/uploaded-notes', icon: FolderOpen },
    { label: 'Branches & Subjects', href: '/admin/branches', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Payments & Gateway', href: '/admin/payments', icon: CreditCard },
    { label: 'Coupons & Offers', href: '/admin/offers', icon: Tag },
    { label: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Announcements', href: '/admin/notifications', icon: Bell },
    { label: 'Students & Users', href: '/admin/users', icon: Users },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Admin access gate: Only configured administrator or matching admin email can access
  if (!firebaseUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-950">Admin Authorization Required</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The NotesBazaar admin panel is restricted to verified administrators. You are currently signed in as{' '}
          <strong>{firebaseUser?.email || 'Guest'}</strong>, which does not have administrative privileges.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login?redirect=/admin"
            className="px-5 py-2.5 bg-slate-950 text-white rounded-full text-xs font-bold hover:bg-[#FFE500] hover:text-slate-950 transition-colors"
          >
            Sign In with Administrator Account
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1 mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Admin Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-white p-0.5 border border-slate-100">
                  <Image src="/logo.png" alt="AbhyasMitra Logo" fill className="object-contain" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-950 block leading-tight">
                    Admin Center
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Verified Admin
                  </span>
                </div>
              </div>

              <Link
                href="/"
                title="View Live Store"
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <nav className="bg-white rounded-3xl border border-slate-200/90 p-2 space-y-0.5 shadow-sm">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#FFE500] text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Admin Content Area */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

