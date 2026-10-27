import React from 'react';
import { repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await repository.getAllProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Campus User Directory</h2>
        <p className="text-xs text-gray-400">
          Registered accounts stored in the live PostgreSQL database.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                        {u.full_name.charAt(0)}
                      </div>
                      <span>{u.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-medium">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">{u.student_staff_id || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-500">{u.department || 'General'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-[#0793D4] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
