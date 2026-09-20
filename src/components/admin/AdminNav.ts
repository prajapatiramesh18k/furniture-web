'use client';

import type { AdminModule } from '@/lib/admin-roles';
import { roleCanAccess } from '@/lib/admin-roles';

/** Client-safe mirror of the server sales-module map (see src/lib/models/TenantModule.ts). */
const ADMIN_MODULE_TO_SALES_MODULE: Record<string, string | null> = {
  dashboard: null,
  quotations: 'QUOTATION',
  projects: null,
  team: 'EMPLOYEE_MANAGEMENT',
  staff: null,
  customers: null,
  settings: null,
  products: 'INVENTORY',
  inventory: 'INVENTORY',
  categories: 'INVENTORY',
  collections: 'INVENTORY',
  orders: 'INVENTORY',
  offers: 'INVENTORY',
  payments: 'ACCOUNTING',
  reports: 'ACCOUNTING',
  shipping: 'INVENTORY',
  reviews: 'INVENTORY',
};

/** Admin modules that make up the storefront Catalog.
 * These are exclusive to the default (Ananya House of Furniture) tenant —
 * other company logins never see them, even if they purchased INVENTORY. */
export const CATALOG_ADMIN_MODULES: ReadonlySet<string> = new Set([
  'products',
  'categories',
  'inventory',
  'collections',
  'orders',
  'offers',
  'shipping',
  'reviews',
]);

/** Slug of the platform owner tenant that owns the Catalog. */
export const DEFAULT_TENANT_SLUG = 'ananya-house-of-furniture';

export function isDefaultTenant(tenantSlug?: string | null): boolean {
  return String(tenantSlug || '').trim().toLowerCase() === DEFAULT_TENANT_SLUG;
}

export interface NavChild {
  label: string;
  href: string;
  module: AdminModule;
  /** If set, only these roles see this child (e.g. Job Sites / Payroll = owner+admin). */
  roles?: string[];
}

export interface NavEntry {
  label: string;
  href: string;
  icon: string;
  module: AdminModule;
  section?: string;
  badgeKey?: 'pendingReviews' | 'pendingOrders' | 'pendingQuotations' | 'pendingLeads' | 'products';
  children?: NavChild[];
  /** If set, only these roles can see the entry (admins see all entries without a roles gate). */
  roles?: string[];
}

