import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { requireSuperAdmin, writeAudit } from '@/lib/tenant';
import User from '@/lib/models/User';
import Tenant from '@/lib/models/Tenant';

/** Create the first owner/admin for a tenant (or reset owner password). */
export async function POST(request: NextRequest, ctx2: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin(request);
  if ('error' in gate) return gate.error;
  const { ctx } = gate;
  const { id } = await ctx2.params;
  try {
    const body = await request.json();
    const { name, email, password, role } = body as { name?: string; email?: string; password?: string; role?: string };
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, password are required' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    await dbConnect();
    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const existing = await User.findOne({ email: String(email).toLowerCase(), tenantId: id });
    if (existing) return NextResponse.json({ error: 'Email already exists in this company' }, { status: 400 });
    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).slice(0, 120),
      email: String(email).toLowerCase(),
      password: hashed,
      role: role === 'admin' ? 'admin' : 'owner',
      isAdmin: true,
      tenantId: id,
    });
    await writeAudit(null, ctx.user.id, ctx.user.email, 'tenant.owner.create', 'User', String(user._id), {
      tenantId: id,
      email: user.email,
    });
    return NextResponse.json({ success: true, user: { id: String(user._id), email: user.email } }, { status: 201 });
  } catch (e) {
    console.error('super owner create error', e);
    return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 });
  }
}
