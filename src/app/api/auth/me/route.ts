import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ user: null });
  }

  try {
    await dbConnect();
    const user = await User.findById(decoded.userId).select(
      'name email isAdmin role permissions tenantId isSuperAdmin',
    );

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const isSuperAdmin = user.isSuperAdmin === true || user.role === 'super_admin';
    let tenant: { id: string; name: string; slug: string; logo?: string } | null = null;
    let enabledModules: string[] = [];
    if (user.tenantId) {
      const Tenant = (await import('@/lib/models/Tenant')).default;
      const TenantModule = (await import('@/lib/models/TenantModule')).default;
      const t = await Tenant.findById(user.tenantId).lean();
      if (t && (isSuperAdmin || t.status === 'active')) {
        tenant = { id: String(t._id), name: t.name, slug: t.slug, logo: t.logo || '' };
        const rows = await TenantModule.find({ tenantId: t._id, enabled: true }).select('moduleKey').lean();
        enabledModules = rows.map((r: { moduleKey: string }) => String(r.moduleKey));
      } else if (!isSuperAdmin) {
        return NextResponse.json({ user: null });
      }
    } else if (!isSuperAdmin) {
      return NextResponse.json({ user: null });
    }

    const role = user.role || (user.isAdmin ? 'admin' : 'customer');
    // Only return what's needed for display - no user ID exposed
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
        tenantId: user.tenantId ? String(user.tenantId) : null,
        isSuperAdmin,
        tenant,
        enabledModules,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
