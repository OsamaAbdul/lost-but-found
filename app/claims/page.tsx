import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';
import { PageIntro } from '@/components/ui/PageIntro';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function ClaimsPage() {
  const user = await getCurrentUser();
  const claims = await repository.getClaims(
    user?.role === 'admin' ? {} : { claimantId: user?.id }
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageIntro
        title="Ownership Claims"
        description="Review the live status of your claims and security verification decisions."
        badge="Claims Directory"
        actions={
          <Link href="/items">
            <Button variant="outline" size="sm">
              Search Found Items
            </Button>
          </Link>
        }
      />

      {claims.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-100 shadow-xs">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={claim.status} />
                  <span className="text-xs text-gray-400">
                    Logged: {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  <Link href={`/claims/${claim.id}`} className="hover:text-[#0793D4] transition-colors">
                    {claim.item?.title || 'Cataloged Item'}
                  </Link>
                </h3>

                <p className="text-xs text-gray-500 line-clamp-1 max-w-2xl">
                  {claim.claim_statement}
                </p>

                {claim.decision_reason && (
                  <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2 max-w-xl">
                    <span className="font-semibold text-gray-900">Security Decision:</span>{' '}
                    {claim.decision_reason}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Link href={`/claims/${claim.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>Inspect</span>
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
          title="No Claims on Record"
          description="You haven't filed any ownership claims. When you locate a found item matching your belongings, submit a verification claim."
          actionText="Browse Found Items"
          actionHref="/items?type=found"
        />
      )}
    </div>
  );
}
