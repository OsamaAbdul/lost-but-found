'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Layers, 
  Menu, 
  X, 
  ShieldAlert,
  ChevronDown,
  LogOut,
  FileCheck2,
  Plus
} from 'lucide-react';
import { Profile } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);

  // Fetch session and notifications
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAvailableProfiles(data.availableProfiles || []);
        }
      } catch {
        // quiet fallback
      }
    }

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // quiet fallback
      }
    }

    fetchSession();
    fetchNotifications();
  }, [pathname]);

  const switchAccount = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // quiet fallback
    }
  };

  const navLinks = [
    { href: '/items', label: 'Directory', icon: Search },
    { href: '/report/lost', label: 'Report Lost', icon: Plus },
    { href: '/report/found', label: 'Report Found', icon: Plus },
    { href: '/matches', label: 'Matches', icon: Layers },
    { href: '/claims', label: 'Claims', icon: FileCheck2 },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Institution Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="https://pg.nsuk.edu.ng/api/global/logo"
              alt="NSUK Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                  NSUK Lost & Found
                </span>
                <span className="hidden md:inline text-[10px] font-semibold text-[#0793D4] bg-[#0793D4]/10 px-2 py-0.5 rounded-full">
                  Verified Recovery
                </span>
              </div>
              <span className="text-[11px] text-gray-500 hidden sm:block">
                Nasarawa State University Keffi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Console Pill */}
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#0793D4] text-white'
                    : 'bg-[#0793D4]/10 text-[#0793D4] hover:bg-[#0793D4]/18'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FBBF07] ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile Pill / Account Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0793D4] text-white flex items-center justify-center font-bold text-[11px]">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="font-semibold text-gray-900 truncate max-w-[110px]">
                    {currentUser?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-gray-500 capitalize">
                    {currentUser?.role === 'admin' ? 'Officer' : 'Student'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Signed In</p>
                    <p className="text-sm font-bold text-gray-900">{currentUser?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        currentUser?.role === 'admin'
                          ? 'bg-[#0793D4]/15 text-[#0793D4]'
                          : 'bg-[#FBBF07]/20 text-[#8a6800]'
                      }`}>
                        {currentUser?.role === 'admin' ? 'Security Admin' : 'Student User'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Personal Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Profile & Identification
                    </Link>
                    {currentUser?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-[#0793D4] hover:bg-blue-50/50"
                      >
                        Administrative Console
                      </Link>
                    )}
                  </div>

                  {/* Switch Account in Database */}
                  <div className="border-t border-gray-100 pt-2 px-3">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">
                      Switch Database Profile
                    </p>
                    <div className="space-y-1">
                      {availableProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchAccount(p.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                            p.id === currentUser?.id
                              ? 'bg-gray-100 font-bold text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{p.full_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            p.role === 'admin'
                              ? 'bg-[#0793D4] text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {p.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-2 pt-1">
                    <Link
                      href="/auth/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50/60 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50"
            >
              <span>{link.label}</span>
            </Link>
          ))}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#0793D4] bg-[#0793D4]/10 rounded-lg"
            >
              <span>Admin Console</span>
              <ShieldAlert className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <span>Personal Dashboard</span>
          </Link>
        </div>
      )}
    </header>
  );
}