export const ADMIN_NAV: NavEntry[] = [
  // Overview
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'fa-gauge-high', module: 'dashboard', section: 'Overview', roles: ['owner', 'admin', 'manager', 'staff'] },
  // Sales — Lead → Customer → Visit → Quotation (+ shop orders)
  { label: 'Leads', href: '/admin/leads', icon: 'fa-magnet', module: 'customers', section: 'Sales', badgeKey: 'pendingLeads' },
  { label: 'Customers', href: '/admin/customers', icon: 'fa-users', module: 'customers' },
  { label: 'Site Visits', href: '/admin/site-visits', icon: 'fa-calendar-check', module: 'customers' },
  {
    label: 'Quotations', href: '/admin/quotations', icon: 'fa-file-invoice', module: 'quotations', badgeKey: 'pendingQuotations',
    children: [
      { label: 'New Quotation', href: '/admin/quotations/new', module: 'quotations' },
      { label: 'Saved Quotations', href: '/admin/quotations', module: 'quotations' },
    ],
  },
  { label: 'Orders', href: '/admin/orders', icon: 'fa-cart-shopping', module: 'orders', badgeKey: 'pendingOrders' },
  // Projects — execution workspace (tasks / progress live inside each project too)
  {
    label: 'Projects', href: '/admin/projects', icon: 'fa-briefcase', module: 'projects', section: 'Projects',
    children: [
      { label: 'All Projects', href: '/admin/projects', module: 'projects' },
      { label: 'Tasks', href: '/admin/tasks', module: 'projects' },
      { label: 'Site Progress', href: '/admin/progress', module: 'projects' },
    ],
  },
  // Design — departments (Interior, Civil, Paint…) are types INSIDE these modules, not menus.
  // Materials
  { label: 'Suppliers', href: '/admin/vendors', icon: 'fa-handshake', module: 'projects', section: 'Materials' },
  // Workforce
  { label: 'Workforce', href: '/admin/team/employees', icon: 'fa-helmet-safety', module: 'team', section: 'Workforce',
    children: [
      { label: 'Employees', href: '/admin/team/employees', module: 'team' },
      { label: 'Live Attendance', href: '/admin/team/live-attendance', module: 'team' },
      // Manager is shop-floor: attendance + quotations only. Sites & money stay owner/admin.
      { label: 'Job Sites', href: '/admin/team/sites', module: 'team', roles: ['owner', 'admin'] },
      { label: 'Payroll & Settlement', href: '/admin/team/payroll', module: 'team', roles: ['owner', 'admin'] },
    ],
  },
  // Finance — project money (shop order payments stay under Catalog as Payments)
  { label: 'Expenses', href: '/admin/expenses', icon: 'fa-money-bill-wave', module: 'projects', section: 'Finance' },
  { label: 'Invoices', href: '/admin/invoices', icon: 'fa-file-invoice-dollar', module: 'projects' },
  { label: 'Project Payments', href: '/admin/project-payments', icon: 'fa-hand-holding-dollar', module: 'projects' },
  { label: 'Profitability', href: '/admin/profitability', icon: 'fa-chart-pie', module: 'projects' },
  // Catalog — shop / storefront modules
  { label: 'Products', href: '/admin/products', icon: 'fa-couch', module: 'products', section: 'Catalog', badgeKey: 'products' },
  { label: 'Categories', href: '/admin/categories', icon: 'fa-layer-group', module: 'categories' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'fa-boxes-stacked', module: 'inventory' },
  {
    label: 'Gallery', href: '/admin/gallery', icon: 'fa-images', module: 'collections',
    children: [
      { label: 'All Categories', href: '/admin/gallery', module: 'collections' },
      { label: 'Pooja Unit', href: '/admin/gallery/pooja-unit', module: 'collections' },
      { label: 'TV Unit', href: '/admin/gallery/tv-unit', module: 'collections' },
      { label: 'Bed Panelling', href: '/admin/gallery/bed-panelling', module: 'collections' },
      { label: 'Dining Table', href: '/admin/gallery/dining-table', module: 'collections' },
      { label: 'Bar Unit', href: '/admin/gallery/bar-unit', module: 'collections' },
      { label: 'Almirah', href: '/admin/gallery/almirah', module: 'collections' },
      { label: 'Crockery Unit', href: '/admin/gallery/crockery-unit', module: 'collections' },
      { label: 'Shoe Rack', href: '/admin/gallery/shoe-rack', module: 'collections' },
      { label: 'Ceiling', href: '/admin/gallery/ceiling', module: 'collections' },
      { label: 'Door', href: '/admin/gallery/door', module: 'collections' },
      { label: 'Office', href: '/admin/gallery/office', module: 'collections' },
      { label: 'Living Room', href: '/admin/gallery/living-room', module: 'collections' },
      { label: 'Bedroom', href: '/admin/gallery/bedroom', module: 'collections' },
      { label: 'Dining Room', href: '/admin/gallery/dining-room', module: 'collections' },
      { label: 'Kitchen', href: '/admin/gallery/kitchen', module: 'collections' },
      { label: 'Entryway', href: '/admin/gallery/entryway', module: 'collections' },
      { label: 'Kids Room', href: '/admin/gallery/kids-room', module: 'collections' },
    ],
  },
  { label: 'Furniture Collections', href: '/admin/collections', icon: 'fa-swatchbook', module: 'collections' },
  { label: 'Offers & Discounts', href: '/admin/offers', icon: 'fa-tags', module: 'offers' },
  { label: 'Payments', href: '/admin/payments', icon: 'fa-credit-card', module: 'payments' },
  { label: 'Shipping & Delivery', href: '/admin/shipping', icon: 'fa-truck-fast', module: 'shipping' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'fa-star', module: 'reviews', badgeKey: 'pendingReviews' },
  // Insights
  { label: 'Reports & Analytics', href: '/admin/reports', icon: 'fa-chart-line', module: 'reports', section: 'Insights' },
  // Team
  { label: 'Staff / Users', href: '/admin/staff', icon: 'fa-user-tie', module: 'staff', section: 'Team' },
  { label: 'User Logins', href: '/admin/user-logins', icon: 'fa-user-lock', module: 'staff' },
  // System
  { label: 'Notifications', href: '/admin/notifications', icon: 'fa-bell', module: 'dashboard', section: 'System', roles: ['owner', 'admin', 'manager', 'staff'] },
  { label: 'Settings', href: '/admin/settings', icon: 'fa-gear', module: 'settings' },
  // Platform administration — visible in the left sidebar ONLY for super admins.
  // Same fixed navbar + fixed sidebar shell as the tenant portal (no layout switch).
  // Group style matches Quotations / Employee Management: click a child to call /super.
  {
    label: 'Super Admin', href: '/super', icon: 'fa-crown', module: 'dashboard', section: 'Platform', roles: ['super_admin'],
    children: [
      { label: 'Companies', href: '/super', module: 'dashboard' },
      { label: 'Onboard Company', href: '/super#onboard', module: 'dashboard' },
      { label: 'User Logins', href: '/super/logins', module: 'dashboard' },
    ],
  },
  // Customer account links — the customer's custom menu inside the same shell.
  { label: 'My Orders', href: '/account', icon: 'fa-box', module: 'dashboard', section: 'My Account', roles: ['customer'] },
  { label: 'Wishlist', href: '/wishlist', icon: 'fa-heart', module: 'dashboard', roles: ['customer'] },
  { label: 'Cart', href: '/cart', icon: 'fa-shopping-cart', module: 'dashboard', roles: ['customer'] },
  { label: 'Help & Support', href: '/contact', icon: 'fa-headset', module: 'dashboard', roles: ['customer'] },
  { label: 'View Website', href: '/', icon: 'fa-globe', module: 'dashboard', roles: ['customer', 'super_admin'] },
];

