import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'yellow' | 'red' | 'gray' | 'charcoal';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'gray', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    blue: 'bg-[#0793D4]/10 text-[#0793D4] border-[#0793D4]/25',
    green: 'bg-[#79BF2B]/12 text-[#4d7f1b] border-[#79BF2B]/30',
    amber: 'bg-[#FBBF07]/15 text-[#8a6800] border-[#FBBF07]/40',
    yellow: 'bg-[#FBBF07] text-gray-950 border-[#e5ad06] font-semibold',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    charcoal: 'bg-gray-900 text-white border-gray-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'open':
      return <Badge variant="blue">Open</Badge>;
    case 'matched':
      return <Badge variant="amber">Potential Match</Badge>;
    case 'claimed':
      return <Badge variant="green">Claimed</Badge>;
    case 'returned':
      return <Badge variant="charcoal">Returned</Badge>;
    case 'archived':
      return <Badge variant="gray">Archived</Badge>;
    case 'pending':
      return <Badge variant="amber">Pending Review</Badge>;
    case 'under_review':
      return <Badge variant="blue">Under Review</Badge>;
    case 'approved':
      return <Badge variant="green">Approved</Badge>;
    case 'rejected':
      return <Badge variant="red">Rejected</Badge>;
    case 'withdrawn':
      return <Badge variant="gray">Withdrawn</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
}
