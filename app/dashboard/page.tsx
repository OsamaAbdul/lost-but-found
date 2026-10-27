import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';
import { PageIntro } from '@/components/ui/PageIntro';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ItemCard } from '@/components/items/ItemCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id || '';

  // Fetch real items and claims from Supabase database
  const myItems = userId ? await repository.getItemsByReporter(userId) : [];
  const myClaims = userId ? await repository.getClaims({ claimantId: userId }) : [];
  const myMatches = userId ? await repository.getUserMatches(userId) : [];
  const totalMatchCount = myMatches.reduce((acc, curr) => acc + curr.matches.length, 0);
  const approvedReturns = myClaims.filter((c) => c.status === 'approved').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageIntro
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'User'}`}
        description="Monitor your active lost and found submissions, match candidates, and verified claims."
        badge="Activity Dashboard"
        actions={
          <div className="flex gap-2">
            <Link href="/report/lost">
              <Button variant="warning" size="sm" className="gap-1.5 font-semibold">
                <Plus className="w-3.5 h-3.5" />
                Report Lost
              </Button>
            </Link>
            <Link href="/report/found">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Report Found
              </Button>
            </Link>
          </div>
        }
      />

      {/* User Profile Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0793D4] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{user?.full_name}</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                user?.role === 'admin'
                  ? 'bg-[#0793D4] text-white'
                  : 'bg-[#FBBF07] text-gray-950'
              }`}>
                {user?.role === 'admin' ? 'Campus Security' : 'Student'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {user?.email} &bull; ID: {user?.student_staff_id || 'Not specified'} &bull; {user?.department || 'General'}
            </p>
          </div>
        </div>

        <Link href="/profile">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Modern Minimal Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-gray-500">My Reports</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{myItems.length}</div>
          <span className="text-[11px] text-gray-400 block">Cataloged items</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-gray-500">My Claims</span>
            <ShieldCheck className="w-4 h-4 text-[#0793D4]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0793D4]">{myClaims.length}</div>
          <span className="text-[11px] text-gray-400 block">Submitted claims</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-gray-500">Potential Matches</span>
            <Layers className="w-4 h-4 text-[#9a7400]" />
          </div>
          <div className="text-2xl font-extrabold text-[#9a7400]">{totalMatchCount}</div>
          <Link href="/matches" className="text-[11px] text-[#0793D4] font-semibold hover:underline block">
            View matches &rarr;
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-gray-500">Approved Returns</span>
            <CheckCircle2 className="w-4 h-4 text-[#79BF2B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#79BF2B]">{approvedReturns}</div>
          <span className="text-[11px] text-gray-400 block">Verified recoveries</span>
        </div>
      </div>

      {/* Section: My Reported Belongings */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">Items Logged by You</h3>
          <Link href="/items" className="text-xs font-semibold text-[#0793D4] hover:underline flex items-center gap-1">
            Search All Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Items Reported Yet"
            description="You have not cataloged any lost or found belongings under this account."
            actionText="Report an Item"
            actionHref="/report/lost"
          />
        )}
      </section>

      {/* Section: My Claims Status */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">Your Active Claims</h3>
          <Link href="/claims" className="text-xs font-semibold text-[#0793D4] hover:underline flex items-center gap-1">
            View Claims Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myClaims.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
            {myClaims.slice(0, 4).map((claim) => (
              <div
                key={claim.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-gray-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={claim.status} />
                    <span className="font-bold text-gray-900 text-sm">{claim.item?.title}</span>
                  </div>
                  <p className="text-gray-500 line-clamp-1">{claim.claim_statement}</p>
                </div>

                <Link href={`/claims/${claim.id}`}>
                  <Button variant="outline" size="sm">
                    Inspect Claim
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-gray-100 rounded-2xl text-xs text-gray-400">
            No claims currently filed on your account.
          </div>
        )}
      </section>
    </div>
  );
}
