import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { reportItemSchema, searchFilterSchema } from '@/lib/validation/schemas';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedParams = searchFilterSchema.safeParse({
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsedParams.error.format() },
        { status: 400 }
      );
    }

    const data = await repository.getItems(parsedParams.data);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const json = await request.json();
    const validation = reportItemSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 422 }
      );
    }

    const item = await repository.createItem(validation.data, user.id);
    return NextResponse.json({ item, message: 'Item report submitted successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}
