import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';
import { PageIntro } from '@/components/ui/PageIntro';
import { NotificationList } from '@/components/notifications/NotificationList';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || '22222222-2222-2222-2222-222222222222';
  const notifications = await repository.getNotifications(userId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageIntro
        title="System Notifications"
        description="Stay notified about potential matches for your reported items and status changes to your active ownership claims."
        badge="Activity Center"
      />
      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