export function filterNav(role: string, permissions: string[], enabledModules?: string[] | Set<string>, tenantSlug?: string | null): NavEntry[] {
  const normalized = String(role || '').trim().toLowerCase();
  // Super admins get ONLY the Platform section (Super Admin + View Website).
  // Tenant menus are hidden — they have no tenant context and their APIs would fail.
  if (normalized === 'super_admin') {
    return ADMIN_NAV.filter((n) => (n.roles || []).map((r) => String(r).toLowerCase()).includes('super_admin'));
  }
  // Catalog is exclusive to the default (Ananya House of Furniture) tenant.
  // Other company logins never see it.
  const catalogAllowed = isDefaultTenant(tenantSlug);
  const notCatalogForOthers = (n: NavEntry): boolean => {
    if (catalogAllowed) return true;
    if (CATALOG_ADMIN_MODULES.has(String(n.module))) return false;
    if ((n.children || []).length > 0 && (n.children || []).every((c) => CATALOG_ADMIN_MODULES.has(String(c.module)))) return false;
    return true;
  };
  const inRole = (n: NavEntry) => !n.roles || n.roles.includes(normalized) || n.roles.includes(role);
  const childVisible = (c: NavChild) => !c.roles || c.roles.includes(normalized) || c.roles.includes(role);
  const withChildren = (list: NavEntry[]): NavEntry[] =>
    list.map((n) =>
      n.children ? { ...n, children: n.children.filter(childVisible) } : n,
    ).filter((n) => !n.children || n.children.length > 0);
  const enabled = enabledModules ? new Set(enabledModules) : null;
  const moduleEnabled = (n: NavEntry): boolean => {
    if (!enabled) return true;
    const salesKey = ADMIN_MODULE_TO_SALES_MODULE[n.module];
    if (!salesKey) return true;
    return enabled.has(salesKey);
  };
  // Owner sees everything in their company (subject to purchased modules), like admin.
  // Child-level role gates still apply (e.g. manager never sees Job Sites / Payroll).
  // Catalog entries are additionally restricted to the default tenant.
  if (role === 'admin' || role === 'owner') return withChildren(ADMIN_NAV.filter((n) => inRole(n) && moduleEnabled(n) && notCatalogForOthers(n)));
  // Dashboard is the one common screen — always visible; other items follow permissions.
  return withChildren(ADMIN_NAV.filter((n) => inRole(n) && moduleEnabled(n) && notCatalogForOthers(n) && roleCanAccess(role, permissions, n.module)));
}

/** Route prefix → module map for the shell's per-page gate (same map as the server). */
export const ROUTE_MODULES: { prefix: string; module: AdminModule }[] = [
  { prefix: '/admin/dashboard', module: 'dashboard' },
  { prefix: '/admin/products', module: 'products' },
  { prefix: '/admin/categories', module: 'categories' },
  { prefix: '/admin/orders', module: 'orders' },
  { prefix: '/admin/customers', module: 'customers' },
  { prefix: '/admin/leads', module: 'customers' },
  { prefix: '/admin/quotations', module: 'quotations' },
  { prefix: '/admin/collections', module: 'collections' },
  { prefix: '/admin/offers', module: 'offers' },
  { prefix: '/admin/payments', module: 'payments' },
  { prefix: '/admin/shipping', module: 'shipping' },
  { prefix: '/admin/inventory', module: 'inventory' },
  { prefix: '/admin/reviews', module: 'reviews' },
  { prefix: '/admin/reports', module: 'reports' },
  { prefix: '/admin/team', module: 'team' },
  { prefix: '/admin/projects', module: 'projects' },
  { prefix: '/admin/tasks', module: 'projects' },
  { prefix: '/admin/progress', module: 'projects' },
  { prefix: '/admin/vendors', module: 'projects' },
  { prefix: '/admin/expenses', module: 'projects' },
  { prefix: '/admin/invoices', module: 'projects' },
  { prefix: '/admin/project-payments', module: 'projects' },
  { prefix: '/admin/profitability', module: 'projects' },
  { prefix: '/admin/site-visits', module: 'customers' },
  { prefix: '/admin/staff', module: 'staff' },
  { prefix: '/admin/user-logins', module: 'staff' },
  { prefix: '/admin/gallery', module: 'collections' },
  { prefix: '/admin/notifications', module: 'dashboard' },
  { prefix: '/admin/settings', module: 'settings' },
];

export function moduleForPath(pathname: string): AdminModule {
  const hit = ROUTE_MODULES.filter((r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return hit ? hit.module : 'dashboard';
}
