import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

for (const f of ['.env.local', '.env']) {
  try {
    const raw = readFileSync(f, 'utf8');
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
  await mongoose.connect(process.env.MONGODB_URI!);
  const { default: Employee } = await import('@/lib/models/Employee');
  const emps = await Employee.find({}).select('employeeId name').lean();
  const extras = emps.filter((e: any) => parseInt(e.employeeId.split('-')[1]) > 10);
  if (extras.length > 0) {
    await Employee.deleteMany({ employeeId: { $in: extras.map((e: any) => e.employeeId) } });
    console.log(`Deleted ${extras.length} extra employees`);
  }
  const count = await Employee.countDocuments();
  console.log(`Total employees now: ${count}`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
