'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Layers, ShieldCheck, Info } from 'lucide-react';
import { Notification } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface NotificationListProps {
  initialNotifications: Notification[];
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter((x) => !x.is_read)) {
      await markAsRead(n.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match_found':
        return <Layers className="w-4 h-4 text-[#735500]" />;
      case 'claim_update':
        return <ShieldCheck className="w-4 h-4 text-[#79BF2B]" />;
      default:
        return <Info className="w-4 h-4 text-[#0793D4]" />;
    }
  };

  return (
    <div className="space-y-4">
      {notifications.some((n) => !n.is_read) && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs">
            Mark all as read
          </Button>
        </div>
      )}

      {notifications.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xs divide-y divide-gray-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors ${
                n.is_read ? 'bg-white' : 'bg-[#0793D4]/5'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#0793D4] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">{n.message}</p>
                  <span className="text-[10px] text-gray-400 font-medium block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link href={n.link} onClick={() => !n.is_read && markAsRead(n.id)}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                )}

                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! You will receive alerts here when potential matches or claim updates are logged."
        />
      )}
    </div>
  );
}
