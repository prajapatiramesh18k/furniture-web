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
  const { default: SiteVisit } = await import('@/lib/models/SiteVisit');

  const tenant = await Tenant.findOne({ name: 'Pritesh interior Solution' }).lean();
  if (!tenant) {
    console.error('Tenant "Pritesh interior Solution" not found.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const tenantId = String(tenant._id);
  console.log(`Using tenant: ${tenant.name} (${tenantId})`);

  // Find the lead with site_visit status
  const lead = await Contact.findOne({ tenantId, status: 'site_visit' }).lean();
  if (!lead) {
    console.error('No lead with site_visit status found.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found lead: ${lead.name} (${lead.projectType})`);

  // Check if visit already exists
  const existing = await SiteVisit.findOne({ tenantId, leadId: lead._id });
  if (existing) {
    console.log('Site visit already exists for this lead:', existing._id);
    await mongoose.disconnect();
    return;
  }

  // Schedule visit for tomorrow at 11 AM
  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() + 1);
  visitDate.setHours(11, 0, 0, 0);

  const visit = await SiteVisit.create({
    tenantId,
    leadId: lead._id,
    customerName: lead.name,
    phone: lead.phone,
    address: lead.address || '',
    visitDate,
    requirements: lead.projectType || '',
    notes: lead.message || '',
    status: 'scheduled',
    createdBy: null,
  });

  console.log(`\nSite visit scheduled!`);
  console.log(`  Customer: ${visit.customerName}`);
  console.log(`  Phone: ${visit.phone}`);
  console.log(`  Address: ${visit.address}`);
  console.log(`  Date: ${visit.visitDate.toLocaleString('en-IN')}`);
  console.log(`  Requirements: ${visit.requirements}`);
  console.log(`  ID: ${visit._id}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});