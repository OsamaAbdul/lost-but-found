import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  BarChart3, 
  Package, 
  FileCheck2, 
  Users, 
  History,
  Lock
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Officer Access Restricted</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The administrative control panel requires campus security privileges. Your current profile ({user?.full_name || 'Anonymous'}) is assigned role &ldquo;{user?.role || 'user'}&rdquo;.
        </p>

        <div className="flex justify-center gap-2.5 pt-2">
          <Link href="/auth/login">
            <Button variant="primary" size="sm">
              Sign In as Officer
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { href: '/admin', label: 'Overview', icon: BarChart3 },
    { href: '/admin/claims', label: 'Review Queue', icon: FileCheck2 },
    { href: '/admin/items', label: 'Item Moderation', icon: Package },
    { href: '/admin/users', label: 'User Directory', icon: Users },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: History },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Sleek Admin Header Banner */}
      <div className="bg-white border border-gray-100 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src="https://pg.nsuk.edu.ng/api/global/logo"
            alt="NSUK Logo"
            className="h-10 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Campus Security Console
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#79BF2B]/15 text-[#4d7f1b]">
                Live Adjudication
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Officer: {user.full_name} &bull; ID: {user.student_staff_id || 'SEC-ADMIN'}
            </p>
          </div>
        </div>

        {/* Minimal Navigation Pills */}
        <div className="flex flex-wrap gap-1 bg-gray-50/80 p-1 rounded-2xl border border-gray-100">
          {adminNav.map((nav) => {
            const Icon = nav.icon;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span>{nav.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Children Content */}
      <div>{children}</div>
    </div>
  );
}
