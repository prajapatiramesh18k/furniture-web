import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
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
    });
    await review.save();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
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
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
