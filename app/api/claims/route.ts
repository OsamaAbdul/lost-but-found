import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const itemId = searchParams.get('item_id') || undefined;

    const claims = await repository.getClaims({
      userId: user.id,
      userRole: user.role,
      status,
      itemId,
    });

    return NextResponse.json({ claims, count: claims.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch claims' }, { status: 500 });
  }
}
