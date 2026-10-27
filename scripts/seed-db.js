const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijqmyickypmflytcxloq.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcW15aWNreXBtZmx5dGN4bG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzEzNDI0NCwiZXhwIjoyMTA4NzEwMjQ0fQ.MOl5H-B2tAg3ZudZVN7EBzR-5smJqXgpVFMEMKFByuc';

const supabase = createClient(url, key);

async function main() {
  console.log('Connecting to Supabase at:', url);

  // Check profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, email, full_name, role');
  if (pErr) {
    console.error('Error fetching profiles:', pErr);
    return;
  }
  console.log('Found profiles:', profiles);

  const admin = profiles.find((p) => p.role === 'admin') || profiles[0];
  const user = profiles.find((p) => p.role === 'user') || profiles[0];
  const secondUser = profiles.filter((p) => p.role === 'user')[1] || user;

  // Clear existing items to avoid duplicates if re-running
  const { data: existingItems } = await supabase.from('items').select('id');
  if (existingItems && existingItems.length > 0) {
    console.log(`Deleting ${existingItems.length} old items...`);
    await supabase.from('items').delete().in('id', existingItems.map(i => i.id));
  }

  const itemsToInsert = [
    {
      type: 'lost',
      title: 'MacBook Pro 14" Space Gray',
      category: 'Electronics',
      description: 'Left on the second floor study cubicles near the window. Has several programming stickers on top lid.',
      incident_date: '2026-10-25',
      location: 'Science Library, 2nd Floor Cubicle 14',
      status: 'matched',
      reporter_id: user.id,
      secret_verification_details: 'Serial number C02G41ABMD6M, stickers include GitHub Octocat, React logo, and Rust crab; login username is alexr.',
      verification_question: 'What stickers are on the top lid or what is the serial prefix?',
      contact_email_public: false
    },
    {
      type: 'found',
      title: 'Apple Laptop (Space Gray) in Sleeve',
      category: 'Electronics',
      description: 'Found unattended on study desk after library closing. Turned over to security front desk.',
      incident_date: '2026-10-25',
      location: 'Science Library, 2nd Floor Study Area',
      status: 'open',
      reporter_id: admin.id,
      secret_verification_details: 'Contains dark green Incase sleeve, stickers on laptop include GitHub, React, Rust. Lockscreen shows initials AR.',
      verification_question: 'Describe the laptop sleeve color or any specific stickers on the casing.',
      contact_email_public: false
    },
    {
      type: 'lost',
      title: 'Navy Blue Osprey Backpack',
      category: 'Bags & Luggage',
      description: 'Lost after lecture. Contains textbooks, spiral notebooks, and a stainless steel water bottle.',
      incident_date: '2026-10-26',
      location: 'Engineering Hall, Lecture Hall B',
      status: 'open',
      reporter_id: secondUser.id,
      secret_verification_details: 'Hydro Flask inside with dent on bottom rim; engineering course notebook with student ID UG-2024-1188 on page 1.',
      verification_question: 'What unique item or identifier is inside the front compartment?',
      contact_email_public: false
    },
    {
      type: 'found',
      title: 'Dark Blue Campus Backpack',
      category: 'Bags & Luggage',
      description: 'Found on row 4 seat. Submitted to departmental security office.',
      incident_date: '2026-10-26',
      location: 'Engineering Complex, Lecture Hall B',
      status: 'open',
      reporter_id: admin.id,
      secret_verification_details: 'Contains calculus and thermodynamics spiral notebooks; gray insulated flask with sticker.',
      verification_question: 'Specify any course names or textbooks in the main pocket.',
      contact_email_public: false
    },
    {
      type: 'found',
      title: 'Leather Keyring with 4 Keys & NSUK Tag',
      category: 'Keys',
      description: 'Found on walkway leading toward Student Union Building. Handed over to Campus Security.',
      incident_date: '2026-10-27',
      location: 'Student Union Walkway',
      status: 'open',
      reporter_id: admin.id,
      secret_verification_details: 'Bronze master lock key, red bottle opener mini tool, NSUK brass emblem keychain.',
      verification_question: 'How many keys and what decorative ornament is attached?',
      contact_email_public: false
    }
  ];

  const { data: inserted, error: insertErr } = await supabase.from('items').insert(itemsToInsert).select();
  if (insertErr) {
    console.error('Error inserting items:', insertErr);
    return;
  }
  console.log(`Successfully inserted ${inserted.length} real items into Supabase database.`);

  const images = [
    {
      item_id: inserted[0].id,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      storage_path: 'items/macbook-1.jpg',
      is_primary: true
    },
    {
      item_id: inserted[1].id,
      image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      storage_path: 'items/macbook-found.jpg',
      is_primary: true
    },
    {
      item_id: inserted[2].id,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      storage_path: 'items/backpack-1.jpg',
      is_primary: true
    },
    {
      item_id: inserted[4].id,
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
      storage_path: 'items/keys.jpg',
      is_primary: true
    }
  ];

  const { data: insertedImgs, error: imgErr } = await supabase.from('item_images').insert(images).select();
  if (imgErr) {
    console.error('Error inserting images:', imgErr);
  } else {
    console.log(`Inserted ${insertedImgs.length} images into Supabase database.`);
  }

  // Create a pending claim on the MacBook
  const foundMacBook = inserted[1];
  const { data: claimData, error: claimErr } = await supabase.from('claims').insert({
    item_id: foundMacBook.id,
    claimant_id: user.id,
    status: 'pending',
    verification_answer: 'The sleeve is dark olive green. The laptop has GitHub and Rust stickers.',
    claim_statement: 'I left my laptop at cubicle 14 when running to catch the campus shuttle around 9:30 PM.'
  }).select();

  if (claimErr) {
    console.error('Error inserting claim:', claimErr);
  } else {
    console.log('Inserted pending claim into Supabase database:', claimData[0]?.id);
    if (claimData[0]?.id) {
      await supabase.from('claim_evidence').insert({
        claim_id: claimData[0].id,
        evidence_type: 'purchase_receipt',
        description: 'Original Apple Store purchase receipt invoice #INV-9921',
        file_url: 'https://images.unsplash.com/photo-1554415707-9e49019eeb61?w=800&auto=format&fit=crop&q=80'
      });
    }
  }

  // Create initial notifications in DB
  await supabase.from('notifications').insert([
    {
      user_id: user.id,
      title: 'Potential Correlated Match Found',
      message: 'A found Apple Laptop reported at Science Library has a 91% match with your lost report.',
      link_url: '/matches',
      is_read: false
    },
    {
      user_id: admin.id,
      title: 'New Ownership Claim Submitted',
      message: 'Claimant Alex Rivera filed a verification claim for Apple Laptop in Sleeve.',
      link_url: '/admin/claims',
      is_read: false
    }
  ]);

  // Create audit log
  await supabase.from('audit_logs').insert([
    {
      actor_id: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      entity_type: 'system',
      entity_id: admin.id,
      details: { message: 'Database initialized with official NSUK campus asset recovery records' }
    }
  ]);

  console.log('Database initialization complete!');
}

main().catch(console.error);
