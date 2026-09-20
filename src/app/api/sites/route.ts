import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Site from '@/lib/models/Site';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

/**
 * Property / site creation for the execution workflow.
 * GPS is optional here (a property becomes geo-fenced later from Job Sites).
 * The strict /api/admin/sites endpoint is unchanged.
 */
export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.tenantId;
    const { name, clientName, customerId, address, propertyType, area, rooms, latitude, longitude } = body;
    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json({ error: 'Site name and address are required' }, { status: 400 });
    }
    const lat = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lng = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    if ((lat !== null && Number.isNaN(lat)) || (lng !== null && Number.isNaN(lng))) {
      return NextResponse.json({ error: 'Invalid GPS coordinates' }, { status: 400 });
    }
    const site = await Site.create({
      tenantId: gate.ctx.user.tenantId,
      name: name.trim(),
      clientName: clientName?.trim() || '',
      customerId: customerId || null,
      leadId: body.leadId || null,
      quotationId: body.quotationId || null,
      propertyType: propertyType?.trim() || '',
      area: area?.trim() || '',
      rooms: rooms?.trim() || '',
      address: address.trim(),
      location: { latitude: lat, longitude: lng },
      notes: body.notes?.trim() || '',
    });
    try {
      if (gate.ctx.user.tenantId) {
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'site.create', 'Site', String(site._id), { name: site.name });
      }
    } catch {}
    return NextResponse.json({ success: true, site }, { status: 201 });
  } catch (err: unknown) {
    console.error('sites POST error:', err);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}
