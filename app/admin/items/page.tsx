import React from 'react';
import Link from 'next/link';
import { ExternalLink, Plus } from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminItemsPage() {
  const data = await repository.getItems({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Item Moderation</h2>
          <p className="text-xs text-gray-400">
            Cataloged lost and found belongings stored in the live database.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/report/lost">
            <Button variant="warning" size="sm" className="gap-1.5 font-semibold">
              <Plus className="w-3.5 h-3.5" />
              Log Lost
            </Button>
          </Link>
          <Link href="/report/found">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Log Found
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Title & Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Incident Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.type === 'lost'
                          ? 'bg-[#FBBF07] text-gray-950'
                          : 'bg-[#0793D4] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900 text-xs">{item.title}</div>
                    <div className="text-[11px] text-gray-400 truncate max-w-xs">{item.location}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-gray-500">{item.incident_date}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/items/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
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
