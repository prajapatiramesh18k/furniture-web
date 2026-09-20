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
  const all = await Tenant.find({}).select('name status slug').lean();
  for (const t of all) console.log('  -', t.name, `(${t.status}) slug: ${t.slug}`);
  
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});