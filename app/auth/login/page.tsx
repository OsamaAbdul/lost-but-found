'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid university credentials');
      }

      router.push('/dashboard');
      setTimeout(() => router.refresh(), 300);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      });
      if (res.ok) {
        router.push('/dashboard');
        setTimeout(() => router.refresh(), 300);
      }
    } catch {
      setError('Failed to switch to demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <img
            src="https://pg.nsuk.edu.ng/api/global/logo"
            alt="University Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Sign In to Campus Lost &amp; Found</h1>
        <p className="text-xs text-gray-600">
          Enter your university credentials to report belongings and verify ownership claims.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {error && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              University Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.university.edu"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-[11px] text-[#0793D4] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login Box */}
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Quick Evaluator Accounts (Supabase Database)
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@university.edu')}
              className="w-full p-3 text-left bg-[#0793D4]/5 hover:bg-[#0793D4]/10 border border-[#0793D4]/20 rounded-2xl text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-[#0793D4] block">Campus Security Admin</span>
                <span className="text-[11px] text-gray-500">admin@university.edu</span>
              </div>
              <span className="px-2.5 py-1 bg-[#0793D4] text-white rounded-full text-[10px] font-bold">
                ADMIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('alex.rivera@student.university.edu')}
              className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100/80 border border-gray-200/80 rounded-2xl text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-gray-900 block">Alex Rivera (Student)</span>
                <span className="text-[11px] text-gray-500">alex.rivera@student.university.edu</span>
              </div>
              <span className="px-2.5 py-1 bg-[#FBBF07] text-gray-950 rounded-full text-[10px] font-bold">
                STUDENT
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('devon.chen@student.university.edu')}
              className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100/80 border border-gray-200/80 rounded-2xl text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-gray-900 block">Devon Chen (Student)</span>
                <span className="text-[11px] text-gray-500">devon.chen@student.university.edu</span>
              </div>
              <span className="px-2.5 py-1 bg-[#FBBF07] text-gray-950 rounded-full text-[10px] font-bold">
                STUDENT
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        Don&apos;t have an account yet?{' '}
        <Link href="/auth/register" className="font-bold text-[#0793D4] hover:underline">
          Register new student account
        </Link>
      </div>
    </div>
  );
}
