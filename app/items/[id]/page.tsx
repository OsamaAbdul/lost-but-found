import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  ArrowLeft, 
  Tag, 
  HelpCircle,
  ShieldAlert,
  Layers,
  Lock
} from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { getCurrentUser } from '@/lib/auth/session';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubmitClaimForm } from '@/components/claims/SubmitClaimForm';

export const dynamic = 'force-dynamic';

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const item = await repository.getItemById(id, currentUser?.id, currentUser?.role);

  if (!item) {
    notFound();
  }

  const isLost = item.type === 'lost';
  const isReporter = currentUser?.id === item.reporter_id;
  const isAdmin = currentUser?.role === 'admin';
  const canSeeConfidential = isReporter || isAdmin;
  const canClaim = !isReporter && item.type === 'found' && (item.status === 'open' || item.status === 'matched');
  const matches = await repository.getItemMatches(item.id);

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div>
        <Link href="/items" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
      </div>

      {/* Main Item Hero Surface */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        {/* Header Row */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  isLost
                    ? 'bg-[#FBBF07] text-gray-950 shadow-xs'
                    : 'bg-[#0793D4] text-white shadow-xs'
                }`}
              >
                {isLost ? 'Lost Item' : 'Found Asset'}
              </span>
              <Badge variant="gray" size="sm">
                <Tag className="w-3 h-3 mr-1 inline" />
                {item.category}
              </Badge>
              <StatusBadge status={item.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canClaim && (
              <a href="#claim-section">
                <Button variant="primary" size="md" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Claim Item
                </Button>
              </a>
            )}
            {matches.length > 0 && (
              <a href="#matches-section">
                <Button variant="outline" size="md" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Matches ({matches.length})
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Photos & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual media */}
            {item.images && item.images.length > 0 ? (
              <div className="aspect-[16/10] w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={item.images[0].image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-44 w-full bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                <ShieldCheck className="w-7 h-7 text-gray-300 stroke-1" />
                <span className="text-xs text-gray-500 font-medium">
                  No public photograph uploaded for this item.
                </span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Item Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                {item.description}
              </p>
            </div>

            {/* Verification Challenge Notice */}
            {item.verification_question && (
              <div className="bg-[#0793D4]/8 border border-[#0793D4]/20 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0793D4] uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  Verification Challenge Question
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  &ldquo;{item.verification_question}&rdquo;
                </p>
                <p className="text-xs text-gray-500">
                  Claimants will be required to answer this question to substantiate ownership before physical collection.
                </p>
              </div>
            )}

            {/* Confidential Clues (Privileged Access) */}
            {canSeeConfidential ? (
              <div className="bg-[#FBBF07]/12 border border-[#FBBF07]/35 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-[#8a6800]" />
                    Confidential Reporter Record (Restricted Access)
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBBF07] text-gray-950 font-bold">
                    PRIVATE
                  </span>
                </div>
                <p className="text-xs text-gray-900 font-mono bg-white p-3 rounded-xl border border-[#FBBF07]/40">
                  {item.secret_verification_details || '[No confidential details recorded]'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Ground truth visible only to the reporter and Campus Security administrators.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-400 border border-gray-100">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Confidential serial numbers and identifying marks are protected by security policy.</span>
              </div>
            )}
          </div>

          {/* Right Column: Metadata Panel */}
          <div className="space-y-4">
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-4 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                Report Metadata
              </h3>

              <div className="space-y-3.5">
                <div>
                  <span className="text-gray-400 block text-[11px]">Incident Date</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.incident_date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Campus Location</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Logged By</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.reporter?.full_name || 'Campus Member'}</span>
                  </div>
                  {item.reporter?.department && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {item.reporter.department}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Database Record ID</span>
                  <span className="font-mono text-[10px] text-gray-500 break-all block mt-0.5">
                    {item.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Campus Security Dispatch Notice */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl text-xs space-y-1.5 text-gray-600 shadow-xs">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#79BF2B]" />
                Security Counter Collection
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Found property is held at Security HQ. Claims must be approved online before physical item release.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Claim Section */}
      {canClaim && (
        <section id="claim-section" className="pt-4">
          <SubmitClaimForm item={item} claimantId={currentUser?.id || ''} />
        </section>
      )}

      {/* Potential Correlated Matches Section */}
      {matches.length > 0 && (
        <section id="matches-section" className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Potential Matches ({matches.length})
              </h2>
              <p className="text-xs text-gray-400">
                Calculated by explainable scoring evaluating category, date, and description overlap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(({ item: matchedItem, score, breakdown }) => (
              <div
                key={matchedItem.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      matchedItem.type === 'lost'
                        ? 'bg-[#FBBF07] text-gray-950'
                        : 'bg-[#0793D4] text-white'
                    }`}
                  >
                    {matchedItem.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-gray-100 rounded-full text-gray-700">
                    {score}% Confidence
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    <Link href={`/items/${matchedItem.id}`} className="hover:text-[#0793D4] transition-colors">
                      {matchedItem.title}
                    </Link>
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {matchedItem.description}
                  </p>
                </div>

                <div className="bg-gray-50/60 p-3 rounded-xl text-[11px] space-y-1 text-gray-600 border border-gray-100">
                  <div className="font-semibold text-gray-800">Scoring Factor Breakdown:</div>
                  {breakdown.explanation.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0793D4]"></span>
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex justify-end">
                  <Link href={`/items/${matchedItem.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Inspect Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
