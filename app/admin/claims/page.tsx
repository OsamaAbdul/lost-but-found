import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

interface AdminClaimsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminClaimsPage({ searchParams }: AdminClaimsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';

  const claims = await repository.getClaims({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const statuses = [
    { key: 'all', label: 'All Claims' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Claim Review Queue</h2>
          <p className="text-xs text-gray-400">
            Adjudicate incoming ownership claims by evaluating answers against confidential ground truth.
          </p>
        </div>

        {/* Minimal Filter Tabs */}
        <div className="inline-flex rounded-xl bg-gray-50 border border-gray-100 p-1 text-xs">
          {statuses.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/claims?status=${tab.key}`}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {claims.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-100 shadow-xs">
          {claims.map((claim) => (
            <div key={claim.id} className="p-5 sm:p-6 space-y-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={claim.status} />
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    {claim.item?.title}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(claim.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-900 block text-[11px] mb-1">
                    Claimant Verification Response:
                  </span>
                  <span className="text-gray-700 font-mono text-[11px] line-clamp-2">
                    {claim.verification_answer}
                  </span>
                </div>

                <div className="bg-[#FBBF07]/10 p-3 rounded-xl border border-[#FBBF07]/30">
                  <span className="font-bold text-[#8a6800] block text-[11px] mb-1">
                    Confidential Reporter Clue (Ground Truth):
                  </span>
                  <span className="text-gray-900 font-mono text-[11px] line-clamp-2">
                    {claim.item?.secret_verification_details || '[No confidential clue recorded]'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-gray-500">
                  Claimant: <strong className="text-gray-800">{claim.claimant?.full_name}</strong> &bull; {claim.claimant?.email}
                </div>

                <Link href={`/claims/${claim.id}`}>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <span>Adjudicate Claim</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="Queue is Empty"
          description={`No claims currently found with status "${statusFilter}".`}
          actionText="View All Claims"
          actionHref="/admin/claims?status=all"
        />
      )}
    </div>
  );
}
