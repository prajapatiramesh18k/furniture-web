import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSuperAdmin, writeAudit } from '@/lib/tenant';
import Tenant from '@/lib/models/Tenant';
import User from '@/lib/models/User';

const ALLOWED_ROLES = ['owner', 'admin', 'manager', 'staff'] as const;

interface PopulatedTenant {
  _id: unknown;
  name?: string;
  slug?: string;
}

interface LoginLean {
  _id: unknown;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  active?: boolean;
  createdAt?: Date;
  tenantId?: PopulatedTenant | string | null;
}

/** Build the login email for a plain username inside a company. */
function loginEmailFor(username: string, tenantSlug: string): string {
  const raw = String(username || '').trim();
  if (raw.includes('@')) return raw.toLowerCase();
  const u = raw.toLowerCase().replace(/[^a-z0-9._-]+/g, '').slice(0, 60) || 'user';
  return `${u}@${tenantSlug}.login`;
}

/** All company logins across tenants (super admin only). */
export async function GET(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const users = await User.find({ role: { $ne: 'super_admin' } })
      .select('name email role phone active createdAt tenantId')
      .populate('tenantId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    return NextResponse.json({
      success: true,
      users: users.map((u: LoginLean) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role || 'staff',
        phone: u.phone || '',
        active: u.active !== false,
        createdAt: u.createdAt,
        tenantId: u.tenantId && typeof u.tenantId === 'object' ? String(u.tenantId._id) : u.tenantId ? String(u.tenantId) : '',
        tenantName: u.tenantId && typeof u.tenantId === 'object' ? u.tenantId.name : '',
        tenantSlug: u.tenantId && typeof u.tenantId === 'object' ? u.tenantId.slug : '',
      })),
    });
  } catch (e) {
    console.error('super logins list error', e);
    return NextResponse.json({ error: 'Failed to load logins' }, { status: 500 });
  }
}

/**
 * Create a company user login.
 * Body: { companyId, username, password, role? }
 * Only username + password + company are required from the UI —
 * the login email is derived as <username>@<company-slug>.login
 * (or used as-is when the username already contains @).
 */
export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  try {
    const body = await request.json();
    const { companyId, username, password, role } = body as {
      companyId?: string; username?: string; password?: string; role?: string;
    };
    if (!companyId || !username || !password) {
      return NextResponse.json({ error: 'Company, username and password are required.' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    const safeRole = (ALLOWED_ROLES as readonly string[]).includes(String(role)) ? String(role) : 'manager';
    await dbConnect();
    const tenant = await Tenant.findById(companyId).lean();
    if (!tenant) return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    if (tenant.status !== 'active') {
      return NextResponse.json({ error: 'Company is suspended. Activate it first.' }, { status: 400 });
    }
    const email = loginEmailFor(String(username), String(tenant.slug));
    const existing = await User.findOne({ email, tenantId: tenant._id });
    if (existing) return NextResponse.json({ error: `Login "${email}" already exists in ${tenant.name}.` }, { status: 400 });
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(username).trim().slice(0, 120),
      email,
      password: hashed,
      role: safeRole,
      isAdmin: safeRole === 'admin' || safeRole === 'owner',
      permissions: [],
      tenantId: tenant._id,
    });
    await writeAudit(String(tenant._id), ctx.user.id, ctx.user.email, 'user.create', 'User', String(user._id), {
      email,
      role: safeRole,
      via: 'super-logins',
    });
    return NextResponse.json(
      { success: true, user: { id: String(user._id), name: user.name, email, role: safeRole, tenantName: tenant.name } },
      { status: 201 },
    );
  } catch (e) {
    console.error('super login create error', e);
    return NextResponse.json({ error: 'Failed to create login.' }, { status: 500 });
  }
}

/** Activate/deactivate or reset password for a company login (super admin only). */
export async function PUT(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  try {
    const body = await request.json();
    const { id, active, password } = body as { id?: string; active?: boolean; password?: string };
    if (!id) return NextResponse.json({ error: 'User id required.' }, { status: 400 });
    await dbConnect();
    const target = await User.findById(id).select('tenantId role isSuperAdmin');
    if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    if (target.isSuperAdmin || target.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot manage platform admins here.' }, { status: 403 });
    }
    const update: Record<string, unknown> = {};
    if (typeof active === 'boolean') update.active = active;
    if (password !== undefined) {
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      const bcrypt = await import('bcryptjs');
      update.password = await bcrypt.hash(String(password), 10);
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }
    await User.findByIdAndUpdate(id, update);
    await writeAudit(target.tenantId ? String(target.tenantId) : null, ctx.user.id, ctx.user.email, 'user.update', 'User', String(id), update);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('super login update error', e);
    return NextResponse.json({ error: 'Failed to update login.' }, { status: 500 });
  }
}
