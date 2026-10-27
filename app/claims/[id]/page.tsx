import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ExternalLink 
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';
import { StatusBadge } from '@/components/ui/Badge';
import { ClaimDetailActions } from '@/components/claims/ClaimDetailActions';

export const dynamic = 'force-dynamic';

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const userId = user?.id || '';
  const userRole = user?.role || 'user';

  const claim = await repository.getClaimById(id);

  if (!claim || !claim.item) {
    notFound();
  }

  const isClaimant = claim.claimant_id === userId;
  const isReporter = claim.item.reporter_id === userId;
  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <Link href="/claims" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Claims
        </Link>
      </div>

      {/* Main Claim Detail Surface */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden space-y-6 shadow-xs">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ownership Claim</span>
              <StatusBadge status={claim.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Claim for: {claim.item.title}
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              Reference: {claim.id}
            </p>
          </div>

          <ClaimDetailActions
            claim={claim}
            item={claim.item}
            currentUserRole={userRole}
            isClaimant={isClaimant}
          />
        </div>

        {/* Claim Status Banner */}
        <div className="px-6 sm:px-8">
          <div className="p-5 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-900 uppercase tracking-wider">
              <span>Claim Adjudication Status</span>
              <span>{claim.status.replace('_', ' ').toUpperCase()}</span>
            </div>

            {claim.status === 'pending' && (
              <p className="text-xs text-gray-500 leading-relaxed">
                Your claim has been queued for administrative review. Campus Security will verify your answers against confidential item records.
              </p>
            )}

            {claim.status === 'under_review' && (
              <p className="text-xs text-[#0793D4] font-medium">
                An administrator is currently reviewing the submitted verification clues and evidence.
              </p>
            )}

            {claim.status === 'approved' && (
              <div className="p-4 bg-[#79BF2B]/10 border border-[#79BF2B]/30 rounded-xl text-xs text-gray-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#4d7f1b]">
                  <CheckCircle2 className="w-4 h-4 text-[#79BF2B]" />
                  Claim Formally Approved by Campus Security
                </div>
                <p>
                  <strong>Approval Reason:</strong> {claim.decision_reason || 'Verified legitimate owner.'}
                </p>
                <p className="text-[11px] text-gray-600">
                  You may present your student/staff ID at Campus Security HQ to collect the physical asset.
                </p>
              </div>
            )}

            {claim.status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-700">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Claim Rejected
                </div>
                <p>
                  <strong>Justification:</strong> {claim.decision_reason || 'Verification proof inadequate.'}
                </p>
              </div>
            )}

            {claim.status === 'withdrawn' && (
              <p className="text-xs text-gray-400">
                This claim was withdrawn by the claimant.
              </p>
            )}
          </div>
        </div>

        {/* Claim Core Information Grid */}
        <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Verification Answer & Statement */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Claimant&apos;s Verification Challenge Answer
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-800 leading-relaxed font-mono">
                {claim.verification_answer}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Ownership Statement & Circumstances
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-700 leading-relaxed">
                {claim.claim_statement}
              </div>
            </div>
          </div>

          {/* Right: Item Reference & Claimant Profile */}
          <div className="space-y-4">
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                Cataloged Item
              </h3>
              <div>
                <span className="text-gray-400 block text-[11px]">Title</span>
                <Link
                  href={`/items/${claim.item.id}`}
                  className="font-bold text-gray-900 text-sm hover:text-[#0793D4] flex items-center gap-1 transition-colors"
                >
                  {claim.item.title} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Category</span>
                <span className="font-semibold text-gray-800">{claim.item.category}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Found Location</span>
                <span className="font-semibold text-gray-800">{claim.item.location}</span>
              </div>
            </div>

            {/* Claimant Record */}
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                Claimant Profile
              </h3>
              <p className="font-bold text-gray-900 text-sm">{claim.claimant?.full_name}</p>
              <p className="text-gray-500">{claim.claimant?.email}</p>
              <p className="text-gray-500 font-mono text-[11px]">
                ID: {claim.claimant?.student_staff_id || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
