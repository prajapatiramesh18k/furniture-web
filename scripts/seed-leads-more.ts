/**
 * Add 5 more dummy leads for "Pritesh interior Solution" tenant.
 * Usage: npx tsx scripts/seed-leads-more.ts
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
    console.error('Tenant "Pritesh interior Solution" not found.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const tenantId = String(tenant._id);
  console.log(`Using tenant: ${tenant.name} (${tenantId})`);

  const leads = [
    {
      name: 'Nikhil Verma',
      phone: '9876543220',
      email: 'nikhil.verma@example.com',
      address: 'K-111, Shanti Nagar, Mira Road East',
      projectType: 'Modular Kitchen',
      message: 'Straight-line modular kitchen for 1BHK rental flat. Budget under 1.5L. Need quick installation within 3 weeks.',
      status: 'new',
      source: 'Website',
      budget: '1-1.5 L',
      followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: '',
    },
    {
      name: 'Pooja Nair',
      phone: '9876543221',
      email: 'pooja.nair@example.com',
      address: 'L-222, Cozy Homes, Andheri East',
      projectType: 'Wardrobe Design',
      message: 'Two sliding wardrobes for kids and guest bedroom. Laminate finish, budget 90K total.',
      status: 'contacted',
      source: 'Website',
      budget: '80K-1 L',
      followUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Shared catalogue on WhatsApp. Client shortlisting designs.',
    },
    {
      name: 'Suresh Pillai',
      phone: '9876543222',
      email: 'suresh.pillai@example.com',
      address: 'M-333, Green Acres, Vasai West',
      projectType: 'Full Home Interior',
      message: '2BHK full interior — kitchen, 2 wardrobes, TV unit, painting and lighting. Possession next month.',
      status: 'site_visit',
      source: 'Referral',
      budget: '8-10 L',
      followUpAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Referred by Amit Patel. Site visit to be scheduled after possession.',
    },
    {
      name: 'Divya Menon',
      phone: '9876543223',
      email: 'divya.menon@example.com',
      address: 'N-444, Sea Breeze, Bandra West',
      projectType: 'TV Unit & Wall Panel',
      message: 'Premium TV wall with louvers and backlit panels for living room. Wall 14x11 ft.',
      status: 'proposal',
      source: 'WhatsApp',
      budget: '1.5-2 L',
      followUpAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Client wants veneer finish. Proposal under preparation.',
    },
    {
      name: 'Kiran Shah',
      phone: '9876543224',
      email: 'kiran.shah@example.com',
      address: 'P-555, Silver Park, Kandivali West',
      projectType: 'Office Interior',
      message: 'Small office 600 sq ft — 8 workstations, 1 cabin, pantry and storage. Need modular furniture only.',
      status: 'quotation',
      source: 'Referral',
      budget: '6-8 L',
      followUpAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      notes: 'Quotation requested. Measurements shared by client on email.',
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
