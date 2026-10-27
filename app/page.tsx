import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  ArrowRight,
  Sparkles,
  FileCheck2,
  Lock
} from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { ItemCard } from '@/components/items/ItemCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const recentItemsData = await repository.getItems({ limit: 4 });
  const metrics = await repository.getAdminMetrics();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-8 sm:pt-14 space-y-6 px-4">
        {/* Official NSUK Emblem */}
        <div className="flex justify-center">
          <img
            src="https://pg.nsuk.edu.ng/api/global/logo"
            alt="Nasarawa State University Keffi Emblem"
            className="h-20 sm:h-24 w-auto object-contain"
          />
        </div>

        {/* Institution Verification Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0793D4]/10 border border-[#0793D4]/25 text-[#0793D4] rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Nasarawa State University Keffi &bull; Asset Recovery Portal</span>
        </div>

        {/* Main Value Proposition Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Find what is lost. <br />
            <span className="text-[#0793D4]">Verify before return.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-500 leading-relaxed">
            Report misplaced campus belongings, discover algorithmic matches, and verify ownership through structured administrative adjudication.
          </p>
        </div>

        {/* Minimal Search Input */}
        <form action="/items" method="GET" className="max-w-xl mx-auto pt-2">
          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-[#0793D4] focus-within:border-transparent transition-all">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Search laptops, student IDs, keys, wallets, backpacks..."
              className="w-full px-3 py-2 text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <Button type="submit" variant="primary" size="sm" className="shrink-0">
              Search
            </Button>
          </div>
        </form>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/report/lost">
            <Button variant="warning" size="md" className="gap-2 font-semibold">
              <Plus className="w-4 h-4" />
              Report Lost Item
            </Button>
          </Link>
          <Link href="/report/found">
            <Button variant="primary" size="md" className="gap-2">
              <Plus className="w-4 h-4" />
              Report Found Item
            </Button>
          </Link>
          <Link href="/items">
            <Button variant="outline" size="md" className="gap-2">
              Browse Directory
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Modern Minimal Metrics Strip */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">{metrics.totalItems}</div>
            <div className="text-xs font-medium text-gray-500">Cataloged Reports</div>
          </div>
          <div className="space-y-1 lg:border-l lg:border-gray-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0793D4]">{metrics.foundCount}</div>
            <div className="text-xs font-medium text-gray-500">Found Assets</div>
          </div>
          <div className="space-y-1 sm:border-l sm:border-gray-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#79BF2B]">{metrics.claimedCount}</div>
            <div className="text-xs font-medium text-gray-500">Verified Recoveries</div>
          </div>
          <div className="space-y-1 sm:border-l sm:border-gray-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#9a7400]">{metrics.pendingClaims}</div>
            <div className="text-xs font-medium text-gray-500">Active Claims in Queue</div>
          </div>
        </div>
      </section>

      {/* 3-Step Verification Protocol */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            How Verification Works
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            A three-step security protocol designed to prevent false claims and protect students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#0793D4]/10 text-[#0793D4] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-gray-900">1. Centralized Cataloging</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Students and campus security report items with incident dates, campus locations, and optional photos.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FBBF07]/20 text-[#8a6800] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-gray-900">2. Private Ownership Clues</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Reporters establish confidential verification questions and serial numbers that only true owners can answer.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#79BF2B]/15 text-[#4d7f1b] flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-gray-900">3. Security Adjudication</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Campus Security reviews claim proof and verification answers before authorizing physical asset handover.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity from Database */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Recent Campus Reports</h2>
            <p className="text-xs sm:text-sm text-gray-500">Live records cataloged in the institutional database</p>
          </div>
          <Link href="/items" className="text-xs font-semibold text-[#0793D4] hover:underline flex items-center gap-1">
            Browse Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentItemsData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentItemsData.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Items Currently Cataloged"
            description="The database currently has no active lost or found reports. Be the first to report an item."
            actionText="Report an Item"
            actionHref="/report/lost"
          />
        )}
      </section>
    </div>
  );
}
