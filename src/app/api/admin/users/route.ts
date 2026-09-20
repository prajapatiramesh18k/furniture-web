import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/admin-auth';

/** Customer + staff directory (never exposes password hashes). */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request, 'dashboard');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    // Tenant isolation: non-super-admins only see their own company's users.
    const filter = gate.user.isSuperAdmin && !gate.user.tenantId ? {} : { tenantId: gate.user.tenantId };
    const users = await User.find(filter).select('name email isAdmin role permissions phone active createdAt tenantId').populate('tenantId', 'name').sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({
      users: users.map((u: any) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role || (u.isAdmin ? 'admin' : 'customer'),
        permissions: Array.isArray(u.permissions) ? u.permissions : [],
        phone: u.phone || '',
        active: u.active !== false,
        createdAt: u.createdAt,
        tenantId: u.tenantId && typeof u.tenantId === 'object' ? String(u.tenantId._id) : u.tenantId ? String(u.tenantId) : '',
        tenantName: u.tenantId && typeof u.tenantId === 'object' ? u.tenantId.name : '',
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

/** Update a user's role / permissions / active flag. Admins only. */
export async function PUT(request: NextRequest) {
  const gate = await requireAdmin(request, 'staff');
  if ('error' in gate) return gate.error;
  try {
    await dbConnect();
    const body = await request.json();
    const { id, role, permissions, active, password } = body;
    if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });
    // Cross-tenant guard: target must belong to the caller's tenant (super admin bypasses).
    const target = await User.findById(id).select('tenantId role isSuperAdmin');
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!gate.user.isSuperAdmin) {
      if (String(target.tenantId || '') !== String(gate.user.tenantId || '')) {
        return NextResponse.json({ error: 'Cannot manage users from another company.' }, { status: 403 });
      }
      if (target.isSuperAdmin || target.role === 'super_admin') {
        return NextResponse.json({ error: 'Cannot manage platform admins.' }, { status: 403 });
      }
    }
    const update: Record<string, unknown> = {};
    if (role && ['owner', 'admin', 'manager', 'staff', 'customer'].includes(role)) {
      // Only owners/admins can promote to elevated roles.
      if ((role === 'owner' || role === 'admin') && gate.user.role !== 'owner' && gate.user.role !== 'admin' && !gate.user.isSuperAdmin) {
        return NextResponse.json({ error: 'Only owners/admins can assign elevated roles.' }, { status: 403 });
      }
      update.role = role;
      update.isAdmin = role === 'admin' || role === 'owner';
    }
    if (Array.isArray(permissions)) update.permissions = permissions;
    if (typeof active === 'boolean') update.active = active;
    if (password !== undefined) {
      // Password resets stay owner/admin-only (managers never reach this gate for staff module).
      if (gate.user.role !== 'owner' && gate.user.role !== 'admin' && !gate.user.isSuperAdmin) {
        return NextResponse.json({ error: 'Only owners/admins can reset passwords.' }, { status: 403 });
      }
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const bcrypt = await import('bcryptjs');
      update.password = await bcrypt.hash(String(password), 10);
    }
    // Never allow demoting yourself via this endpoint
    if (id === gate.user.id && update.role && update.role !== 'admin' && update.role !== 'owner') {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
    }
    await User.findByIdAndUpdate(id, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/** Create a user inside the caller's company (owner/admin only). */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request, 'staff');
  if ('error' in gate) return gate.error;
  if (gate.user.role !== 'owner' && gate.user.role !== 'admin' && !gate.user.isSuperAdmin) {
    return NextResponse.json({ error: 'Only owners/admins can create users.' }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, role, permissions, phone } = body as {
      name?: string; email?: string; password?: string; role?: string; permissions?: string[]; phone?: string;
    };
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, password are required' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const safeRole = ['owner', 'admin', 'manager', 'staff', 'customer'].includes(String(role)) ? String(role) : 'staff';
    if ((safeRole === 'owner' || safeRole === 'admin') && gate.user.role !== 'owner' && !gate.user.isSuperAdmin) {
      return NextResponse.json({ error: 'Only owners can create owners/admins.' }, { status: 403 });
    }
    const tenantId = gate.user.tenantId;
    if (!tenantId && !gate.user.isSuperAdmin) {
      return NextResponse.json({ error: 'No company context.' }, { status: 400 });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase(), tenantId });
    if (existing) return NextResponse.json({ error: 'Email already exists in this company' }, { status: 400 });
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).slice(0, 120),
      email: String(email).toLowerCase(),
      password: hashed,
      role: safeRole,
      isAdmin: safeRole === 'admin' || safeRole === 'owner',
      permissions: Array.isArray(permissions) ? permissions.map(String).slice(0, 50) : [],
      phone: String(phone || ''),
      tenantId,
    });
    const { writeAudit } = await import('@/lib/tenant');
    await writeAudit(tenantId, gate.user.id, gate.user.email, 'user.create', 'User', String(user._id), {
      email: user.email,
      role: safeRole,
    });
    return NextResponse.json({ success: true, user: { id: String(user._id), email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error('admin user create error', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
