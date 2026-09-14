import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Site from '@/lib/models/Site';

export async function GET() {
  try {
    await dbConnect();
    const sites = await Site.find().sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json(sites);
  } catch (err: any) {
    console.error('Error fetching sites:', err);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, clientName, address, latitude, longitude, radiusMeters, isActive, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ error: 'Site address is required' }, { status: 400 });
    }
    if (latitude === undefined || latitude === null || isNaN(Number(latitude))) {
      return NextResponse.json({ error: 'Valid latitude is required' }, { status: 400 });
    }
    if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
      return NextResponse.json({ error: 'Valid longitude is required' }, { status: 400 });
    }

    const newSite = await Site.create({
      name: name.trim(),
      clientName: clientName?.trim() || '',
      address: address.trim(),
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      radiusMeters: radiusMeters ? Math.max(20, Math.min(5000, Number(radiusMeters))) : 200,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      notes: notes?.trim() || '',
    });

    return NextResponse.json(newSite, { status: 201 });
  } catch (err: any) {
    console.error('Error creating site:', err);
    return NextResponse.json({ error: err.message || 'Failed to create site' }, { status: 500 });
  }
}
