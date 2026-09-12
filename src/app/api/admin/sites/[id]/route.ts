import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Site from '@/lib/models/Site';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const site = await Site.findById(id).lean();
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (err: any) {
    console.error('Error fetching site:', err);
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.clientName !== undefined) updateData.clientName = body.clientName.trim();
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.notes !== undefined) updateData.notes = body.notes.trim();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.radiusMeters !== undefined) updateData.radiusMeters = Math.max(20, Math.min(5000, Number(body.radiusMeters)));

    if (body.latitude !== undefined && body.longitude !== undefined) {
      updateData.location = {
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
      };
    }

    const updatedSite = await Site.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSite);
  } catch (err: any) {
    console.error('Error updating site:', err);
    return NextResponse.json({ error: err.message || 'Failed to update site' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedSite = await Site.findByIdAndDelete(id);
    if (!deletedSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting site:', err);
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}
