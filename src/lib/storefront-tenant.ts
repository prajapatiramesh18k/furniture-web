import dbConnect from '@/lib/mongodb';
import Tenant from '@/lib/models/Tenant';

// Cache the default storefront tenant id in memory so hot public endpoints
// (/products, /reviews, /gallery, public checkout) skip 1-2 Mongo roundtrips
// per request. TTL + in-flight dedup prevents stampedes across concurrent hits.
let cachedId: string | null = null;
let expire = 0;
let inflight: Promise<string | null> | null = null;

const TTL_MS = 5 * 60_000; // 5 min — tenant rarely changes

async function lookup(): Promise<string | null> {
  await dbConnect();
  const slug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
  const dt =
    (await Tenant.findOne({ slug }).select('_id').lean()) ||
    (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).select('_id').lean());
  return dt ? String((dt as { _id: unknown })._id) : null;
}

export async function getStorefrontTenantId(): Promise<string | null> {
  if (cachedId && expire > Date.now()) return cachedId;
  if (inflight) return inflight;
  inflight = lookup()
    .then((id) => {
      cachedId = id;
      expire = Date.now() + TTL_MS;
      return id;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function clearStorefrontTenantCache() {
  cachedId = null;
  expire = 0;
}
