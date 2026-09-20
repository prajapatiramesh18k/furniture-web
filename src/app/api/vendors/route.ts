import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import { requireTenant, tenantFilter } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const vendors = await Vendor.find(tenantFilter(gate.ctx.user.tenantId!)).sort({ company: 1 });
    return NextResponse.json({ success: true, vendors });
  } catch (err: unknown) {
    console.error('vendors GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.tenantId;
    if (!body.company) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    const vendor = new Vendor({ ...body, tenantId: gate.ctx.user.tenantId });
    await vendor.save();
    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (err: unknown) {
    console.error('vendors POST error:', err);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'projects');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Vendor id is required' }, { status: 400 });
    delete patch.tenantId;
    const vendor = await Vendor.findOneAndUpdate(tenantFilter(gate.ctx.user.tenantId!, { _id: id }), patch, { new: true });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, vendor });
  } catch (err: unknown) {
    console.error('vendors PUT error:', err);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
