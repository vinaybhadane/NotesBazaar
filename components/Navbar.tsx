'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Download,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { firebaseUser, dbUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse Notes', href: '/notes' },
    { label: 'Branches', href: '/branches' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const loginHref =
    pathname && pathname !== '/login' && pathname !== '/register'
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : '/login';
  const registerHref =
    pathname && pathname !== '/login' && pathname !== '/register'
      ? `/register?redirect=${encodeURIComponent(pathname)}`
      : '/register';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white p-1">
              <Image
                src="/logo.png"
                alt="AbhyasMitra Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-500 transition-colors">
                NotesBazaar
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide -mt-1">
                by AbhyasMitra
              </span>
            </div>
          </Link>

          {/* Center Pill Segmented Navigation (Inspired by SkyBound reference) */}
          <nav className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const loginHref =
    pathname && pathname !== '/login' && pathname !== '/register'
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : '/login';
  const registerHref =
    pathname && pathname !== '/login' && pathname !== '/register'
      ? `/register?redirect=${encodeURIComponent(pathname)}`
      : '/register';

  return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-[#FFE500] text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/notes"
              aria-label="Search Notes"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            {firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white shadow-sm transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {firebaseUser.email ? firebaseUser.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {firebaseUser.displayName || 'Student'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/account/purchases"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      My Purchases
                    </Link>

                    <Link
                      href="/account/downloads"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      My Downloads
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={loginHref}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href={registerHref}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-full shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive(link.href)
                    ? 'bg-[#FFE500] text-slate-950'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-amber-900 bg-amber-50"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-slate-100 pt-3">
            {firebaseUser ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-xs font-semibold text-slate-900">{firebaseUser.email}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account/downloads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Downloads
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={loginHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href={registerHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

