import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Tenant from '@/lib/models/Tenant';
import TenantModule, { ADMIN_MODULE_TO_SALES_MODULE } from '@/lib/models/TenantModule';
import AuditLog from '@/lib/models/AuditLog';
import { roleCanAccess, type AdminModule, type StaffRole } from '@/lib/admin-roles';

export interface TenantContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: StaffRole;
    permissions: string[];
    isAdmin: boolean;
    isSuperAdmin: boolean;
    tenantId: string | null;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    gstNumber?: string;
    quotationPrefix: string;
    plan?: string;
  } | null;
  enabledModules: Set<string>;
}

export function isSuperAdminRole(role: string, isSuperAdminFlag?: boolean): boolean {
  return isSuperAdminFlag === true || role === 'super_admin';
}

/** Load session user + tenant. Single source of truth — do not duplicate. */
export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
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

    const superAdmin = isSuperAdminRole(String(user.role || ''), user.isSuperAdmin);
    let tenant: TenantContext['tenant'] = null;
    const tenantId: string | null = user.tenantId ? String(user.tenantId) : null;

    if (!superAdmin) {
      if (!tenantId) return null;
      const t = await Tenant.findById(tenantId).lean();
      if (!t || t.status !== 'active') return null;
      tenant = {
        id: String(t._id),
        name: t.name,
        slug: t.slug,
        status: t.status,
        logo: t.logo || '',
        address: t.address || '',
        phone: t.phone || '',
        email: t.email || '',
        gstNumber: t.gstNumber || '',
        quotationPrefix: t.quotationPrefix || 'Q',
        plan: t.plan,
      };
    } else if (tenantId) {
      // Super admin impersonating / assigned — still load tenant for context if present.
      const t = await Tenant.findById(tenantId).lean();
      if (t) {
        tenant = {
          id: String(t._id),
          name: t.name,
          slug: t.slug,
          status: t.status,
          logo: t.logo || '',
          address: t.address || '',
          phone: t.phone || '',
          email: t.email || '',
          gstNumber: t.gstNumber || '',
          quotationPrefix: t.quotationPrefix || 'Q',
          plan: t.plan,
        };
      }
    }

    let enabledModules = new Set<string>();
    if (tenant) {
      const rows = await TenantModule.find({ tenantId: tenant.id, enabled: true })
        .select('moduleKey')
        .lean();
      enabledModules = new Set(rows.map((r: { moduleKey: string }) => String(r.moduleKey)));
    }

    const { resolveRole } = await import('@/lib/admin-auth');
    const role = superAdmin ? ('admin' as StaffRole) : resolveRole(user);

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
        isAdmin: !!user.isAdmin || role === 'admin' || role === 'owner',
        isSuperAdmin: superAdmin,
        tenantId,
      },
      tenant,
      enabledModules,
    };
  } catch {
    return null;
  }
}

/** Require an authenticated tenant user (optionally gated by admin module + sold module). */
export async function requireTenant(
  request: NextRequest,
  module?: AdminModule,
): Promise<{ ctx: TenantContext } | { error: NextResponse }> {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return { error: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }) };
  }
  if (ctx.user.isSuperAdmin) return { ctx }; // platform admin bypasses tenant gates
  if (!ctx.tenant || !ctx.user.tenantId) {
    return { error: NextResponse.json({ error: 'No active company. Contact support.' }, { status: 403 }) };
  }
  if (module) {
    if (!roleCanAccess(ctx.user.role, ctx.user.permissions, module)) {
      return { error: NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 }) };
    }
    const salesKey = ADMIN_MODULE_TO_SALES_MODULE[module];
    if (salesKey && !ctx.enabledModules.has(salesKey)) {
      return { error: NextResponse.json({ error: `Module ${salesKey} is not enabled for your company.` }, { status: 403 }) };
    }
  }
  return { ctx };
}

/** Require platform super admin. Never grant to tenant owners. */
export async function requireSuperAdmin(
  request: NextRequest,
): Promise<{ ctx: TenantContext } | { error: NextResponse }> {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    return { error: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }) };
  }
  if (!ctx.user.isSuperAdmin) {
    return { error: NextResponse.json({ error: 'Super admin only.' }, { status: 403 }) };
  }
  return { ctx };
}

/** Build a tenant-scoped filter. Never accept tenantId from the client. */
export function tenantFilter(tenantId: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...extra, tenantId: new mongoose.Types.ObjectId(tenantId) };
}

export async function writeAudit(
  tenantId: string | null,
  userId: string | null,
  actorEmail: string,
  action: string,
  entity: string,
  entityId = '',
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await AuditLog.create({
      tenantId: tenantId ? new mongoose.Types.ObjectId(tenantId) : null,
      userId: userId ? new mongoose.Types.ObjectId(userId) : null,
      actorEmail,
      action,
      entity,
      entityId,
      metadata,
    });
  } catch {
    // Audit must never break the request.
  }
}
