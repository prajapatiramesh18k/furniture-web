import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { requireAdmin } from '@/lib/admin-auth';

const fallbackProducts = [
  { _id: '1', name: 'Bedside Table', price: 4999, originalPrice: 6999, rating: 4.5, category: 'bedroom', description: 'Elegant wooden bedside table with 2 drawers.', image: '/images/bed-side-table.jpg' },
  { _id: '2', name: 'Sofa & Chair', price: 24999, originalPrice: 34999, rating: 4.8, category: 'living-room', description: 'Luxurious fabric sofa with matching chair.', image: '/images/sofa.jpg' },
  { _id: '3', name: 'TV Unit', price: 12999, originalPrice: 17999, rating: 4.3, category: 'living-room', description: 'Modern TV unit with storage compartments.', image: '/images/tv-unit.jpeg' },
  { _id: '4', name: 'Dining Table Set', price: 18999, originalPrice: 24999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set.', image: '/images/dining-table.jpeg' },
  { _id: '5', name: 'Study Desk', price: 7999, originalPrice: 9999, rating: 4.2, category: 'office', description: 'Compact study desk with drawer storage.', image: '/images/reception-table.png' },
  { _id: '6', name: 'Shoe Rack', price: 3999, originalPrice: 5999, rating: 4.4, category: 'entryway', description: 'Wooden shoe rack with multiple shelves.', image: '/images/shoe-rack.jpg' },
  { _id: '7', name: 'Kids Bed', price: 14999, originalPrice: 19999, rating: 4.7, category: 'kids-room', description: 'Colorful kids bed with safety rails.', image: '/images/kids-bed.jpg' },
  { _id: '8', name: 'Wardrobe', price: 22999, originalPrice: 29999, rating: 4.5, category: 'bedroom', description: 'Spacious 3-door wardrobe with mirror.', image: '/images/wardrobe.png' },
  { _id: '9', name: 'Pooja Unit', price: 9999, originalPrice: 13999, rating: 4.6, category: 'pooja-unit', description: 'Traditional pooja unit with compartments.', image: '/images/pooja.jpeg' },
  { _id: '10', name: 'Modular Kitchen', price: 59999, originalPrice: 79999, rating: 4.8, category: 'kitchen', description: 'L-shaped modular kitchen.', image: '/images/kitchen.jpeg' },
  { _id: '11', name: 'Crockery Unit', price: 8999, originalPrice: 11999, rating: 4.3, category: 'dining-room', description: 'Elegant crockery unit with glass doors.', image: '/images/bar-unit.jpeg' },
  { _id: '12', name: 'Dressing', price: 15999, originalPrice: 21999, rating: 4.4, category: 'bedroom', description: 'Sturdy almirah with locker compartment.', image: '/images/dressing.jpeg' },
];

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    // Return fallback data if DB is not connected
    return NextResponse.json({ products: fallbackProducts });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request, 'products');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const product = new Product({
      name: body.name,
      slug: generateSlug(body.name || 'product'),
      price: body.price,
      originalPrice: body.originalPrice || body.price,
      rating: body.rating || 4.0,
      category: body.category,
      description: body.description || '',
      image: body.image,
      sku: body.sku || '',
      stock: body.stock ?? 10,
      status: body.status || 'active',
    });
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error?.message, error?.errors);
    return NextResponse.json({ error: 'Failed to create product', details: error?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdmin(request, 'products');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updates } = body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request, 'products');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
