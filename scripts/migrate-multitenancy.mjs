/**
 * Multi-tenancy backfill migration (SAFE, idempotent).
 *
 * What it does:
 *  1. Creates the `ananya-house-of-furniture` tenant (or reuses it by slug).
 *  2. Enables QUOTATION + EMPLOYEE_MANAGEMENT (+ INVENTORY + ACCOUNTING for Ananya).
 *  3. Assigns tenantId to every business document that lacks one.
 *  4. Seeds per-tenant quotation counters from the legacy global `quotation` counter.
 *  5. Promotes the earliest admin user of the tenant to `owner` (keeps the rest).
 *  6. Rebuilds the User email index as compound { tenantId, email } unique
 *     (drops the legacy global unique index on email when safe).
 *
 * Safety:
 *  - Dry-run by default: `node scripts/migrate-multitenancy.mjs`
 *  - Apply: `node scripts/migrate-multitenancy.mjs --apply`
 *  - Back up first: `mongodump --uri="$MONGODB_URI" --out=./backup-$(date +%F)`
 *
 * Requires: MONGODB_URI in env / .env.local
 */
import mongoose from 'mongoose';
import fs from 'node:fs';

const APPLY = process.argv.includes('--apply');

function loadEnv() {
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
}
loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Aborting.');
  process.exit(1);
}

const TenantSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    status: { type: String, default: 'active' },
    logo: { type: String, default: '' },
    address: String,
    phone: String,
    email: String,
    gstNumber: String,
    quotationPrefix: { type: String, default: 'Q' },
    website: String,
    plan: { type: String, default: 'FREE' },
    subscriptionStatus: { type: String, default: 'none' },
  },
  { timestamps: true, strict: false },
);

const BUSINESS_COLLECTIONS = [
  'users',
  'quotations',
  'employees',
  'sites',
  'employeeattendances',
  'employeepayments',
  'employeesettlements',
  'orders',
  'products',
  'reviews',
  'galleryimages',
  'contacts',
];

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

await mongoose.connect(uri);

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');
const TenantModule =
  mongoose.models.TenantModule ||
  mongoose.model(
    'TenantModule',
    new mongoose.Schema(
      { tenantId: mongoose.Schema.Types.ObjectId, moduleKey: String, enabled: Boolean },
      { timestamps: true },
    ),
    'tenantmodules',
  );

let tenant = await Tenant.findOne({ slug: 'ananya-house-of-furniture' });
if (!tenant && APPLY) {
  tenant = await Tenant.create({
    name: 'Ananya House of Furniture',
    slug: 'ananya-house-of-furniture',
    status: 'active',
    address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra - 400612',
    phone: '+91 93218 12823',
    email: 'ananyahouseoffurniture@gmail.com',
    quotationPrefix: 'Q',
    website: 'www.ananyahouseoffurniture.in',
    plan: 'PRO',
    subscriptionStatus: 'active',
  });
  console.log('Created tenant ananya-house-of-furniture:', String(tenant._id));
  for (const k of ['QUOTATION', 'EMPLOYEE_MANAGEMENT', 'INVENTORY', 'ACCOUNTING']) {
    await TenantModule.updateOne(
      { tenantId: tenant._id, moduleKey: k },
      { $set: { enabled: true } },
      { upsert: true },
    );
  }
  console.log('Enabled all 4 modules for Ananya.');
} else if (tenant) {
  console.log('Using existing tenant:', tenant.name, String(tenant._id));
} else {
  console.log('[dry-run] Would create tenant ananya-house-of-furniture + enable 4 modules.');
  // Fake id for dry-run counts only
  tenant = { _id: null };
}

const db = mongoose.connection.db;
for (const coll of BUSINESS_COLLECTIONS) {
  let total = 0;
  let missing = 0;
  try {
    total = await db.collection(coll).countDocuments();
    missing = await db.collection(coll).countDocuments({ $or: [{ tenantId: null }, { tenantId: { $exists: false } }] });
  } catch (e) {
    console.log(`- ${coll}: collection missing, skipped`);
    continue;
  }
  if (APPLY && tenant._id && missing > 0) {
    const r = await db.collection(coll).updateMany(
      { $or: [{ tenantId: null }, { tenantId: { $exists: false } }] },
      { $set: { tenantId: tenant._id } },
    );
    console.log(`- ${coll}: ${total} docs, backfilled ${r.modifiedCount} with tenantId`);
  } else {
    console.log(`- ${coll}: ${total} docs, ${missing} without tenantId${APPLY ? '' : ' (would backfill)'}`);
  }
}

// Per-tenant quotation counter from legacy global key
try {
  const legacy = await db.collection('counters').findOne({ _id: 'quotation' });
  if (legacy && tenant._id) {
    const key = `quotation:${String(tenant._id)}`;
    if (APPLY) {
      await db.collection('counters').updateOne({ _id: key }, { $set: { seq: legacy.seq } }, { upsert: true });
      console.log(`Counter: seeded ${key} at seq=${legacy.seq} (legacy key kept for history)`);
    } else {
      console.log(`[dry-run] Would seed ${key} at seq=${legacy.seq}`);
    }
  }
} catch {}

// Promote earliest admin to owner
if (APPLY && tenant._id) {
  const first = await db.collection('users').find({ tenantId: tenant._id }).sort({ createdAt: 1 }).limit(1).toArray();
  if (first[0] && first[0].role === 'admin') {
    await db.collection('users').updateOne({ _id: first[0]._id }, { $set: { role: 'owner' } });
    console.log('Promoted earliest admin to owner:', first[0].email);
  }
}

// Email index: drop legacy global unique, ensure compound unique
if (APPLY) {
  try {
    const indexes = await db.collection('users').indexes();
    const legacyEmail = indexes.find((i) => i.name === 'email_1');
    if (legacyEmail && legacyEmail.unique) {
      // Only safe when no duplicate emails exist globally; duplicates across
      // tenants are exactly what the compound index allows, so check first.
      const dupes = await db.collection('users').aggregate([
        { $group: { _id: '$email', n: { $sum: 1 } } },
        { $match: { n: { $gt: 1 } } },
        { $limit: 1 },
      ]).toArray();
      if (dupes.length === 0) {
        await db.collection('users').dropIndex('email_1');
        console.log('Dropped legacy global unique index email_1');
      } else {
        console.log('Kept legacy email_1 index: duplicate emails exist globally; resolve manually before dropping.');
      }
    }
    await db.collection('users').createIndex({ tenantId: 1, email: 1 }, { unique: true });
    console.log('Ensured compound unique index { tenantId, email }');
  } catch (e) {
    console.log('Index migration note:', e.message);
  }
  for (const [coll, spec] of [
    ['quotations', { tenantId: 1, createdAt: -1 }],
    ['employees', { tenantId: 1, createdAt: -1 }],
    ['sites', { tenantId: 1, createdAt: -1 }],
    ['orders', { tenantId: 1, createdAt: -1 }],
    ['contacts', { tenantId: 1, createdAt: -1 }],
    ['products', { tenantId: 1, createdAt: -1 }],
  ]) {
    try {
      await db.collection(coll).createIndex(spec);
      console.log(`Ensured index on ${coll}:`, JSON.stringify(spec));
    } catch (e) {
      console.log(`Index note ${coll}:`, e.message);
    }
  }
}

console.log(APPLY ? 'Migration applied.' : 'Dry-run complete. Re-run with --apply to write changes.');
await mongoose.disconnect();
