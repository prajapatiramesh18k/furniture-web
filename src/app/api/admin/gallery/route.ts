import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GalleryImage from '@/lib/models/GalleryImage';

const fallbackGalleryImages = [
  { _id: '1', category: 'pooja-unit', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', isUploaded: false },
  { _id: '2', category: 'tv-unit', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', isUploaded: false },
  { _id: '3', category: 'bedroom', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', isUploaded: false },
  { _id: '4', category: 'living-room', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', isUploaded: false },
  { _id: '5', category: 'kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', isUploaded: false },
  { _id: '6', category: 'dining-room', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', isUploaded: false },
  { _id: '7', category: 'office', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', isUploaded: false },
  { _id: '8', category: 'bed-panelling', url: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800', isUploaded: false },
  { _id: '9', category: 'ceiling', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isUploaded: false },
  { _id: '10', category: 'almirah', url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800', isUploaded: false },
  { _id: '11', category: 'shoe-rack', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', isUploaded: false },
  { _id: '12', category: 'kids-room', url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', isUploaded: false },
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const category = request.nextUrl.searchParams.get('category');

    let images;
    if (category) {
      images = await GalleryImage.find({ category }).sort({ uploadedAt: -1 });
    } else {
      images = await GalleryImage.find().sort({ uploadedAt: -1 });
    }
    return NextResponse.json(images);
  } catch (error) {
    // Return fallback data if DB is not connected
    const category = request.nextUrl.searchParams.get('category');
    if (category) {
      return NextResponse.json(fallbackGalleryImages.filter(img => img.category === category));
    }
    return NextResponse.json(fallbackGalleryImages);
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
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await GalleryImage.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
