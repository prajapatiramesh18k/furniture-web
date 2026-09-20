import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import type { AdminModule, StaffRole } from '@/lib/admin-roles';
import { roleCanAccess } from '@/lib/admin-roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: StaffRole;
  permissions: string[];
  tenantId: string | null;
  isSuperAdmin: boolean;
}

export function resolveRole(user: { isAdmin?: boolean; role?: string; isSuperAdmin?: boolean }): StaffRole {
  if (user.isSuperAdmin || user.role === 'super_admin') return 'admin';
  if (
    user.role === 'owner' ||
    user.role === 'admin' ||
    user.role === 'manager' ||
    user.role === 'staff' ||
    user.role === 'customer'
  ) {
    // Legacy isAdmin flag always implies at least admin-equivalent portal access.
    if (user.isAdmin && user.role === 'customer') return 'admin';
    return user.role;
  }
  return user.isAdmin ? 'admin' : 'customer';
}

/** Verify the request cookie, load the user, and return null + response on failure. */
export async function getSessionUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  try {
    await dbConnect();
    const user = await User.findById(decoded.userId).select(
      'name email isAdmin role permissions tenantId isSuperAdmin active',
    );
    if (!user || user.active === false) return null;
    const isSuperAdmin = user.isSuperAdmin === true || user.role === 'super_admin';
    // Enforce tenant active status for tenant users (super admins bypass).
    if (!isSuperAdmin && user.tenantId) {
      const Tenant = (await import('@/lib/models/Tenant')).default;
      const t = await Tenant.findById(user.tenantId).select('status').lean();
      if (!t || t.status !== 'active') return null;
    }
    const role = resolveRole(user);
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin || role === 'owner' || role === 'admin',
      role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      tenantId: user.tenantId ? String(user.tenantId) : null,
      isSuperAdmin,
    };
  } catch {
    return null;
  }
}

/** Guard for admin API routes. Returns the user or an error response. */
export async function requireAdmin(
  request: NextRequest,
  module: AdminModule = 'dashboard'
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }) };
  }
  if (!roleCanAccess(user.role, user.permissions, module)) {
    return { error: NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 }) };
  }
  // Enforce sold-module gating per tenant (super admin bypasses).
  if (!user.isSuperAdmin && user.tenantId) {
    try {
      const { ADMIN_MODULE_TO_SALES_MODULE } = await import('@/lib/models/TenantModule');
      const salesKey = ADMIN_MODULE_TO_SALES_MODULE[module];
      if (salesKey) {
        const TenantModule = (await import('@/lib/models/TenantModule')).default;
        await dbConnect();
        const row = await TenantModule.findOne({ tenantId: user.tenantId, moduleKey: salesKey })
          .select('enabled')
          .lean();
        if (!row || row.enabled !== true) {
          return {
            error: NextResponse.json(
              { error: `Module ${salesKey} is not enabled for your company.` },
              { status: 403 },
            ),
          };
        }
      }
    } catch {
      // Fail closed on gating errors.
      return { error: NextResponse.json({ error: 'Module access check failed.' }, { status: 403 }) };
    }
  }
  return { user };
}
