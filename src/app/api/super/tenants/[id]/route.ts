import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSuperAdmin, writeAudit } from '@/lib/tenant';
import Tenant from '@/lib/models/Tenant';
import TenantModule, { MODULE_KEYS } from '@/lib/models/TenantModule';

export async function GET(request: NextRequest, ctx2: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { id } = await ctx2.params;
  await dbConnect();
  const t = await Tenant.findById(id).lean();
  if (!t) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  const modules = await TenantModule.find({ tenantId: id }).lean();
  return NextResponse.json({ success: true, tenant: t, modules });
}

export async function PUT(request: NextRequest, ctx2: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  const { id } = await ctx2.params;
  try {
    const body = await request.json();
    const allowed = [
      'name', 'status', 'logo', 'address', 'phone', 'email', 'gstNumber',
      'quotationPrefix', 'employeePrefix', 'website', 'plan', 'subscriptionStatus', 'subscriptionStart', 'subscriptionEnd',
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];
    if (patch.employeePrefix !== undefined) {
      const { normalizeEmployeePrefix } = await import('@/lib/employee-id-utils');
      const v = String(patch.employeePrefix || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
      if (!v || v.length < 2) return NextResponse.json({ error: 'Employee prefix must be 2-5 letters (e.g. PIS).' }, { status: 400 });
      patch.employeePrefix = normalizeEmployeePrefix(v);
    }
    if (patch.name !== undefined) {
      const v = String(patch.name || '').trim().slice(0, 120);
      if (!v) return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
      patch.name = v;
    }
    if (patch.quotationPrefix !== undefined) {
      const v = String(patch.quotationPrefix || '').trim().slice(0, 8);
      if (!v) return NextResponse.json({ error: 'Quotation prefix is required.' }, { status: 400 });
      patch.quotationPrefix = v;
    }
    if (patch.plan !== undefined && !['FREE', 'BASIC', 'PRO', 'ENTERPRISE'].includes(String(patch.plan))) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }
    // Guard against oversized logo payloads (data-URL uploads).
    if (typeof patch.logo === 'string') patch.logo = String(patch.logo).slice(0, 1500000);
    if (typeof patch.website === 'string') patch.website = String(patch.website).slice(0, 300);
    if (patch.status && !['active', 'suspended'].includes(String(patch.status))) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    await dbConnect();
    // Sync module toggles if provided: { modules: { QUOTATION: true, ... } }
    if (body.modules && typeof body.modules === 'object') {
      for (const key of MODULE_KEYS) {
        if ((body.modules as Record<string, unknown>)[key] !== undefined) {
          await TenantModule.findOneAndUpdate(
            { tenantId: id, moduleKey: key },
            { $set: { enabled: !!(body.modules as Record<string, unknown>)[key] } },
            { upsert: true },
          );
        }
      }
    }
    const t = await Tenant.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    if (!t) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    await writeAudit(null, ctx.user.id, ctx.user.email, 'tenant.update', 'Tenant', id, patch);
    return NextResponse.json({ success: true, tenant: t });
  } catch (e) {
    console.error('super tenant update error', e);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}
