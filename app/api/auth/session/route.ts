import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser, clearSessionUser, getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/supabase/repository';

export async function GET() {
  const user = await getCurrentUser();
  const allProfiles = await repository.getAllProfiles();
  return NextResponse.json({ user, availableProfiles: allProfiles });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { userId, email } = json;

    let targetUser = null;
    if (userId) {
      targetUser = await repository.getProfileById(userId);
    } else if (email) {
      const profiles = await repository.getAllProfiles();
      targetUser = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    await setSessionUser(targetUser.id);
    return NextResponse.json({
      user: targetUser,
      message: `Signed in as ${targetUser.full_name} (${targetUser.role})`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionUser();
  return NextResponse.json({ message: 'Logged out successfully' });
}
