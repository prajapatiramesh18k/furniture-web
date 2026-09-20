import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GalleryImage from '@/lib/models/GalleryImage';

const IMAGES_PER_PAGE = 12;

// Room → subcategory IDs mapping (matches gallery/page.tsx subCategories)
const roomSubMap: Record<string, string[]> = {
  'living-room': ['sofas','sofa-cum-beds','coffee-tables','tv-cabinets','tv-unit','recliners','bookshelves','almirah','mirrors'],
  'bedroom': ['beds','wardrobes','mattresses','bedside-tables','dressers','bed-panelling','almirah','mirrors'],
  'dining-room': ['dining-tables','dining-table','dining-chairs','bar-units','bar-unit','crockery-units','crockery-unit'],
  'kitchen': ['kitchen-cabinets','storage-units','storage-solution'],
  'pooja-room': ['pooja-units','pooja-unit'],
  'office': ['office-tables','office-chairs','filing-cabinets','study-tables','bookshelves'],
  'entryway': ['shoe-racks','shoe-rack','console-tables','coat-racks'],
  'kids-room': ['kids-beds','study-desks','toy-storage','kids-chairs'],
  'outdoor': ['garden-chairs','balcony-sets','outdoor-tables','swing-chairs'],
  'decor': ['mirrors','wall-shelves','home-decor','plant-stands','ceiling','door'],
};

// In-memory cache with TTL + simple bound so it can't grow without limit
interface CacheEntry {
  data: unknown;
  expire: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300_000; // 5 minutes
const MAX_CACHE_ENTRIES = 100;

function cacheSet(key: string, data: unknown) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(key, { data, expire: Date.now() + CACHE_TTL });
}

function getCacheKey(page: number, category: string, limit: number) {
  return `${page}:${category}:${limit}`;
}

// Tenant lookup cached separately — avoids an extra DB round-trip on every cache miss
let tenantCache: { id: string | null; expire: number } | null = null;
async function getStorefrontTenantId(): Promise<string | null> {
  if (tenantCache && tenantCache.expire > Date.now()) return tenantCache.id;
  try {
    const Tenant = (await import('@/lib/models/Tenant')).default;
    const slug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
    const dt = (await Tenant.findOne({ slug }).select('_id').lean()) || (await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 }).select('_id').lean());
    const id = dt ? String(dt._id) : null;
    tenantCache = { id, expire: Date.now() + CACHE_TTL };
    return id;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const category = searchParams.get('category') || 'all';
    const room = searchParams.get('room') || '';
    // Clamp limit so a crafted query can't force a huge payload/slow scan
    const rawLimit = parseInt(searchParams.get('limit') || String(IMAGES_PER_PAGE));
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 24) : IMAGES_PER_PAGE;

    // Check cache (key includes limit so custom limits never collide)
    const cacheKey = getCacheKey(page, `${category}:${room}`, limit);
    const cached = cache.get(cacheKey);
    if (cached && cached.expire > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      });
    }

    await dbConnect();
    // Public gallery shows the default storefront tenant's images.
    const storefrontTenantId = await getStorefrontTenantId();
    let filter: Record<string, unknown> = storefrontTenantId ? { tenantId: storefrontTenantId } : {};
    if (category !== 'all') {
      filter.category = category;
    } else if (room && room !== 'all') {
      filter.category = { $in: roomSubMap[room] || [] };
    }

    const [images, total] = await Promise.all([
      GalleryImage.find(filter)
        .select('_id category url isUploaded uploadedAt')
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GalleryImage.countDocuments(filter),
    ]);

    // Minimal payload — only the fields the gallery grid renders
    const result = {
      images: images.map((img) => ({
        _id: String(img._id),
        category: img.category,
        url: img.url,
        isUploaded: img.isUploaded ?? true,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result
    cacheSet(cacheKey, result);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ images: [], total: 0, page: 1, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Previously public write — now requires login + collections permission; tenant-scoped.
  const { requireAdmin } = await import('@/lib/admin-auth');
  const gate = await requireAdmin(request, 'collections');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const image = new GalleryImage({
      tenantId: gate.user.tenantId,
      category: body.category,
      url: body.url,
      isUploaded: true,
    });
    await image.save();

    // Clear cache on new upload
    cache.clear();

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { requireAdmin } = await import('@/lib/admin-auth');
  const gate = await requireAdmin(request, 'collections');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const filter = gate.user.isSuperAdmin && !gate.user.tenantId ? { _id: id } : { _id: id, tenantId: gate.user.tenantId };
    const deleted = await GalleryImage.findOneAndDelete(filter);
    if (!deleted) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    // Clear cache on delete
    cache.clear();

    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
