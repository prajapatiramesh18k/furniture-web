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
}

export function resolveRole(user: { isAdmin?: boolean; role?: string }): StaffRole {
  if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff' || user.role === 'customer') {
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
    const user = await User.findById(decoded.userId).select('name email isAdmin role permissions');
    if (!user) return null;
    const role = resolveRole(user);
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin,
      role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
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
  return { user };
}
