'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw } from 'lucide-react';
import { ITEM_CATEGORIES } from '@/types';
import { Button } from '@/components/ui/Button';

interface ItemFilterBarProps {
  initialFilters: {
    q?: string;
    type?: string;
    category?: string;
    location?: string;
    status?: string;
  };
  onFilterChange?: (filters: any) => void;
}

export function ItemFilterBar({ initialFilters, onFilterChange }: ItemFilterBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialFilters.q || '');
  const [type, setType] = useState(initialFilters.type || 'all');
  const [category, setCategory] = useState(initialFilters.category || 'all');
  const [location, setLocation] = useState(initialFilters.location || '');

  const triggerUpdate = (newType = type, newCat = category, newQ = q, newLoc = location) => {
    const filters: Record<string, string> = {};
    if (newQ.trim()) filters.q = newQ.trim();
    if (newType !== 'all') filters.type = newType;
    if (newCat !== 'all') filters.category = newCat;
    if (newLoc.trim()) filters.location = newLoc.trim();

    if (onFilterChange) {
      onFilterChange({ ...filters, page: 1 });
    } else {
      const query = new URLSearchParams(filters).toString();
      router.push(`/items${query ? `?${query}` : ''}`);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerUpdate();
  };

  const handleReset = () => {
    setQ('');
    setType('all');
    setCategory('all');
    setLocation('');
    if (onFilterChange) {
      onFilterChange({ page: 1 });
    } else {
      router.push('/items');
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2.5 items-center">
        {/* Search input with icon */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items by keywords, color, or location..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0793D4] focus:outline-none transition-all"
          />
        </div>

        {/* Quick Type Selector Pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-50 border border-gray-200/80 rounded-xl text-xs w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setType('all');
              triggerUpdate('all', category, q, location);
            }}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
              type === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setType('lost');
              triggerUpdate('lost', category, q, location);
            }}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
              type === 'lost'
                ? 'bg-[#FBBF07] text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => {
              setType('found');
              triggerUpdate('found', category, q, location);
            }}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
              type === 'found'
                ? 'bg-[#0793D4] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Found
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-44 shrink-0">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              triggerUpdate(type, e.target.value, q, location);
            }}
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0793D4] focus:outline-none transition-all text-gray-700"
          >
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Button type="submit" variant="primary" size="sm" className="flex-1 md:flex-none">
            Filter
          </Button>

          {(q || type !== 'all' || category !== 'all' || location) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-600 px-2"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
