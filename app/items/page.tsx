import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { repository } from '@/lib/supabase/repository';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemFilterBar } from '@/components/items/ItemFilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageIntro } from '@/components/ui/PageIntro';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

interface ItemsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const data = await repository.getItems({
    q: params.q,
    type: (params.type as any) || 'all',
    category: params.category,
    location: params.location,
    status: params.status,
    page,
    limit: 12,
  });

  return (
    <div className="space-y-6 pb-12">
      <PageIntro
        title="Campus Directory"
        description="Search active lost and found reports cataloged in the institutional database."
        badge="Asset Directory"
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

      {/* Filter Bar */}
      <ItemFilterBar
        initialFilters={{
          q: params.q,
          type: params.type,
          category: params.category,
          location: params.location,
          status: params.status,
        }}
      />

      {/* Results Count & Meta */}
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <div>
          Showing <span className="font-semibold text-gray-700">{data.items.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{data.total}</span> items
          {params.q && <span> for &ldquo;{params.q}&rdquo;</span>}
        </div>
        {data.totalPages > 1 && (
          <div>
            Page {data.page} of {data.totalPages}
          </div>
        )}
      </div>

      {/* Items Grid */}
      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items found"
          description="We couldn't find any items matching your active search filters. Try adjusting keywords or clearing category filters."
          actionText="Clear All Filters"
          actionHref="/items"
        />
      )}

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-100">
          {data.page > 1 && (
            <Link href={`/items?page=${data.page - 1}`}>
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          <span className="text-xs text-gray-500 px-3">
            Page {data.page} of {data.totalPages}
          </span>
          {data.page < data.totalPages && (
            <Link href={`/items?page=${data.page + 1}`}>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
