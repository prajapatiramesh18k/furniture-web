import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'ananya-furniture-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const candidates = await User.find({ email: email.toLowerCase() }).select(
      '+password name email password isAdmin role permissions tenantId isSuperAdmin active',
    );
    const user = candidates.find((u) => u.active !== false) ?? candidates[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    if (user.active === false) {
      return NextResponse.json({ error: 'Account is disabled. Contact support.' }, { status: 403 });
    }

    // Tenant must be active (super admins bypass).
    const isSuperAdmin = user.isSuperAdmin === true || user.role === 'super_admin';
    let tenant: { id: string; name: string; slug: string } | null = null;
    if (!isSuperAdmin && user.tenantId) {
      const Tenant = (await import('@/lib/models/Tenant')).default;
      const t = await Tenant.findById(user.tenantId).lean();
      if (!t || t.status !== 'active') {
        return NextResponse.json({ error: 'Company account is suspended. Contact support.' }, { status: 403 });
      }
      tenant = { id: String(t._id), name: t.name, slug: t.slug };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role || (user.isAdmin ? 'admin' : 'customer'),
        tenantId: user.tenantId ? String(user.tenantId) : null,
        isSuperAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const role = user.role || (user.isAdmin ? 'admin' : 'customer');
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role,
        tenantId: user.tenantId ? String(user.tenantId) : null,
        isSuperAdmin,
        tenant,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
