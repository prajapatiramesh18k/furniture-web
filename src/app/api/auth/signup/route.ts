import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Public signups belong to the storefront (default) tenant.
    // Tenant members/staff are created via /api/admin/users or super-admin onboarding instead.
    const Tenant = (await import('@/lib/models/Tenant')).default;
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'ananya-house-of-furniture';
    let defaultTenant = await Tenant.findOne({ slug: defaultSlug });
    if (!defaultTenant) defaultTenant = await Tenant.findOne({ status: 'active' }).sort({ createdAt: 1 });
    const tenantId = defaultTenant ? defaultTenant._id : null;

    const existingUser = tenantId
      ? await User.findOne({ email: email.toLowerCase(), tenantId })
      : await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // First user of the default tenant becomes its owner; everyone else is a customer.
    const userCount = tenantId ? await User.countDocuments({ tenantId }) : await User.countDocuments();
    const isFirst = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: isFirst,
      role: isFirst ? 'owner' : 'customer',
      tenantId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        tenantId: user.tenantId ? String(user.tenantId) : null,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
