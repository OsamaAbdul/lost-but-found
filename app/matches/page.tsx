import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';
import { PageIntro } from '@/components/ui/PageIntro';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const user = await getCurrentUser();
  const userId = user?.id || '';
  const matchesData = userId ? await repository.getUserMatches(userId) : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageIntro
        title="Algorithmic Matches"
        description="Correlated pairs identified across your lost reports and cataloged campus belongings."
        badge="Matching Engine"
        actions={
          <Link href="/items">
            <Button variant="outline" size="sm">
              Browse Directory
            </Button>
          </Link>
        }
      />

      {/* Matching Transparency Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-xs space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Sparkles className="w-4 h-4 text-[#0793D4]" />
          <span>Explainable Matching Criteria</span>
        </div>
        <p className="text-gray-500 leading-relaxed">
          Matches are generated deterministically based on Category compatibility (35 pts), Description keywords (30 pts), Date proximity (20 pts), and Location similarity (15 pts). Suggestions are probabilistic and require ownership challenge verification.
        </p>
      </div>

      {matchesData.length > 0 ? (
        <div className="space-y-6">
          {matchesData.map(({ userItem, matches }) => (
            <div
              key={userItem.id}
              className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Your Reported Item</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                    <Link href={`/items/${userItem.id}`} className="hover:text-[#0793D4] transition-colors">
                      {userItem.title}
                    </Link>
                  </h3>
                  <div className="text-xs text-gray-400 flex gap-3 mt-1 font-medium">
                    <span>{userItem.category}</span>
                    <span>&bull;</span>
                    <span>{userItem.location}</span>
                    <span>&bull;</span>
                    <span>{userItem.incident_date}</span>
                  </div>
                </div>

                <div className="text-xs px-3 py-1 bg-[#FBBF07]/15 text-[#8a6800] font-bold rounded-full self-start sm:self-auto">
                  {matches.length} Candidate {matches.length === 1 ? 'Match' : 'Matches'}
                </div>
              </div>

              {/* Matched candidates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {matches.map(({ item: candidate, score, breakdown }) => (
                  <div
                    key={candidate.id}
                    className="p-5 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#0793D4] text-white">
                          Found Asset
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-gray-900 text-white rounded-full">
                          {score}% Confidence
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-gray-900">
                          <Link href={`/items/${candidate.id}`} className="hover:text-[#0793D4] transition-colors">
                            {candidate.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {candidate.description}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-gray-100 text-[11px] space-y-1.5">
                        <span className="font-semibold text-gray-700 block">
                          Algorithm Match Rationale:
                        </span>
                        {breakdown.explanation.map((exp, idx) => (
                          <div key={idx} className="text-gray-500 flex items-start gap-1.5">
                            <span className="text-[#0793D4] font-bold">&bull;</span>
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                      <Link href={`/items/${candidate.id}`}>
                        <Button variant="outline" size="sm">
                          Inspect Details
                        </Button>
                      </Link>

                      <Link href={`/items/${candidate.id}#claim-section`}>
                        <Button variant="primary" size="sm">
                          Claim Item
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Algorithmic Matches Found"
          description="The matching engine has not identified overlapping candidates for your reports yet. Check back as new campus items are cataloged."
          actionText="Browse Campus Directory"
          actionHref="/items"
        />
      )}
    </div>
  );
}
