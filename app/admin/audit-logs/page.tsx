import React from 'react';
import { repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const logs = await repository.getAuditLogs(50);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Security Audit Log</h2>
        <p className="text-xs text-gray-400">
          Immutable ledger of administrative adjudications and lifecycle modifications in PostgreSQL.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-gray-400 font-sans">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('approve')
                          ? 'bg-[#79BF2B]/15 text-[#4d7f1b]'
                          : log.action.includes('reject')
                          ? 'bg-red-50 text-red-700'
                          : log.action.includes('create')
                          ? 'bg-[#0793D4]/10 text-[#0793D4]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-gray-900 font-medium">
                    {log.actor?.full_name || 'System / Security Desk'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    <span className="uppercase text-[10px] font-semibold text-gray-400 mr-1">
                      {log.entity_type}:
                    </span>
                    {log.entity_id ? `${log.entity_id.substring(0, 8)}...` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <pre className="text-[10px] bg-gray-50 p-2 rounded-xl border border-gray-100 text-gray-700 overflow-x-auto max-w-xs whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
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
