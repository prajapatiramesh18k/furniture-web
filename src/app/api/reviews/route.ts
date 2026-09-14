import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';

// Short-lived in-memory cache so repeat homepage hits skip Mongo entirely.
interface CacheEntry {
  data: unknown;
  expire: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000; // 60s
const LIST_CACHE_KEY = 'reviews:approved';

function clearListCache() {
  cache.delete(LIST_CACHE_KEY);
}

export async function GET(request: NextRequest) {
  const limitParam = parseInt(new URL(request.url).searchParams.get('limit') || '50', 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;
  const cacheKey = `${LIST_CACHE_KEY}:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expire > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  try {
    await dbConnect();
    // lean() avoids Mongoose document hydration; indexed { approved, createdAt } sort; bounded limit
    const reviews = await Review.find({ approved: true })
      .select('name location rating text photo date propertyType services createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    cache.set(cacheKey, { data: reviews, expire: Date.now() + CACHE_TTL });
    return NextResponse.json(reviews, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const review = new Review({
      name: body.name,
      location: body.location,
      rating: body.rating,
      text: body.text,
      photo: body.photo || '',
      date: body.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      approved: false,
      propertyType: body.propertyType || '',
      services: body.services || [],
      completedDate: body.completedDate || '',
    });
    await review.save();
    clearListCache();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Review save error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Review.findByIdAndDelete(id);
    clearListCache();
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
