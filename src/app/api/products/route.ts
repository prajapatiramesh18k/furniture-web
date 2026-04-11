import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

const staticProducts = [
  { id: 1, slug: 'bedside-table', name: 'Bedside Table', image: '/images/product-1.jpg', price: 4999, originalPrice: 6999, rating: 4.5, category: 'bedroom', description: 'Elegant wooden bedside table with 2 drawers, perfect for modern bedrooms.' },
  { id: 2, slug: 'sofa-chair', name: 'Sofa & Chair', image: '/images/product-2.jpg', price: 19999, originalPrice: 24999, rating: 4.8, category: 'living-room', description: 'Luxurious fabric sofa with matching chair, comfortable seating for family gatherings.' },
  { id: 3, slug: 'tv-unit', name: 'TV Unit', image: '/images/tv-unit.jpeg', price: 12999, originalPrice: 17999, rating: 4.3, category: 'living-room', description: 'Modern TV unit with storage compartments and sleek finish.' },
  { id: 4, slug: 'dining-table-set', name: 'Dining Table Set', image: '/images/product-4.jpg', price: 18999, originalPrice: 24999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set with comfortable chairs, perfect for family meals.' },
  { id: 5, slug: 'study-desk', name: 'Study Desk', image: '/images/product-5.jpg', price: 7999, originalPrice: 9999, rating: 4.2, category: 'office', description: 'Compact study desk with drawer storage, ideal for home office.' },
  { id: 6, slug: 'shoe-rack', name: 'Shoe Rack', image: '/images/product-3.jpg', price: 3999, originalPrice: 5999, rating: 4.4, category: 'entryway', description: 'Wooden shoe rack with multiple shelves, keeps your entryway organized.' },
  { id: 7, slug: 'kids-bed', name: 'Kids Bed', image: '/images/kids-bedroom.jpeg', price: 14999, originalPrice: 19999, rating: 4.7, category: 'kids-room', description: 'Colorful kids bed with safety rails, perfect for childrens bedroom.' },
  { id: 8, slug: 'wardrobe', name: 'Wardrobe', image: '/images/wardrobe.jpeg', price: 22999, originalPrice: 29999, rating: 4.5, category: 'bedroom', description: 'Spacious 3-door wardrobe with mirror and internal shelves.' },
  { id: 9, slug: 'pooja-unit', name: 'Pooja Unit', image: '/images/pooja.jpeg', price: 9999, originalPrice: 13999, rating: 4.6, category: 'pooja-unit', description: 'Traditional pooja unit with compartments for idols and incense.' },
  { id: 10, slug: 'modular-kitchen', name: 'Modular Kitchen', image: '/images/kitchen.jpeg', price: 59999, originalPrice: 79999, rating: 4.8, category: 'kitchen', description: 'L-shaped modular kitchen with premium finish and ample storage.' },
  { id: 11, slug: 'crockery-unit', name: 'Crockery Unit', image: '/images/bar-unit.jpeg', price: 8999, originalPrice: 11999, rating: 4.3, category: 'dining-room', description: 'Elegant crockery unit with glass doors to display your collection.' },
  { id: 12, slug: 'almirah', name: 'Almirah', image: '/images/product-10.png', price: 15999, originalPrice: 21999, rating: 4.4, category: 'bedroom', description: 'Sturdy almirah with locker compartment and adjustable shelves.' },
  { id: 13, slug: 'bookshelf', name: 'Bookshelf', image: '/images/product-4.jpg', price: 8999, originalPrice: 12999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set with comfortable chairs, perfect for family meals.' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    await dbConnect();
    const dbProducts = await Product.find().lean();
    const dbFormatted = dbProducts.map(p => ({
      id: p._id.toString(),
      slug: p.slug || (typeof p.name === 'string' ? p.name.toLowerCase().replace(/\s+/g, '-') : p._id.toString()),
      name: p.name,
      image: p.image,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      category: p.category,
      description: p.description,
    }));

    const allProducts = [...staticProducts, ...dbFormatted];

    // Filter by search query if provided
    let products = allProducts;
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      products = allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return NextResponse.json(
      { products: q ? products : allProducts },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch {
    return NextResponse.json({ products: staticProducts });
  }
}
