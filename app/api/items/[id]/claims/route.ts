import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { submitClaimSchema } from '@/lib/validation/schemas';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to submit claims.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = submitClaimSchema.safeParse({
      ...json,
      item_id: id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid claim submission', details: validation.error.format() },
        { status: 422 }
      );
    }

    const claim = await repository.submitClaim(validation.data, user.id);
    return NextResponse.json(
      { claim, message: 'Ownership claim submitted successfully for administrative review.' },
      { status: 201 }
    );
  } catch (error: any) {
    const isConflict = error.message.includes('already have an active claim') || error.message.includes('cannot be claimed');
    const isForbidden = error.message.includes('cannot submit a claim on an item you reported');
    const status = isConflict ? 409 : isForbidden ? 403 : 400;

    return NextResponse.json({ error: error.message }, { status });
  }
}
