-- ============================================================
-- LOST AND FOUND SYSTEM WITH CLAIM VERIFICATION
-- Migration: 00001_initial_schema.sql
-- ============================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text not null,
  email text not null,
  avatar_url text,
  phone text,
  student_staff_id text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 2. ITEMS TABLE
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  category text not null,
  description text not null,
  incident_date date not null,
  location text not null,
  status text not null default 'open' check (status in ('open', 'matched', 'claimed', 'returned', 'archived')),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  secret_verification_details text, -- Confidential ownership clues (only reporter & admin)
  verification_question text,        -- Public or semi-private question for potential claimants
  contact_email_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_items_type on public.items(type);
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_reporter_id on public.items(reporter_id);
create index if not exists idx_items_incident_date on public.items(incident_date desc);

-- 3. ITEM IMAGES TABLE
create table if not exists public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_item_images_item_id on public.item_images(item_id);

-- 4. CLAIMS TABLE
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
  verification_answer text not null,
  claim_statement text not null,
  decision_reason text,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_claims_item_id on public.claims(item_id);
create index if not exists idx_claims_claimant_id on public.claims(claimant_id);
create index if not exists idx_claims_status on public.claims(status);

create unique index if not exists idx_unique_active_claim_per_user 
  on public.claims(item_id, claimant_id) 
  where status in ('pending', 'under_review');

-- 5. CLAIM EVIDENCE TABLE
create table if not exists public.claim_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('purchase_receipt', 'photo', 'serial_number', 'identification', 'other')),
  description text not null,
  file_url text,
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_claim_evidence_claim_id on public.claim_evidence(claim_id);

-- 6. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  type text not null default 'claim_update' check (type in ('claim_update', 'match_found', 'item_update', 'system')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read);

-- 7. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- ============================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger tr_items_updated_at
  before update on public.items
  for each row execute function public.handle_updated_at();

create trigger tr_claims_updated_at
  before update on public.claims
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- PROFILES POLICIES
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins have full access to profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin());

-- ITEMS POLICIES
create policy "Items are viewable by anyone"
  on public.items for select
  using (status <> 'archived' or reporter_id = auth.uid() or public.is_admin());

create policy "Authenticated users can create items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Reporters can update their own open items"
  on public.items for update
  to authenticated
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Reporters or Admins can delete items"
  on public.items for delete
  to authenticated
  using (auth.uid() = reporter_id or public.is_admin());

-- ITEM IMAGES POLICIES
create policy "Item images are viewable by everyone"
  on public.item_images for select
  using (true);

create policy "Reporters or Admins can insert images"
  on public.item_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.items
      where items.id = item_images.item_id
      and (items.reporter_id = auth.uid() or public.is_admin())
    )
  );

create policy "Reporters or Admins can delete images"
  on public.item_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.items
      where items.id = item_images.item_id
      and (items.reporter_id = auth.uid() or public.is_admin())
    )
  );

-- CLAIMS POLICIES
create policy "Claimants and admins can view claims"
  on public.claims for select
  to authenticated
  using (
    claimant_id = auth.uid() 
    or public.is_admin()
    or exists (
      select 1 from public.items
      where items.id = claims.item_id and items.reporter_id = auth.uid()
    )
  );

create policy "Authenticated users can submit claims"
  on public.claims for insert
  to authenticated
  with check (
    auth.uid() = claimant_id
    and not exists (
      select 1 from public.items
      where items.id = claims.item_id and items.reporter_id = auth.uid()
    )
  );

create policy "Claimants can withdraw pending claims"
  on public.claims for update
  to authenticated
  using (
    (claimant_id = auth.uid() and status = 'pending')
    or public.is_admin()
  )
  with check (
    (claimant_id = auth.uid() and status = 'withdrawn')
    or public.is_admin()
  );

-- CLAIM EVIDENCE POLICIES
create policy "Claimant and admins can view evidence"
  on public.claim_evidence for select
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.claims
      where claims.id = claim_evidence.claim_id
      and claims.claimant_id = auth.uid()
    )
  );

create policy "Claimants can insert evidence"
  on public.claim_evidence for insert
  to authenticated
  with check (
    exists (
      select 1 from public.claims
      where claims.id = claim_evidence.claim_id
      and claims.claimant_id = auth.uid()
    )
  );

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- AUDIT LOGS POLICIES
create policy "Admins can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

create policy "System can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (true);
