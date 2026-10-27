export type UserRole = 'user' | 'admin';

export type ItemType = 'lost' | 'found';

export type ItemStatus = 'open' | 'matched' | 'claimed' | 'returned' | 'archived';

export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

export type EvidenceType = 'purchase_receipt' | 'photo' | 'serial_number' | 'identification' | 'other';

export type NotificationType = 'claim_update' | 'match_found' | 'item_update' | 'system';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string | null;
  student_staff_id?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemImage {
  id: string;
  item_id: string;
  image_url: string;
  storage_path: string;
  is_primary: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  incident_date: string;
  location: string;
  status: ItemStatus;
  reporter_id: string;
  reporter?: Profile;
  images?: ItemImage[];
  secret_verification_details?: string | null;
  verification_question?: string | null;
  contact_email_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClaimEvidence {
  id: string;
  claim_id: string;
  evidence_type: EvidenceType;
  description: string;
  file_url?: string | null;
  storage_path?: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  status: ClaimStatus;
  verification_answer: string;
  claim_statement: string;
  decision_reason?: string | null;
  reviewer_id?: string | null;
  decided_at?: string | null;
  created_at: string;
  updated_at: string;
  item?: Item;
  claimant?: Profile;
  reviewer?: Profile;
  evidence?: ClaimEvidence[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor?: Profile;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}

export interface MatchScoreBreakdown {
  typeMatch: boolean;
  categoryScore: number;      // e.g. 0 to 35
  textSimilarityScore: number; // e.g. 0 to 30
  dateProximityScore: number;  // e.g. 0 to 20
  locationScore: number;       // e.g. 0 to 15
  totalScore: number;          // 0 to 100
  explanation: string[];
}

export interface MatchCandidate {
  item: Item;
  score: number;
  breakdown: MatchScoreBreakdown;
}

export const ITEM_CATEGORIES = [
  'Electronics',
  'ID & Cards',
  'Bags & Luggage',
  'Keys',
  'Documents & Books',
  'Clothing & Accessories',
  'Jewelry & Watches',
  'Other'
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
