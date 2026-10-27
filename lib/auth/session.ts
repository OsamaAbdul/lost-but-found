import { cookies } from 'next/headers';
import { Profile } from '@/types';
import { repository } from '@/lib/supabase/repository';

const SESSION_COOKIE_NAME = 'laf_session_user_id';

/**
 * Returns the currently authenticated user profile from cookies/session.
 * Defaults to the standard student profile (Alex Rivera) for frictionless preview if not set,
 * but allows switching to any profile (including admin) via login or account switch.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionUserId) {
    const profile = await repository.getProfileById(sessionUserId);
    if (profile) return profile;
  }

  // Default to student profile in database or first active profile
  const defaultUser =
    (await repository.getProfileByEmail('alex.rivera@student.university.edu')) ||
    (await repository.getAllProfiles())[0] ||
    null;
  return defaultUser;
}

export async function setSessionUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
