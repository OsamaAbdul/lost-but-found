import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matches = await repository.getMatchesForItem(id);
    return NextResponse.json({ item_id: id, matches, count: matches.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to calculate matches' }, { status: 500 });
  }
}
