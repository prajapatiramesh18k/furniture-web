import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ products: [], error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const product = new Product({
      name: body.name,
      price: body.price,
      originalPrice: body.originalPrice || body.price,
      rating: body.rating || 4.0,
      category: body.category,
      description: body.description || '',
      image: body.image,
    });
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
