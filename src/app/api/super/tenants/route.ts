import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { requireSuperAdmin, writeAudit } from '@/lib/tenant';
import Tenant, { tenantSlugFor } from '@/lib/models/Tenant';
import TenantModule, { MODULE_KEYS } from '@/lib/models/TenantModule';
import User from '@/lib/models/User';

/** List tenants (super admin only). */
export async function GET(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  await dbConnect();
  const tenants = await Tenant.find({}).sort({ createdAt: -1 }).lean();
  const ids = tenants.map((t) => t._id);
  const [modules, userCounts] = await Promise.all([
    TenantModule.find({ tenantId: { $in: ids } }).lean(),
    User.aggregate([
      { $match: { tenantId: { $in: ids } } },
      { $group: { _id: '$tenantId', count: { $sum: 1 } } },
    ]),
  ]);
  const countBy = new Map(userCounts.map((u) => [String(u._id), u.count]));
  return NextResponse.json({
    success: true,
    tenants: tenants.map((t) => ({
      ...t,
      id: String(t._id),
      users: countBy.get(String(t._id)) ?? 0,
      modules: modules
        .filter((m) => String(m.tenantId) === String(t._id))
        .map((m) => ({ moduleKey: m.moduleKey, enabled: m.enabled })),
    })),
  });
}

/** Create tenant + owner + modules (company onboarding). */
export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  try {
    const body = await request.json();
    const { companyName, ownerName, ownerEmail, ownerPassword, modules, plan } = body as {
      companyName?: string;
      ownerName?: string;
      ownerEmail?: string;
      ownerPassword?: string;
      modules?: Record<string, boolean>;
      plan?: string;
      // Company branding shown on quotations/PDFs (logo, website, email, mobile, address, GST).
      logo?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
      gstNumber?: string;
      quotationPrefix?: string;
      employeePrefix?: string;
    };
    if (!companyName || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json({ error: 'companyName, ownerName, ownerEmail, ownerPassword are required' }, { status: 400 });
    }
    if (String(ownerPassword).length < 6) {
      return NextResponse.json({ error: 'Owner password must be at least 6 characters' }, { status: 400 });
    }
    await dbConnect();
    const baseSlug = tenantSlugFor(companyName) || 'company';
    let slug = baseSlug;
    for (let i = 2; await Tenant.findOne({ slug }).lean(); i++) slug = `${baseSlug}-${i}`;

    const { companyPrefixFor, normalizeEmployeePrefix } = await import('@/lib/employee-id-utils');
    const tenant = await Tenant.create({
      name: String(companyName).slice(0, 120),
      slug,
      status: 'active',
      employeePrefix: normalizeEmployeePrefix(
        typeof (body as { employeePrefix?: string }).employeePrefix === 'string'
          ? (body as { employeePrefix?: string }).employeePrefix
          : companyPrefixFor(String(companyName)),
      ),
      plan: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'].includes(String(plan)) ? plan : 'FREE',
      // Branding — rendered in the quotation maker header/PDF. Empty = fallback defaults.
      logo: typeof body.logo === 'string' ? String(body.logo).slice(0, 1500000) : '',
      phone: typeof body.phone === 'string' ? String(body.phone).slice(0, 100) : '',
      email: typeof body.email === 'string' ? String(body.email).slice(0, 200) : '',
      website: typeof body.website === 'string' ? String(body.website).slice(0, 300) : '',
      address: typeof body.address === 'string' ? String(body.address).slice(0, 1000) : '',
      gstNumber: typeof body.gstNumber === 'string' ? String(body.gstNumber).slice(0, 100) : '',
      quotationPrefix: typeof body.quotationPrefix === 'string' && body.quotationPrefix.trim()
        ? String(body.quotationPrefix).trim().slice(0, 8)
        : 'Q',
    });

    const enabledKeys = MODULE_KEYS.filter((k) => modules?.[k] !== false);
    const disabledKeys = MODULE_KEYS.filter((k) => modules?.[k] === false);
    // Default: QUOTATION + EMPLOYEE_MANAGEMENT on unless explicitly disabled.
    await TenantModule.insertMany(
      MODULE_KEYS.map((k) => ({
        tenantId: tenant._id,
        moduleKey: k,
        enabled: modules?.[k] !== undefined ? !!modules[k] : k === 'QUOTATION' || k === 'EMPLOYEE_MANAGEMENT',
      })),
    );

    const hashed = await bcrypt.hash(String(ownerPassword), 10);
    const owner = await User.create({
      name: String(ownerName).slice(0, 120),
      email: String(ownerEmail).toLowerCase(),
      password: hashed,
      role: 'owner',
      isAdmin: true,
      tenantId: tenant._id,
    });

    await writeAudit(null, ctx.user.id, ctx.user.email, 'tenant.create', 'Tenant', String(tenant._id), {
      name: tenant.name,
      slug,
      ownerEmail: owner.email,
      enabled: enabledKeys,
      disabled: disabledKeys,
    });

    return NextResponse.json(
      { success: true, tenant: { id: String(tenant._id), name: tenant.name, slug }, owner: { id: String(owner._id), email: owner.email } },
      { status: 201 },
    );
  } catch (e: unknown) {
    console.error('super tenant create error', e);
    const msg = e instanceof Error ? e.message : 'Failed to create company';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
