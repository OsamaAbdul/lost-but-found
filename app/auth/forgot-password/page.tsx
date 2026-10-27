'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <img
            src="https://pg.nsuk.edu.ng/api/global/logo"
            alt="University Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Password Recovery</h1>
        <p className="text-xs text-gray-500">
          Enter your institutional email address to receive password reset instructions.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#79BF2B]/20 text-[#79BF2B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Check Your Email</h3>
            <p className="text-xs text-gray-600">
              If an account exists with <span className="font-semibold text-gray-800">{email}</span>, password reset guidance has been dispatched.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="mt-2">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.university.edu"
                  className="w-full text-sm pl-9 pr-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#0793D4] focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Send Password Reset Link
            </Button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-[#0793D4] hover:underline font-bold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
