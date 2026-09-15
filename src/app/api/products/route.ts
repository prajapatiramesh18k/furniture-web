import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

const staticProducts = [
  { id: 1, slug: 'bedside-table', name: 'Bedside Table', image: '/images/bed-side-table.jpg', images: ['/images/bed-side-table.jpg', '/images/kids-bedroom.jpeg', '/images/home-slide1.jpg'], price: 4999, originalPrice: 6999, rating: 4.5, category: 'bedroom', description: 'Elegant wooden bedside table with 2 drawers, perfect for modern bedrooms.' },
  { id: 2, slug: 'sofa-cum-bed', name: 'Sofa Cum Bed', image: '/images/sofacumbed.jpeg', images: ['/images/sofacumbed.jpeg', '/images/sofa.jpg', '/images/home-slide2.jpg', '/images/home-slide3.jpg'], price: 19999, originalPrice: 24999, rating: 4.8, category: 'living-room', description: 'Luxurious fabric sofa cum bed, comfortable seating that converts to a bed for guests. Upholstered in premium velvet fabric with high-density foam cushioning for superior comfort. Features solid wood frame, sinuous spring seat, and a smooth pull-out mechanism.' },
  { id: 3, slug: 'tv-unit', name: 'TV Unit', image: '/images/tv-unit.jpeg', images: ['/images/tv-unit.jpeg', '/images/tv-unit.jpg', '/images/tv-unit.png'], price: 12999, originalPrice: 17999, rating: 4.3, category: 'living-room', description: 'Modern TV unit with storage compartments and sleek finish.' },
  { id: 4, slug: 'dining-table-set', name: 'Dining Table Set', image: '/images/dining-table.jpeg', images: ['/images/dining-table.jpeg', '/images/reception-table.png', '/images/home-slide4.jpg'], price: 18999, originalPrice: 24999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set with comfortable chairs, perfect for family meals.' },
  { id: 5, slug: 'study-desk', name: 'Study Desk', image: '/images/reception-table.png', images: ['/images/reception-table.png', '/images/home-slide5.jpg', '/images/bar-unit.jpeg'], price: 7999, originalPrice: 9999, rating: 4.2, category: 'office', description: 'Compact study desk with drawer storage, ideal for home office.' },
  { id: 6, slug: 'shoe-rack', name: 'Shoe Rack', image: '/images/shoe-rack.jpg', images: ['/images/shoe-rack.jpg', '/images/bar-unit.jpeg', '/images/home-slide1.jpg'], price: 3999, originalPrice: 5999, rating: 4.4, category: 'entryway', description: 'Wooden shoe rack with multiple shelves, keeps your entryway organized.' },
  { id: 7, slug: 'kids-bed', name: 'Kids Bed', image: '/images/kids-bed.jpg', images: ['/images/kids-bed.jpg', '/images/kids-bed-wihout-bg.png', '/images/kids-bedroom.jpeg'], price: 14999, originalPrice: 19999, rating: 4.7, category: 'kids-room', description: 'Colorful kids bed with safety rails, perfect for childrens bedroom.' },
  { id: 8, slug: 'wardrobe', name: 'Wardrobe', image: '/images/wardrobe.jpeg', images: ['/images/wardrobe.jpeg', '/images/wardrobe.png', '/images/home-slide2.jpg'], price: 22999, originalPrice: 29999, rating: 4.5, category: 'bedroom', description: 'Spacious 3-door wardrobe with mirror and internal shelves.' },
  { id: 9, slug: 'pooja-unit', name: 'Pooja Unit', image: '/images/pooja.jpeg', images: ['/images/pooja.jpeg', '/images/home-slide1.jpg', '/images/kitchen.jpeg'], price: 9999, originalPrice: 13999, rating: 4.6, category: 'pooja-unit', description: 'Traditional pooja unit with compartments for idols and incense.' },
  { id: 10, slug: 'modular-kitchen', name: 'Modular Kitchen', image: '/images/kitchen.jpeg', images: ['/images/kitchen.jpeg', '/images/home-slide3.jpg', '/images/bar-unit.jpeg'], price: 59999, originalPrice: 79999, rating: 4.8, category: 'kitchen', description: 'L-shaped modular kitchen with premium finish and ample storage.' },
  { id: 11, slug: 'crockery-unit', name: 'Crockery Unit', image: '/images/bar-unit.jpeg', images: ['/images/bar-unit.jpeg', '/images/kitchen.jpeg', '/images/home-slide3.jpg'], price: 8999, originalPrice: 11999, rating: 4.3, category: 'dining-room', description: 'Elegant crockery unit with glass doors to display your collection.' },
  { id: 12, slug: 'dressing', name: 'Dressing', image: '/images/dressing.jpeg', images: ['/images/dressing.jpeg', '/images/wardrobe.jpeg', '/images/kids-bedroom.jpeg'], price: 15999, originalPrice: 21999, rating: 4.4, category: 'bedroom', description: 'Sturdy almirah with locker compartment and adjustable shelves.' },
  { id: 13, slug: 'bookshelf', name: 'Bookshelf', image: '/images/home-slide4.jpg', images: ['/images/home-slide4.jpg', '/images/home-slide5.jpg', '/images/bar-unit.jpeg'], price: 8999, originalPrice: 12999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set with comfortable chairs, perfect for family meals.' },
];

// Short-lived in-memory cache so repeat homepage hits skip Mongo entirely.
interface CacheEntry {
  data: unknown;
  expire: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000; // 60s

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const limitParam = parseInt(searchParams.get('limit') || '0', 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 0;

  // Search queries bypass the full-list cache (key includes query)
  const cacheKey = `products:${q.toLowerCase()}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expire > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  try {
    await dbConnect();

    // Push search down to Mongo with indexed prefix-friendly regex instead of
    // fetching the whole collection and filtering in Node.
    const filter = q
      ? {
          $or: [
            { name: { $regex: escapeRegex(q), $options: 'i' } },
            { category: { $regex: escapeRegex(q), $options: 'i' } },
          ],
        }
      : {};

    let query = Product.find(filter)
      .select('name slug image images price originalPrice rating category description')
      .sort({ createdAt: -1 })
      .lean();
    if (limit > 0) query = query.limit(limit);
    const dbProducts = await query;

    const dbFormatted = dbProducts.map(p => ({
      id: p._id.toString(),
      slug: p.slug || (typeof p.name === 'string' ? p.name.toLowerCase().replace(/\s+/g, '-') : p._id.toString()),
      name: p.name,
      image: p.image,
      images: p.images,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      category: p.category,
      description: p.description,
    }));

    // Static catalog search stays in-memory (tiny, 13 items)
    let products: unknown[];
    if (q) {
      const queryLower = q.toLowerCase();
      const staticFiltered = staticProducts.filter(p =>
        p.name.toLowerCase().includes(queryLower) ||
        p.category.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower)
      );
      products = [...staticFiltered, ...dbFormatted];
    } else {
      products = [...staticProducts, ...dbFormatted];
    }

    const payload = { products };
    cache.set(cacheKey, { data: payload, expire: Date.now() + CACHE_TTL });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ products: staticProducts });
  }
}
