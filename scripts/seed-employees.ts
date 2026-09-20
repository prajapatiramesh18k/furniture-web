/**
 * Seed 10 dummy employees for "Pritesh Interior Solution" tenant.
 * Usage: npx tsx scripts/seed-employees.ts
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
  const { default: Employee } = await import('@/lib/models/Employee');

  const tenant = await Tenant.findOne({ name: 'Pritesh interior Solution' }).lean();
  if (!tenant) {
    console.error('Tenant "Pritesh interior Solution" not found. Available tenants:');
    const all = await Tenant.find({}).select('name').lean();
    for (const t of all) console.log('  -', t.name);
    await mongoose.disconnect();
    process.exit(1);
  }

  const tenantId = String(tenant._id);
  const existing = await Employee.countDocuments({ tenantId });
  if (existing > 0) {
    console.log(`Found ${existing} existing employees. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }
  console.log(`No existing employees for "${tenant.name}". Seeding...`);

  const indianNames = [
    { name: 'Rahul Sharma', phone: '9876543210', department: 'Carpentry', role: 'Worker', dailyRate: 800 },
    { name: 'Amit Patel', phone: '9876543211', department: 'Painting', role: 'Painter', dailyRate: 900 },
    { name: 'Vikram Singh', phone: '9876543212', department: 'Electrical', role: 'Electrician', dailyRate: 1000 },
    { name: 'Suresh Kumar', phone: '9876543213', department: 'Carpentry', role: 'Worker', dailyRate: 750 },
    { name: 'Rajesh Verma', phone: '9876543214', department: 'Interior Design', role: 'Designer', dailyRate: 1200 },
    { name: 'Pramod Gupta', phone: '9876543215', department: 'Plumbing', role: 'Plumber', dailyRate: 850 },
    { name: 'Sanjay Joshi', phone: '9876543216', department: 'Wood Work', role: 'Carpenter', dailyRate: 950 },
    { name: 'Manoj Tiwari', phone: '9876543217', department: 'Painting', role: 'Painter', dailyRate: 880 },
    { name: 'Dinesh Yadav', phone: '9876543218', department: 'Electrical', role: 'Electrician', dailyRate: 1050 },
    { name: 'Ashok Mehra', phone: '9876543219', department: 'Interior Design', role: 'Designer', dailyRate: 1300 },
  ];

  let created = 0;
  for (const emp of indianNames) {
    const employeeId = `PIS-${String(existing + created + 1).padStart(3, '0')}`;
    try {
      await Employee.create({
        tenantId,
        employeeId,
        name: emp.name,
        phone: emp.phone,
        department: emp.department,
        role: emp.role,
        joiningDate: new Date(),
        dailyRate: emp.dailyRate,
        standardHours: 8,
        status: 'Active',
      });
      created++;
      console.log(`Created: ${emp.name} (${employeeId})`);
    } catch (e) {
      console.warn(`Skipped ${emp.name}: ${e instanceof Error ? e.message : e}`);
    }
  }

  const total = await Employee.countDocuments({ tenantId });
  console.log(`\nDone! ${created} employees created. Total employees: ${total}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
