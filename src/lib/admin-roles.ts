/** Client-safe role/module constants (no server imports — safe for 'use client' bundles). */

export type StaffRole = 'owner' | 'admin' | 'manager' | 'staff' | 'customer';

/** Modules that can be gated per-role. */
export const ADMIN_MODULES = [
  'dashboard',
  'products',
  'categories',
  'orders',
  'customers',
  'inventory',
  'collections',
  'offers',
  'payments',
  'shipping',
  'reviews',
  'reports',
  'quotations',
  'team',
  'staff',
  'settings',
  'projects',
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number];

/** Default modules per role. Explicit `permissions` on a user override these. */
export const ROLE_DEFAULT_MODULES: Record<StaffRole, AdminModule[] | '*'> = {
  owner: '*',
  admin: '*',
  // Manager runs the shop floor: quotations + attendance (team) included by default.
  // Sold-module gating still applies on top (e.g. no QUOTATION purchase => no quotations).
  manager: ['dashboard', 'products', 'categories', 'orders', 'customers', 'quotations', 'projects', 'team', 'inventory', 'collections', 'offers', 'payments', 'shipping', 'reviews', 'reports'],
  staff: ['dashboard', 'orders', 'customers', 'reviews'],
  customer: [],
};

/** Client-safe permission check (mirrored on the server in admin-auth.ts). */
export function roleCanAccess(
  role: string,
  permissions: string[] | undefined,
  module: AdminModule
): boolean {
  if (role === 'admin' || role === 'owner') return true;
  if (permissions && permissions.length > 0) {
    return module === 'dashboard' || permissions.includes(module);
  }
  const allowed = ROLE_DEFAULT_MODULES[role as StaffRole] ?? [];
  if (allowed === '*') return true;
  return module === 'dashboard' || (allowed as AdminModule[]).includes(module);
}
