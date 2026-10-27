import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { PageIntro } from '@/components/ui/PageIntro';
import { ProfileForm } from '@/components/profile/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageIntro
        title="Profile Management"
        description="Review and update your university contact details. Your email remains confidential unless you explicitly choose to make it public on a specific report."
        badge="Account Settings"
      />
      <ProfileForm profile={user} />
    </div>
  );
}
