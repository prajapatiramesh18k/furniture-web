import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GalleryImage from '@/lib/models/GalleryImage';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let images;
    if (category) {
      images = await GalleryImage.find({ category }).sort({ uploadedAt: -1 });
    } else {
      images = await GalleryImage.find().sort({ uploadedAt: -1 });
    }
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
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
    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
