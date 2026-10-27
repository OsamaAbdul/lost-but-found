-- ============================================================
-- SEED DATA FOR UNIVERSITY LOST AND FOUND SYSTEM
-- supabase/seed.sql
-- ============================================================

-- Note: In production Supabase, users are created in auth.users first.
-- For local/direct testing or seeding profiles directly:

-- Insert sample profiles
insert into public.profiles (id, role, full_name, email, phone, student_staff_id, department)
values 
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Campus Security Admin', 'admin@university.edu', '+1-555-0100', 'STAFF-9021', 'Campus Safety & Security'),
  ('22222222-2222-2222-2222-222222222222', 'user', 'Alex Rivera', 'alex.rivera@student.university.edu', '+1-555-0144', 'STU-2024-8831', 'Computer Science'),
  ('33333333-3333-3333-3333-333333333333', 'user', 'Brenda Vance', 'b.vance@student.university.edu', '+1-555-0182', 'STU-2023-4112', 'Mechanical Engineering'),
  ('44444444-4444-4444-4444-444444444444', 'user', 'Devon Chen', 'devon.chen@student.university.edu', '+1-555-0199', 'STU-2025-1029', 'Business Administration')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  email = excluded.email;

-- Insert Items
insert into public.items (
  id, type, title, category, description, incident_date, location, status, reporter_id, secret_verification_details, verification_question, contact_email_public
)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'lost',
    'MacBook Pro 14" Space Gray',
    'Electronics',
    'Left on the second floor study cubicles near the window. Has several programming stickers on top lid.',
    '2026-10-25',
    'Science Library, 2nd Floor Cubicle 14',
    'matched',
    '22222222-2222-2222-2222-222222222222',
    'Serial number C02G41ABMD6M, stickers include GitHub Octocat, React logo, and Rust crab; login username is alexr.',
    'What stickers are on the top lid or what is the serial prefix?',
    false
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'found',
    'Apple Laptop (Space Gray) in Sleeve',
    'Electronics',
    'Found unattended on study desk after library closing. Turned over to security front desk.',
    '2026-10-25',
    'Science Library, 2nd Floor Study Area',
    'open',
    '11111111-1111-1111-1111-111111111111',
    'Contains dark green Incase sleeve, stickers on laptop include GitHub, React, Rust. Lockscreen shows initials AR.',
    'Describe the laptop sleeve color or any specific stickers on the casing.',
    false
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'lost',
    'Navy Blue Osprey Daylite Backpack',
    'Bags & Luggage',
    'Lost after lecture. Contains textbooks, spiral notebooks, and a stainless steel water bottle.',
    '2026-10-26',
    'Engineering Building Hallway 300',
    'open',
    '33333333-3333-3333-3333-333333333333',
    'Front zip pocket has TI-84 Plus CE calculator with name Brenda etched on rear battery cover.',
    'What specific electronic device or accessory is inside the front pouch?',
    false
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'found',
    'Student Campus Card & Dorm Key',
    'ID & Cards',
    'Found on the floor next to vending machines near the cafeteria.',
    '2026-10-26',
    'Student Union Ground Level',
    'open',
    '44444444-4444-4444-4444-444444444444',
    'Key has red rubber cover stamped 402B. Card belongs to Department of Economics.',
    'What color is the key cover and what room number or building initials are marked on it?',
    false
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'found',
    'AirPods Pro (2nd Gen) in Black Case',
    'Electronics',
    'Found on bench outside the campus athletic center.',
    '2026-10-24',
    'Campus Recreation Center, Bench B',
    'claimed',
    '11111111-1111-1111-1111-111111111111',
    'Custom engraving on charging case reads "D. CHEN 2024". Serial ends in 88L9.',
    'Is there any custom engraving or text on the charging case?',
    false
  )
on conflict (id) do nothing;

-- Insert Item Images
insert into public.item_images (id, item_id, image_url, storage_path, is_primary)
values
  ('b1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 'item-photos/laptop.jpg', true),
  ('b2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 'item-photos/backpack.jpg', true),
  ('b3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80', 'item-photos/airpods.jpg', true)
on conflict (id) do nothing;

-- Insert Claims
insert into public.claims (
  id, item_id, claimant_id, status, verification_answer, claim_statement, decision_reason, reviewer_id, decided_at
)
values
  (
    'c1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'pending',
    'Dark green Incase zippered sleeve. Stickers are GitHub Octocat, React blue atom, and Rust crab. Serial number C02G41ABMD6M.',
    'I was studying for the operating systems exam on Sunday night in cubicle 14, left in a hurry before closing and realized my laptop was missing the following morning.',
    null,
    null,
    null
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'a5555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'approved',
    'Engraved with "D. CHEN 2024" on the front of the case. Paired to Devon Chen iPhone via Find My.',
    'These are my AirPods Pro 2 that slipped out of my gym shorts pocket while tying my shoe on Bench B.',
    'Verified engraved student name against student card record and confirmed serial number match on Apple invoice.',
    '11111111-1111-1111-1111-111111111111',
    '2026-10-25 14:30:00+00'
  )
on conflict (id) do nothing;

-- Insert Claim Evidence
insert into public.claim_evidence (id, claim_id, evidence_type, description, file_url)
values
  (
    'd1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'purchase_receipt',
    'Apple Store receipt matching Serial Number C02G41ABMD6M',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'identification',
    'Student ID Card Devon Chen STU-2025-1029',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'
  )
on conflict (id) do nothing;

-- Insert Notifications
insert into public.notifications (id, user_id, title, message, link, type, is_read)
values
  (
    'e1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Potential Match Found',
    'A found item matching your "MacBook Pro 14" Space Gray" report was logged at Science Library.',
    '/matches',
    'match_found',
    false
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'Claim Approved',
    'Your claim for AirPods Pro (2nd Gen) has been approved by Campus Security. You can pick it up at Security HQ.',
    '/claims/c2222222-2222-2222-2222-222222222222',
    'claim_update',
    true
  )
on conflict (id) do nothing;

-- Insert Audit Logs
insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, details)
values
  (
    'f1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'claim.approve',
    'claim',
    'c2222222-2222-2222-2222-222222222222',
    '{"item_id": "a5555555-5555-5555-5555-555555555555", "claimant": "Devon Chen", "notes": "Engraving and receipt validated"}'::jsonb
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'item.create',
    'item',
    'a2222222-2222-2222-2222-222222222222',
    '{"title": "Apple Laptop (Space Gray) in Sleeve", "type": "found", "location": "Science Library"}'::jsonb
  )
on conflict (id) do nothing;
