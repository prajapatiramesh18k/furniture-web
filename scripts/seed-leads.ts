/**
 * Seed dummy leads for testing.
 * Usage: npx tsx scripts/seed-leads.ts
 * Requires: MONGODB_URI in env / .env.local
 */
import mongoose from 'mongoose';
import fs from 'node:fs';

for (const f of ['.env.local', '.env']) {
  try {
    const raw = fs.readFileSync(f, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {}
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const { default: Tenant } = await import('@/lib/models/Tenant');
  const { default: Contact } = await import('@/models/Contact');

  const tenant = await Tenant.findOne({ name: 'Pritesh interior Solution' }).lean();
  if (!tenant) {
    console.error('No active tenant found.');
    const all = await Tenant.find({}).select('name status').lean();
    for (const t of all) console.log('  -', t.name, `(${t.status})`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const tenantId = String(tenant._id);
  console.log(`Using tenant: ${tenant.name} (${tenantId})`);

  const existing = await Contact.countDocuments({ tenantId });
  if (existing > 0) {
    console.log(`Found ${existing} existing leads. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const leads = [
    {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh.kumar@example.com',
      address: 'A-101, Green Park Society, Andheri West',
      projectType: 'Modular Kitchen',
      message: 'Need modular kitchen for 2BHK flat. Budget around 3-4 lakhs. Prefer modern design with soft-close drawers.',
      status: 'new',
      source: 'Website',
      budget: '3-4 L',
      followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: '',
    },
    {
      name: 'Priya Sharma',
      phone: '9876543211',
      email: 'priya.sharma@example.com',
      address: 'B-205, Sunrise Apartments, Bandra East',
      projectType: 'Wardrobe Design',
      message: 'Looking for walk-in wardrobe design for master bedroom. 10x8 ft space. Need sliding doors with mirror finish.',
      status: 'contacted',
      source: 'WhatsApp',
      budget: '1.5-2 L',
      followUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Called on 15th - client busy, asked to call back next week. Prefers afternoon calls.',
    },
    {
      name: 'Amit Patel',
      phone: '9876543212',
      email: 'amit.patel@example.com',
      address: 'C-303, Royal Heights, Powai',
      projectType: 'Full Home Interior',
      message: 'Complete 3BHK interior design including modular kitchen, wardrobes, TV unit, and false ceiling. Ready to start in 2 months.',
      status: 'site_visit',
      source: 'Referral',
      budget: '15-20 L',
      followUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Site visit scheduled for 20th at 11 AM. Client wants to see material samples.',
    },
    {
      name: 'Neha Gupta',
      phone: '9876543213',
      email: 'neha.gupta@example.com',
      address: 'D-404, Lake View Residency, Thane West',
      projectType: 'TV Unit & Wall Panel',
      message: 'Custom TV unit with wall paneling for living room. Wall size 12x10 ft. Include storage and display shelves.',
      status: 'proposal',
      source: 'Website',
      budget: '80K-1.2 L',
      followUpAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Proposal sent on 10th. Follow up after 5 days. Client liked the 3D render.',
    },
    {
      name: 'Vikram Singh',
      phone: '9876543214',
      email: 'vikram.singh@example.com',
      address: 'E-505, Hill View Towers, Goregaon East',
      projectType: 'Office Interior',
      message: 'Office space 1500 sq ft. Need workstations, cabin, meeting room, pantry, and reception design. Timeline 45 days.',
      status: 'quotation',
      source: 'Website',
      budget: '25-30 L',
      followUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Quotation sent. Client comparing with 2 other vendors. Decision by month end.',
    },
    {
      name: 'Sneha Reddy',
      phone: '9876543215',
      email: 'sneha.reddy@example.com',
      address: 'F-606, Palm Grove, Malad West',
      projectType: 'Modular Kitchen',
      message: 'L-shaped modular kitchen for 2BHK. Need quartz countertop, chimney, hob, and tall unit. Budget 2.5L max.',
      status: 'won',
      source: 'Referral',
      budget: '2.5 L',
      followUpAt: null,
      notes: 'Project completed and handed over on 5th. Client very happy. Referral potential.',
    },
    {
      name: 'Rohan Desai',
      phone: '9876543216',
      email: 'rohan.desai@example.com',
      address: 'G-707, Sky Heights, Vile Parle West',
      projectType: 'Kids Bedroom',
      message: 'Bunk bed with study table and wardrobe for kids room. Room size 10x10 ft. Theme: space/astronaut.',
      status: 'lost',
      source: 'WhatsApp',
      budget: '1.5 L',
      followUpAt: null,
      notes: 'Client went with competitor due to lower price. Kept in touch for future.',
    },
    {
      name: 'Kavya Iyer',
      phone: '9876543217',
      email: 'kavya.iyer@example.com',
      address: 'H-808, Ocean View, Worli',
      projectType: 'Pooja Room Design',
      message: 'Custom pooja room with backlit marble, storage for idols, and traditional carving. Space 6x6 ft.',
      status: 'new',
      source: 'Website',
      budget: '2-3 L',
      followUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: '',
    },
    {
      name: 'Arjun Mehta',
      phone: '9876543218',
      email: 'arjun.mehta@example.com',
      address: 'I-909, Garden City, Borivali East',
      projectType: 'Balcony Enclosure',
      message: 'Glass enclosure for balcony 8x4 ft. Sliding aluminum frames with toughened glass. Waterproofing needed.',
      status: 'contacted',
      source: 'Website',
      budget: '80K-1 L',
      followUpAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Discussed options. Client needs to check society approval first.',
    },
    {
      name: 'Meera Joshi',
      phone: '9876543219',
      email: 'meera.joshi@example.com',
      address: 'J-1010, Heritage Homes, Dadar West',
      projectType: 'False Ceiling & Lighting',
      message: 'Designer false ceiling with cove lighting for living and dining area. Total 500 sq ft. Modern minimal design.',
      status: 'proposal',
      source: 'Referral',
      budget: '2-2.5 L',
      followUpAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      notes: 'Proposal ready. Waiting for client confirmation on lighting fixtures.',
    },
  ];

  let created = 0;
  for (const lead of leads) {
    try {
      await Contact.create({
        tenantId,
        ...lead,
        phone: lead.phone.replace(/\D/g, ''),
      });
      created++;
      console.log(`Created: ${lead.name} (${lead.projectType}) - ${lead.status}`);
    } catch (e) {
      console.warn(`Skipped ${lead.name}: ${e instanceof Error ? e.message : e}`);
    }
  }

  const total = await Contact.countDocuments({ tenantId });
  console.log(`\nDone! ${created} leads created. Total leads: ${total}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});