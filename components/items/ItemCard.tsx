import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Item } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';

export interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const primaryImage = item.images && item.images.length > 0 ? item.images[0].image_url : null;
  const isLost = item.type === 'lost';

  return (
    <Link
      href={`/items/${item.id}`}
      className="group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Visual media container with floating pill badge */}
      <div className="relative aspect-[16/10] w-full bg-gray-50 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1.5 bg-gray-50/80">
            <ImageIcon className="w-7 h-7 stroke-1 text-gray-300" />
            <span className="text-[11px] font-medium text-gray-400">No image cataloged</span>
          </div>
        )}

        {/* Floating pill badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
              isLost
                ? 'bg-[#FBBF07] text-gray-950 shadow-xs'
                : 'bg-[#0793D4] text-white shadow-xs'
            }`}
          >
            {isLost ? 'Lost' : 'Found'}
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-medium bg-white/90 backdrop-blur text-gray-700 rounded-full border border-gray-100 shadow-xs">
            {item.category}
          </span>
        </div>

        {/* Status pill on right */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#0793D4] transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Strip */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0 font-medium">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{item.incident_date}</span>
          </div>
        </div>

        {/* Micro-action footer */}
        <div className="pt-1 flex items-center justify-between text-xs font-semibold text-[#0793D4] group-hover:translate-x-0.5 transition-transform">
          <span>Inspect verification details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
