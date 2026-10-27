import { describe, it, expect, beforeAll } from 'vitest';
import { repository } from '@/lib/supabase/repository';

describe('Claim Verification & Adjudication Workflow with Real Database', () => {
  let adminId: string;
  let studentAlexId: string;
  let testItemId: string;
  let createdClaimId: string;

  beforeAll(async () => {
    const profiles = await repository.getAllProfiles();
    const admin = profiles.find((p) => p.role === 'admin') || profiles[0];
    const user = profiles.find((p) => p.role === 'user') || profiles[1];

    adminId = admin.id;
    studentAlexId = user.id;

    // Create a dedicated test item in the database
    const testItem = await repository.createItem(
      {
        type: 'found',
        title: 'Vitest Test Chemistry Calculator',
        category: 'Electronics',
        description: 'TI-84 Plus scientific calculator left in Lab 3.',
        incident_date: '2026-10-27',
        location: 'Science Building, Room 302',
        secret_verification_details: 'Serial #9981-TEST, back battery cover has initials TX.',
        verification_question: 'What initials are carved on battery lid?',
        contact_email_public: false,
      },
      adminId
    );

    testItemId = testItem.id;
  });

  it('allows an ordinary student to submit an ownership claim on a found item', async () => {
    const claim = await repository.submitClaim(
      {
        item_id: testItemId,
        verification_answer: 'Initials TX carved on battery lid.',
        claim_statement: 'Left after 3 PM chemistry practical session.',
        evidence: [],
      },
      studentAlexId
    );

    expect(claim).toBeDefined();
    expect(claim.status).toBe('pending');
    expect(claim.claimant_id).toBe(studentAlexId);
    createdClaimId = claim.id;
  });

  it('prevents duplicate active claims on the same item by the same claimant', async () => {
    await expect(
      repository.submitClaim(
        {
          item_id: testItemId,
          verification_answer: 'Duplicate answer attempt.',
          claim_statement: 'Duplicate statement.',
          evidence: [],
        },
        studentAlexId
      )
    ).rejects.toThrow(/already have an active claim/);
  });

  it('rejects ordinary user from attempting to approve claims (role enforcement)', async () => {
    await expect(
      repository.decideClaim(
        createdClaimId,
        { status: 'approved', decision_reason: 'Unauthorized user self approval attempt' },
        studentAlexId,
        'user'
      )
    ).rejects.toThrow(/Only authorized administrators/);
  });

  it('allows authorized administrator to approve a claim and updates item status to claimed', async () => {
    const decided = await repository.decideClaim(
      createdClaimId,
      {
        status: 'approved',
        decision_reason: 'Verified matching initials TX on battery lid and student timetable.',
      },
      adminId,
      'admin'
    );

    expect(decided.status).toBe('approved');
    expect(decided.reviewer_id).toBe(adminId);

    // Verify item is now marked claimed in the database
    const item = await repository.getItemById(testItemId, adminId, 'admin');
    expect(item?.status).toBe('claimed');
  });

  it('prevents conflicting claim submissions when an item is already claimed', async () => {
    await expect(
      repository.submitClaim(
        {
          item_id: testItemId,
          verification_answer: 'Late claim attempt',
          claim_statement: 'Late claim statement',
          evidence: [],
        },
        studentAlexId
      )
    ).rejects.toThrow(/cannot be claimed/);
  });
});
