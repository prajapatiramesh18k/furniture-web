import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ reviews });  } catch (error) {
    return NextResponse.json({ reviews: [], error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, approved } = body;
    await Review.findByIdAndUpdate(id, { approved });
    return NextResponse.json({ message: 'Review updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
