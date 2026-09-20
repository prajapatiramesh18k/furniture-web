import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Site from '@/lib/models/Site';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireTenant(req as never, 'team');
    if ('error' in gate) return gate.error;
    await dbConnect();
    const { id } = await params;
    const site = await Site.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: id })).lean();
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
    const gate = await requireTenant(req as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage job sites.' }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    delete body.tenantId;

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

    const updatedSite = await Site.findOneAndUpdate(
      tenantFilter(gate.ctx.user.tenantId!, { _id: id }),
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'site.update', 'Site', id, updateData);

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
    const gate = await requireTenant(req as never, 'team');
    if ('error' in gate) return gate.error;
    const _r = String(gate.ctx.user.role || '').toLowerCase();
    if (!gate.ctx.user.isSuperAdmin && _r !== 'owner' && _r !== 'admin') {
      return NextResponse.json({ error: 'Only owners/admins can manage job sites.' }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const deletedSite = await Site.findOneAndDelete(tenantFilter(gate.ctx.user.tenantId!, { _id: id }));
    if (!deletedSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'site.delete', 'Site', id, {});
    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting site:', err);
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}
