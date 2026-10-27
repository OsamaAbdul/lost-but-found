import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 md:p-16 text-center bg-white border border-gray-100 rounded-3xl shadow-xs">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-4 border border-gray-100">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionText}
          </Button>
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
