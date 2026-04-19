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

// In-memory cache with TTL
interface CacheEntry {
  data: unknown;
  expire: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300_000; // 5 minutes

function getCacheKey(page: number, category: string) {
  return `${page}:${category}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const category = searchParams.get('category') || 'all';
    const room = searchParams.get('room') || '';
    const limit = parseInt(searchParams.get('limit') || String(IMAGES_PER_PAGE));

    // Check cache
    const cacheKey = getCacheKey(page, `${category}:${room}`);
    const cached = cache.get(cacheKey);
    if (cached && cached.expire > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      });
    }

    await dbConnect();
    let filter: Record<string, unknown> = {};
    if (category !== 'all') {
      filter.category = category;
    } else if (room && room !== 'all') {
      filter.category = { $in: roomSubMap[room] || [] };
    }

    const [images, total] = await Promise.all([
      GalleryImage.find(filter)
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GalleryImage.countDocuments(filter),
    ]);

    const result = {
      images,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result
    cache.set(cacheKey, { data: result, expire: Date.now() + CACHE_TTL });

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ images: [], total: 0, page: 1, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const image = new GalleryImage({
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
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await GalleryImage.findByIdAndDelete(id);

    // Clear cache on delete
    cache.clear();

    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
