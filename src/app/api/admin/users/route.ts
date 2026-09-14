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
    const users = await User.find().select('name email isAdmin role phone active createdAt').sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({
      users: users.map((u: any) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role || (u.isAdmin ? 'admin' : 'customer'),
        phone: u.phone || '',
        active: u.active !== false,
        createdAt: u.createdAt,
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
    const { id, role, permissions, active } = body;
    if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });
    const update: Record<string, unknown> = {};
    if (role && ['admin', 'manager', 'staff', 'customer'].includes(role)) {
      update.role = role;
      update.isAdmin = role === 'admin';
    }
    if (Array.isArray(permissions)) update.permissions = permissions;
    if (typeof active === 'boolean') update.active = active;
    // Never allow demoting yourself via this endpoint
    if (id === gate.user.id && update.role && update.role !== 'admin') {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
    }
    await User.findByIdAndUpdate(id, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
