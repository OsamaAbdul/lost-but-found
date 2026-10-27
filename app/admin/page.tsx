import React from 'react';
import Link from 'next/link';
import { 
  FileCheck2, 
  Package, 
  Users, 
  History, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
} from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await repository.getAdminMetrics();
  const allClaims = await repository.getClaims();
  const pendingClaims = allClaims.filter(
    (c) => c.status === 'pending' || c.status === 'under_review'
  );
  const recentLogs = await repository.getAuditLogs(5);
  const recoveryRate = metrics.foundCount > 0 ? Math.round((metrics.claimedCount / metrics.foundCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold text-gray-500">Pending Review</span>
            <Clock className="w-4 h-4 text-[#FBBF07]" />
          </div>
          <div className="text-3xl font-extrabold text-[#9a7400]">
            {metrics.pendingClaims}
          </div>
          <div className="text-[11px] text-gray-400">Claims in security queue</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold text-gray-500">Recovery Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#79BF2B]" />
          </div>
          <div className="text-3xl font-extrabold text-[#79BF2B]">
            {recoveryRate}%
          </div>
          <div className="text-[11px] text-gray-400">
            {metrics.claimedCount} returned of {metrics.foundCount} found
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold text-gray-500">Cataloged Assets</span>
            <Package className="w-4 h-4 text-[#0793D4]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0793D4]">
            {metrics.totalItems}
          </div>
          <div className="text-[11px] text-gray-400">
            {metrics.lostCount} lost &bull; {metrics.foundCount} found
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold text-gray-500">Active Profiles</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {metrics.totalUsers}
          </div>
          <div className="text-[11px] text-gray-400">Verified campus accounts</div>
        </div>
      </div>

      {/* Two Column Layout: Claim Queue & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Claims Requiring Adjudication */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0793D4]" />
                Claims Awaiting Decision ({pendingClaims.length})
              </h3>
              <p className="text-xs text-gray-400">
                Validate responses against confidential records before physical handover.
              </p>
            </div>
            <Link href="/admin/claims">
              <Button variant="outline" size="sm">
                Queue &rarr;
              </Button>
            </Link>
          </div>

          {pendingClaims.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="p-5 space-y-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={claim.status} />
                      <span className="font-bold text-sm text-gray-900">
                        {claim.item?.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                    <span className="font-bold text-gray-900 block mb-1">Claimant Verification Response:</span>
                    {claim.verification_answer}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-gray-500">
                      Claimant: <strong className="text-gray-900">{claim.claimant?.full_name}</strong> ({claim.claimant?.student_staff_id || 'ID on file'})
                    </span>

                    <Link href={`/claims/${claim.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <span>Adjudicate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white border border-gray-100 rounded-2xl text-xs text-gray-400 shadow-xs">
              Review queue is clear! All claims in the database have been resolved.
            </div>
          )}
        </div>

        {/* Right Col: Recent Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              Audit Stream
            </h3>
            <Link href="/admin/audit-logs" className="text-xs text-[#0793D4] font-semibold hover:underline">
              All logs &rarr;
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 font-bold uppercase">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-gray-900 font-medium">
                  {log.actor?.full_name || 'System Execution'}
                </div>
                <div className="text-[11px] text-gray-400 truncate font-mono">
                  Target: {log.entity_type} #{log.entity_id?.substring(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
