import { describe, it, expect } from 'vitest';
import { reportItemSchema, submitClaimSchema, adminDecisionSchema } from '@/lib/validation/schemas';

describe('Zod Validation Schemas', () => {
  describe('reportItemSchema', () => {
    it('validates a correct item report payload', () => {
      const valid = {
        type: 'lost',
        title: 'Dell XPS 15 Laptop',
        category: 'Electronics',
        description: 'Black laptop in sleeve left in Library Room 101.',
        incident_date: '2026-10-25',
        location: 'Main Library 1st Floor',
      };
      const result = reportItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects an item with an invalid category', () => {
      const invalid = {
        type: 'lost',
        title: 'Dell Laptop',
        category: 'Vehicles', // Invalid category
        description: 'Left in room.',
        incident_date: '2026-10-25',
        location: 'Library',
      };
      const result = reportItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects short descriptions below 10 characters', () => {
      const invalid = {
        type: 'found',
        title: 'Keys',
        category: 'Keys',
        description: 'Keys', // Too short
        incident_date: '2026-10-25',
        location: 'Student Union',
      };
      const result = reportItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('submitClaimSchema', () => {
    it('validates a complete claim submission', () => {
      const valid = {
        item_id: 'a1111111-1111-1111-1111-111111111111',
        verification_answer: 'Keychain has blue carabiner and dorm room key 204.',
        claim_statement: 'I dropped this outside the cafeteria yesterday afternoon.',
        evidence: [
          {
            evidence_type: 'identification',
            description: 'University Student ID STU-2024-8831',
          },
        ],
      };
      const result = submitClaimSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('fails when item_id is missing or too short', () => {
      const invalid = {
        item_id: 'ab',
        verification_answer: 'My keys',
        claim_statement: 'Lost yesterday.',
      };
      const result = submitClaimSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('adminDecisionSchema', () => {
    it('requires a justification reason when approving', () => {
      const invalid = {
        status: 'approved',
        decision_reason: '', // Empty reason
      };
      const result = adminDecisionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('accepts valid decision with clear justification', () => {
      const valid = {
        status: 'approved',
        decision_reason: 'Verified serial number matched Apple invoice and student photo ID.',
      };
      const result = adminDecisionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
