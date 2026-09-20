import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireTenant, writeAudit } from '@/lib/tenant';
import Tenant from '@/lib/models/Tenant';

/** Current tenant's public branding/settings (used by header, quotations, PDFs). */
export async function GET(request: NextRequest) {
  const gate = await requireTenant(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  if (ctx.user.isSuperAdmin && !ctx.tenant) {
    return NextResponse.json({ success: true, tenant: null, enabledModules: [] });
  }
  await dbConnect();
  const t = await Tenant.findById(ctx.user.tenantId).lean();
  if (!t) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  const { companyPrefixFor, normalizeEmployeePrefix } = await import('@/lib/employee-id-utils');
  return NextResponse.json({
    success: true,
    tenant: {
      id: String(t._id),
      name: t.name,
      slug: t.slug,
      logo: t.logo || '',
      address: t.address || '',
      phone: t.phone || '',
      email: t.email || '',
      gstNumber: t.gstNumber || '',
      quotationPrefix: t.quotationPrefix || 'Q',
      employeePrefix: (t as { employeePrefix?: string }).employeePrefix
        ? normalizeEmployeePrefix((t as { employeePrefix?: string }).employeePrefix, t.name)
        : companyPrefixFor(t.name),
      website: t.website || '',
    },
    enabledModules: Array.from(ctx.enabledModules),
  });
}

/** Owner/admin updates company settings. */
export async function PUT(request: NextRequest) {
  const gate = await requireTenant(request, 'settings');
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  if (ctx.user.role !== 'owner' && ctx.user.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners/admins can update company settings.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const allowed = ['name', 'logo', 'address', 'phone', 'email', 'gstNumber', 'quotationPrefix', 'employeePrefix', 'website'] as const;
    const patch: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) patch[k] = typeof body[k] === 'string' ? String(body[k]).slice(0, k === 'logo' ? 1500000 : k === 'address' ? 2000 : 500) : body[k];
    }
    if (patch.quotationPrefix) patch.quotationPrefix = String(patch.quotationPrefix).slice(0, 8) || 'Q';
    if (patch.employeePrefix !== undefined) {
      const { normalizeEmployeePrefix } = await import('@/lib/employee-id-utils');
      const v = String(patch.employeePrefix || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
      if (!v) throw new Error('Employee prefix is required (2-5 letters, e.g. PIS).');
      if (v.length < 2) throw new Error('Employee prefix must be 2-5 letters (e.g. PIS).');
      patch.employeePrefix = normalizeEmployeePrefix(v);
    }
    await dbConnect();
    const t = await Tenant.findOneAndUpdate(
      { _id: ctx.user.tenantId },
      { $set: patch },
      { new: true },
    ).lean();
    if (!t) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    await writeAudit(ctx.user.tenantId, ctx.user.id, ctx.user.email, 'tenant.settings.update', 'Tenant', String(t._id), patch);
    return NextResponse.json({ success: true, tenant: t });
  } catch (e) {
    console.error('tenant settings update error', e);
    return NextResponse.json({ error: e instanceof Error && e.message ? e.message : 'Failed to update settings' }, { status: 500 });
  }
}
