import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Item,
  Profile,
  Claim,
  Notification,
  AuditLog,
  UserRole,
  MatchCandidate,
} from '@/types';
import { findMatchesForItem } from '../matching/algorithm';
import { SubmitClaimInput, AdminDecisionInput, ReportItemInput, SearchFilterInput } from '../validation/schemas';

// Real Supabase PostgreSQL client connecting directly to database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijqmyickypmflytcxloq.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcW15aWNreXBtZmx5dGN4bG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzEzNDI0NCwiZXhwIjoyMTA4NzEwMjQ0fQ.MOl5H-B2tAg3ZudZVN7EBzR-5smJqXgpVFMEMKFByuc';

export const db: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface ItemListResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const repository = {
  // ===================== PROFILES =====================
  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('Error fetching profile by id:', error);
      return null;
    }
    return data;
  },

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await db.from('profiles').select('*').eq('email', email).maybeSingle();
    if (error) {
      console.error('Error fetching profile by email:', error);
      return null;
    }
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await db.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
    return data || [];
  },

  async updateProfile(
    id: string,
    data: { full_name?: string; phone?: string | null; student_staff_id?: string | null; department?: string | null }
  ): Promise<Profile | null> {
    const { data: updated, error } = await db
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    return updated;
  },

  // ===================== ITEMS =====================
  async getItems(filters: Partial<SearchFilterInput> = {}): Promise<ItemListResponse> {
    let query = db
      .from('items')
      .select('*, images:item_images(*), reporter:profiles(*)', { count: 'exact' });

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      query = query.ilike('category', filters.category);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    } else {
      query = query.neq('status', 'archived');
    }

    // Filter by location
    if (filters.location && filters.location.trim()) {
      query = query.ilike('location', `%${filters.location.trim()}%`);
    }

    // Filter by text search query
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim();
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
    }

    // Date range
    if (filters.date_from) {
      query = query.gte('incident_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('incident_date', filters.date_to);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('Error querying items from Supabase:', error);
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Mask confidential verification details in public listings
    const sanitizedItems: Item[] = (data || []).map((raw: any) => {
      const reporter = raw.reporter;
      return {
        ...raw,
        secret_verification_details: null,
        reporter: reporter
          ? {
              ...reporter,
              email: raw.contact_email_public ? reporter.email : '[Protected for Privacy]',
              phone: raw.contact_email_public ? reporter.phone : null,
            }
          : undefined,
      };
    });

    return {
      items: sanitizedItems,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getItemById(
    id: string,
    currentUserId?: string | null,
    currentUserRole?: UserRole | null
  ): Promise<Item | null> {
    const { data: item, error } = await db
      .from('items')
      .select('*, images:item_images(*), reporter:profiles(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !item) {
      if (error) console.error('Error fetching item by id:', error);
      return null;
    }

    const isReporter = currentUserId === item.reporter_id;
    const isAdmin = currentUserRole === 'admin';
    const canSeeSecrets = isReporter || isAdmin;
    const reporter = item.reporter;

    return {
      ...item,
      secret_verification_details: canSeeSecrets ? item.secret_verification_details : null,
      reporter: reporter
        ? {
            ...reporter,
            email: canSeeSecrets || item.contact_email_public ? reporter.email : '[Protected for Privacy]',
            phone: canSeeSecrets || item.contact_email_public ? reporter.phone : null,
          }
        : undefined,
    };
  },

  async createItem(
    input: Omit<ReportItemInput, 'image_urls'> & { image_urls?: string[] },
    reporterId: string
  ): Promise<Item> {
    const { data: newItem, error } = await db
      .from('items')
      .insert({
        type: input.type,
        title: input.title,
        category: input.category,
        description: input.description,
        incident_date: input.incident_date,
        location: input.location,
        status: 'open',
        reporter_id: reporterId,
        secret_verification_details: input.secret_verification_details || null,
        verification_question: input.verification_question || null,
        contact_email_public: input.contact_email_public || false,
      })
      .select('*, reporter:profiles(*)')
      .single();

    if (error || !newItem) {
      console.error('Error inserting item into database:', error);
      throw new Error(`Failed to create item in database: ${error?.message}`);
    }

    // Insert images if provided
    let insertedImages: any[] = [];
    if (input.image_urls && input.image_urls.length > 0) {
      const imagesPayload = input.image_urls.map((url, idx) => ({
        item_id: newItem.id,
        image_url: url,
        storage_path: `items/${newItem.id}-${idx}.jpg`,
        is_primary: idx === 0,
      }));

      const { data: imgData } = await db.from('item_images').insert(imagesPayload).select();
      insertedImages = imgData || [];
    }

    // Record audit log in database
    await this.createAuditLog({
      actor_id: reporterId,
      action: 'item.create',
      entity_type: 'item',
      entity_id: newItem.id,
      details: { title: newItem.title, type: newItem.type, category: newItem.category },
    });

    return {
      ...newItem,
      images: insertedImages,
    };
  },

  async updateItem(
    id: string,
    updates: Partial<Item>,
    userId: string,
    userRole: UserRole
  ): Promise<Item | null> {
    const existing = await this.getItemById(id, userId, userRole);
    if (!existing) return null;

    if (existing.reporter_id !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to modify this item.');
    }

    const { data: updated, error } = await db
      .from('items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, images:item_images(*), reporter:profiles(*)')
      .single();

    if (error) {
      console.error('Error updating item in database:', error);
      throw new Error('Database update failed');
    }

    await this.createAuditLog({
      actor_id: userId,
      action: 'item.update',
      entity_type: 'item',
      entity_id: id,
      details: { updates },
    });

    return updated;
  },

  async deleteItem(id: string, userId: string, userRole: UserRole): Promise<boolean> {
    const existing = await this.getItemById(id, userId, userRole);
    if (!existing) return false;

    if (existing.reporter_id !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to delete this item.');
    }

    const { error } = await db.from('items').delete().eq('id', id);
    if (error) {
      console.error('Error deleting item from database:', error);
      return false;
    }

    await this.createAuditLog({
      actor_id: userId,
      action: 'item.delete',
      entity_type: 'item',
      entity_id: id,
      details: { title: existing.title },
    });

    return true;
  },

  async getItemsByReporter(reporterId: string): Promise<Item[]> {
    const { data, error } = await db
      .from('items')
      .select('*, images:item_images(*), reporter:profiles(*)')
      .eq('reporter_id', reporterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reporter items:', error);
      return [];
    }
    return data || [];
  },

  // ===================== MATCHING ALGORITHM =====================
  async getItemMatches(itemId: string): Promise<MatchCandidate[]> {
    const sourceItem = await this.getItemById(itemId);
    if (!sourceItem) return [];

    // Query candidates of opposite type from Supabase
    const candidateType = sourceItem.type === 'lost' ? 'found' : 'lost';
    const { data: candidates, error } = await db
      .from('items')
      .select('*, images:item_images(*), reporter:profiles(*)')
      .eq('type', candidateType)
      .neq('status', 'archived')
      .neq('status', 'returned')
      .order('created_at', { ascending: false });

    if (error || !candidates) {
      console.error('Error fetching match candidates:', error);
      return [];
    }

    return findMatchesForItem(sourceItem, candidates);
  },

  async getMatchesForItem(itemId: string): Promise<MatchCandidate[]> {
    return this.getItemMatches(itemId);
  },

  async getUserMatches(userId: string): Promise<{ userItem: Item; matches: MatchCandidate[] }[]> {
    const userItems = await this.getItemsByReporter(userId);
    const activeItems = userItems.filter((i) => i.status === 'open' || i.status === 'matched');

    const results = await Promise.all(
      activeItems.map(async (item) => {
        const matches = await this.getItemMatches(item.id);
        return {
          userItem: item,
          matches,
        };
      })
    );

    return results.filter((r) => r.matches.length > 0);
  },

  // ===================== CLAIMS =====================
  async submitClaim(input: SubmitClaimInput, claimantId: string): Promise<Claim> {
    const item = await this.getItemById(input.item_id);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.reporter_id === claimantId) {
      throw new Error('You cannot submit a claim on an item you reported.');
    }

    if (item.status === 'claimed' || item.status === 'returned' || item.status === 'archived') {
      throw new Error(`This item is currently ${item.status} and cannot be claimed.`);
    }

    // Check for duplicate active claim in database
    const { data: existingActive } = await db
      .from('claims')
      .select('id')
      .eq('item_id', input.item_id)
      .eq('claimant_id', claimantId)
      .in('status', ['pending', 'under_review']);

    if (existingActive && existingActive.length > 0) {
      throw new Error('You already have an active claim under review for this item.');
    }

    // Insert claim record
    const { data: newClaim, error: claimErr } = await db
      .from('claims')
      .insert({
        item_id: input.item_id,
        claimant_id: claimantId,
        status: 'pending',
        verification_answer: input.verification_answer,
        claim_statement: input.claim_statement,
      })
      .select()
      .single();

    if (claimErr || !newClaim) {
      console.error('Error inserting claim in database:', claimErr);
      throw new Error(`Failed to submit claim: ${claimErr?.message}`);
    }

    // Insert claim evidence if provided
    let insertedEvidence: any[] = [];
    if (input.evidence && input.evidence.length > 0) {
      const evidencePayload = input.evidence.map((ev) => ({
        claim_id: newClaim.id,
        evidence_type: ev.evidence_type,
        description: ev.description,
        file_url: ev.file_url || null,
      }));

      const { data: evData } = await db.from('claim_evidence').insert(evidencePayload).select();
      insertedEvidence = evData || [];
    }

    // Notify item reporter
    await this.createNotification({
      user_id: item.reporter_id,
      title: 'New Ownership Claim Submitted',
      message: `A new claim has been submitted for "${item.title}". Campus Security will review the verification details.`,
      link: `/claims/${newClaim.id}`,
      type: 'claim_update',
    });

    // Notify claimant confirmation
    await this.createNotification({
      user_id: claimantId,
      title: 'Claim Submitted Successfully',
      message: `Your claim for "${item.title}" is in pending queue for administrative verification.`,
      link: `/claims/${newClaim.id}`,
      type: 'claim_update',
    });

    // Record audit log
    await this.createAuditLog({
      actor_id: claimantId,
      action: 'claim.submit',
      entity_type: 'claim',
      entity_id: newClaim.id,
      details: { item_id: input.item_id },
    });

    return {
      ...newClaim,
      item,
      evidence: insertedEvidence,
    };
  },

  async getClaims(options: {
    status?: string;
    itemId?: string;
    claimantId?: string;
    reviewerId?: string;
    userId?: string;
    userRole?: UserRole;
  } = {}): Promise<Claim[]> {
    let query = db
      .from('claims')
      .select('*, item:items(*, images:item_images(*)), claimant:profiles!claims_claimant_id_fkey(*), reviewer:profiles!claims_reviewer_id_fkey(*), evidence:claim_evidence(*)');

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options.itemId) {
      query = query.eq('item_id', options.itemId);
    }
    if (options.claimantId) {
      query = query.eq('claimant_id', options.claimantId);
    }
    if (options.reviewerId) {
      query = query.eq('reviewer_id', options.reviewerId);
    }
    if (options.userId && options.userRole !== 'admin') {
      query = query.eq('claimant_id', options.userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching claims from database:', error);
      return [];
    }
    return data || [];
  },

  async getClaimById(id: string, userId?: string, userRole?: UserRole): Promise<Claim | null> {
    const { data, error } = await db
      .from('claims')
      .select('*, item:items(*, images:item_images(*)), claimant:profiles!claims_claimant_id_fkey(*), reviewer:profiles!claims_reviewer_id_fkey(*), evidence:claim_evidence(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching claim by id:', error);
      return null;
    }

    if (userId && userRole !== 'admin') {
      const isClaimant = data.claimant_id === userId;
      const isReporter = data.item?.reporter_id === userId;
      if (!isClaimant && !isReporter) {
        throw new Error('Access denied: You are not authorized to view this claim.');
      }
    }

    return data;
  },

  async withdrawClaim(claimId: string, claimantId: string): Promise<Claim> {
    const claim = await this.getClaimById(claimId);
    if (!claim) throw new Error('Claim not found.');
    if (claim.claimant_id !== claimantId) {
      throw new Error('Unauthorized to withdraw this claim.');
    }
    if (claim.status !== 'pending' && claim.status !== 'under_review') {
      throw new Error(`Cannot withdraw a claim with status ${claim.status}.`);
    }

    const { data: updated, error } = await db
      .from('claims')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select('*, item:items(*), claimant:profiles!claims_claimant_id_fkey(*)')
      .single();

    if (error) {
      console.error('Error withdrawing claim:', error);
      throw new Error('Failed to withdraw claim');
    }

    await this.createAuditLog({
      actor_id: claimantId,
      action: 'claim.withdraw',
      entity_type: 'claim',
      entity_id: claimId,
      details: { item_id: claim.item_id },
    });

    return updated;
  },

  async decideClaim(
    claimId: string,
    decision: AdminDecisionInput,
    reviewerId: string,
    adminRole: UserRole
  ): Promise<Claim> {
    if (adminRole !== 'admin') {
      throw new Error('Forbidden: Only authorized administrators can adjudicate ownership claims.');
    }

    const claim = await this.getClaimById(claimId);
    if (!claim) {
      throw new Error('Claim not found.');
    }

    if (claim.status === 'approved' || claim.status === 'rejected') {
      throw new Error(`Claim is already finalized as ${claim.status}.`);
    }

    const now = new Date().toISOString();

    const { data: decidedClaim, error } = await db
      .from('claims')
      .update({
        status: decision.status,
        decision_reason: decision.decision_reason,
        reviewer_id: reviewerId,
        decided_at: now,
        updated_at: now,
      })
      .eq('id', claimId)
      .select('*, item:items(*), claimant:profiles!claims_claimant_id_fkey(*)')
      .single();

    if (error || !decidedClaim) {
      console.error('Error updating claim decision in database:', error);
      throw new Error('Failed to update claim decision');
    }

    // If claim approved, lock the item and reject competing claims
    if (decision.status === 'approved') {
      await db
        .from('items')
        .update({ status: 'claimed', updated_at: now })
        .eq('id', claim.item_id);

      // Auto-reject competing active claims
      await db
        .from('claims')
        .update({
          status: 'rejected',
          decision_reason: 'Automated adjudication: competing claim verified and approved by Campus Security.',
          reviewer_id: reviewerId,
          decided_at: now,
          updated_at: now,
        })
        .eq('item_id', claim.item_id)
        .neq('id', claimId)
        .in('status', ['pending', 'under_review']);
    }

    // Notify claimant of the decision
    await this.createNotification({
      user_id: claim.claimant_id,
      title: `Ownership Claim ${decision.status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your claim for "${claim.item?.title}" was ${decision.status}. Rationale: ${decision.decision_reason}`,
      link: `/claims/${claimId}`,
      type: decision.status === 'approved' ? 'claim_update' : 'system_alert',
    });

    // Write audit log
    await this.createAuditLog({
      actor_id: reviewerId,
      action: `claim.${decision.status}`,
      entity_type: 'claim',
      entity_id: claimId,
      details: {
        decision: decision.status,
        reason: decision.decision_reason,
        item_id: claim.item_id,
      },
    });

    return decidedClaim;
  },

  // ===================== NOTIFICATIONS =====================
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notification read:', error);
      return false;
    }
    return true;
  },

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    return this.markNotificationRead(id, userId);
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking all notifications read:', error);
      return false;
    }
    return true;
  },

  async createNotification(data: {
    user_id: string;
    title: string;
    message: string;
    link?: string;
    type?: string;
  }): Promise<Notification | null> {
    const { data: created, error } = await db
      .from('notifications')
      .insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        link: data.link || null,
        type: data.type || 'claim_update',
        is_read: false,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    return created;
  },

  // ===================== AUDIT LOGS =====================
  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await db
      .from('audit_logs')
      .select('*, actor:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
    return data || [];
  },

  async createAuditLog(entry: {
    actor_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const { error } = await db.from('audit_logs').insert({
      actor_id: entry.actor_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details || {},
    });

    if (error) {
      console.error('Error creating audit log in database:', error);
    }
  },

  // ===================== METRICS =====================
  async getAdminMetrics() {
    const [
      { count: totalItems },
      { count: lostCount },
      { count: foundCount },
      { count: claimedCount },
      { count: totalClaims },
      { count: pendingClaims },
      { count: totalUsers },
      { count: totalAuditLogs },
    ] = await Promise.all([
      db.from('items').select('*', { count: 'exact', head: true }),
      db.from('items').select('*', { count: 'exact', head: true }).eq('type', 'lost'),
      db.from('items').select('*', { count: 'exact', head: true }).eq('type', 'found'),
      db.from('items').select('*', { count: 'exact', head: true }).eq('status', 'claimed'),
      db.from('claims').select('*', { count: 'exact', head: true }),
      db.from('claims').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db.from('audit_logs').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalItems: totalItems || 0,
      lostCount: lostCount || 0,
      foundCount: foundCount || 0,
      claimedCount: claimedCount || 0,
      totalClaims: totalClaims || 0,
      pendingClaims: pendingClaims || 0,
      totalUsers: totalUsers || 0,
      totalAuditLogs: totalAuditLogs || 0,
    };
  },
};
