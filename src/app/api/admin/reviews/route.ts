import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';

const fallbackReviews = [
  { _id: '1', name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'Beautiful furniture! The craftsmanship is amazing.', date: '2024-01-15', approved: false },
  { _id: '2', name: 'Rahul Verma', location: 'Delhi', rating: 4, text: 'Great quality, fast delivery. Highly recommended!', date: '2024-01-10', approved: false },
  { _id: '3', name: 'Sneha Patel', location: 'Ahmedabad', rating: 5, text: 'The pooja unit is stunning. Very professional service.', date: '2024-01-05', approved: false },
];

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error) {
    // Return fallback data if DB is not connected
    return NextResponse.json({ reviews: fallbackReviews });
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
