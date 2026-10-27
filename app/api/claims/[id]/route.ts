import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { adminDecisionSchema } from '@/lib/validation/schemas';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const claim = await repository.getClaimById(id, user.id, user.role);
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error: any) {
    const status = error.message.includes('Access denied') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const json = await request.json();

    // Check if claimant is withdrawing
    if (json.action === 'withdraw') {
      const withdrawn = await repository.withdrawClaim(id, user.id);
      return NextResponse.json({
        claim: withdrawn,
        message: 'Claim has been withdrawn successfully.',
      });
    }

    // Otherwise, this is an administrative claim decision
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can approve, reject, or review claims.' },
        { status: 403 }
      );
    }

    const validation = adminDecisionSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid decision payload', details: validation.error.format() },
        { status: 422 }
      );
    }

    const decidedClaim = await repository.decideClaim(
      id,
      validation.data,
      user.id,
      user.role
    );

    return NextResponse.json({
      claim: decidedClaim,
      message: `Claim status successfully updated to ${decidedClaim.status}.`,
    });
  } catch (error: any) {
    const isConflict = error.message.includes('already marked as');
    const status = isConflict ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
