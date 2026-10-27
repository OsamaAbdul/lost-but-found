import { z } from 'zod';
import { ITEM_CATEGORIES } from '@/types';

export const reportItemSchema = z.object({
  type: z.enum(['lost', 'found'], {
    message: 'Item type must be either "lost" or "found".',
  }),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title cannot exceed 120 characters.')
    .trim(),
  category: z.enum(ITEM_CATEGORIES, {
    message: 'Please select a valid item category.',
  }),
  description: z
    .string()
    .min(10, 'Please provide a clear description (at least 10 characters).')
    .max(2000, 'Description cannot exceed 2000 characters.')
    .trim(),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD.')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      // Allow up to tomorrow to handle slight timezone differences
      now.setDate(now.getDate() + 1);
      return date <= now;
    }, 'Incident date cannot be in the future.'),
  location: z
    .string()
    .min(3, 'Location description must be at least 3 characters.')
    .max(200, 'Location description cannot exceed 200 characters.')
    .trim(),
  secret_verification_details: z
    .string()
    .max(1000, 'Confidential details cannot exceed 1000 characters.')
    .optional()
    .nullable(),
  verification_question: z
    .string()
    .max(300, 'Verification question cannot exceed 300 characters.')
    .optional()
    .nullable(),
  contact_email_public: z.boolean().default(false),
  image_urls: z.array(z.string().url('Must be a valid URL')).optional().default([]),
});

export type ReportItemInput = z.infer<typeof reportItemSchema>;

export const evidenceItemSchema = z.object({
  evidence_type: z.enum([
    'purchase_receipt',
    'photo',
    'serial_number',
    'identification',
    'other',
  ]),
  description: z
    .string()
    .min(3, 'Evidence description must be at least 3 characters.')
    .max(500, 'Description cannot exceed 500 characters.')
    .trim(),
  file_url: z.string().url('Evidence file must be a valid URL').optional().nullable(),
});

export const submitClaimSchema = z.object({
  item_id: z.string().min(3, 'Valid item ID is required.').trim(),
  verification_answer: z
    .string()
    .min(5, 'Verification answer must be at least 5 characters.')
    .max(1000, 'Verification answer cannot exceed 1000 characters.')
    .trim(),
  claim_statement: z
    .string()
    .min(10, 'Claim statement must be at least 10 characters.')
    .max(2000, 'Claim statement cannot exceed 2000 characters.')
    .trim(),
  evidence: z.array(evidenceItemSchema).optional().default([]),
});

export type SubmitClaimInput = z.infer<typeof submitClaimSchema>;

export const adminDecisionSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected'], {
    message: 'Decision status must be under_review, approved, or rejected.',
  }),
  decision_reason: z
    .string()
    .min(5, 'A clear reason of at least 5 characters is required for administrative audit.')
    .max(1000, 'Reason cannot exceed 1000 characters.')
    .trim(),
});

export type AdminDecisionInput = z.infer<typeof adminDecisionSchema>;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name cannot exceed 80 characters.')
    .trim(),
  phone: z
    .string()
    .max(30, 'Phone number cannot exceed 30 characters.')
    .optional()
    .nullable(),
  student_staff_id: z
    .string()
    .max(40, 'Student/Staff ID cannot exceed 40 characters.')
    .optional()
    .nullable(),
  department: z
    .string()
    .max(100, 'Department cannot exceed 100 characters.')
    .optional()
    .nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const searchFilterSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['all', 'lost', 'found']).optional().default('all'),
  category: z.string().optional(),
  location: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});

export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
