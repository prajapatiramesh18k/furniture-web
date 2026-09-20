import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteVisit from '@/lib/models/SiteVisit';
import { requireTenant, tenantFilter, writeAudit } from '@/lib/tenant';

const STATUSES = ['scheduled', 'completed', 'rescheduled', 'cancelled'];
const QUOTE_STATUSES = ['pending', 'completed'];

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'customers');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const url = new URL(request.url);
    const singleId = url.searchParams.get('id');
    if (singleId) {
      const visit = await SiteVisit.findOne(tenantFilter(gate.ctx.user.tenantId!, { _id: singleId }))
        .populate('assignedTo', 'name')
        .populate('leadId', 'email name phone');
      if (!visit) return NextResponse.json({ error: 'Site visit not found' }, { status: 404 });
      return NextResponse.json({ success: true, visit });
    }
    const status = url.searchParams.get('status');
    const extra = status && STATUSES.includes(status) ? { status } : {};
    const visits = await SiteVisit.find(tenantFilter(gate.ctx.user.tenantId!, extra))
      .populate('assignedTo', 'name')
      .populate('leadId', 'email name phone')
      .sort({ visitDate: 1 });
    return NextResponse.json({ success: true, visits });
  } catch (err: unknown) {
    console.error('site-visits GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch site visits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'customers');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.tenantId;
    delete body.createdBy;
    if (!body.customerName || !body.visitDate) {
      return NextResponse.json({ error: 'Customer name and visit date are required' }, { status: 400 });
    }
    if (body.status !== undefined && !STATUSES.includes(String(body.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (body.quoteStatus !== undefined && !QUOTE_STATUSES.includes(String(body.quoteStatus))) {
      return NextResponse.json({ error: 'Invalid quote status' }, { status: 400 });
    }
    const visit = new SiteVisit({
      ...body,
      tenantId: gate.ctx.user.tenantId,
      createdBy: gate.ctx.user.id,
    });
    await visit.save();
    try {
      if (gate.ctx.user.tenantId) {
        await writeAudit(gate.ctx.user.tenantId, gate.ctx.user.id, gate.ctx.user.email, 'sitevisit.create', 'SiteVisit', String(visit._id), {
          customer: body.customerName,
        });
      }
    } catch {}
    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch (err: unknown) {
    console.error('site-visits POST error:', err);
    return NextResponse.json({ error: 'Failed to schedule site visit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'customers');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Visit id is required' }, { status: 400 });
    delete patch.tenantId;
    delete patch.createdBy;
    if (patch.status !== undefined && !STATUSES.includes(String(patch.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (patch.quoteStatus !== undefined && !QUOTE_STATUSES.includes(String(patch.quoteStatus))) {
      return NextResponse.json({ error: 'Invalid quote status' }, { status: 400 });
    }
    const visit = await SiteVisit.findOneAndUpdate(tenantFilter(gate.ctx.user.tenantId!, { _id: id }), patch, { new: true });
    if (!visit) return NextResponse.json({ error: 'Site visit not found' }, { status: 404 });
    return NextResponse.json({ success: true, visit });
  } catch (err: unknown) {
    console.error('site-visits PUT error:', err);
    return NextResponse.json({ error: 'Failed to update site visit' }, { status: 500 });
  }
}
