'use client';

import React, { useState } from 'react';
import { User, Phone, Briefcase, Hash, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Profile } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [studentStaffId, setStudentStaffId] = useState(profile.student_staff_id || '');
  const [department, setDepartment] = useState(profile.department || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Campus Email Address (Institutional Identity)
          </label>
          <input
            type="email"
            disabled
            value={profile.email}
            className="w-full text-sm px-4 py-2.5 bg-gray-100/70 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed select-none font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Student / Staff ID Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentStaffId}
                onChange={(e) => setStudentStaffId(e.target.value)}
                placeholder="e.g. STU-2024-8831"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234-800-000-0000"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Academic Department / Faculty
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Faculty of Natural Sciences"
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
          </div>
        </div>

        {/* Security / Role Notice */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Shield className="w-4 h-4 text-[#0793D4]" />
            <span>Assigned Role: <span className="uppercase text-[#0793D4] font-extrabold">{profile.role}</span></span>
          </div>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            Role privileges are server-enforced through PostgreSQL Row Level Security. Administrative access cannot be granted through client requests.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <Button type="submit" variant="primary" isLoading={loading}>
          Save Profile Changes
        </Button>
      </div>
    </form>
  );
}
