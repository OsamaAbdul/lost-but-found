import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const metrics = await repository.getAdminMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve metrics' }, { status: 500 });
  }
}
