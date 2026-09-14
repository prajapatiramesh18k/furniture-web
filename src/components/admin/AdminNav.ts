'use client';

import type { AdminModule } from '@/lib/admin-roles';
import { roleCanAccess } from '@/lib/admin-roles';

export interface NavChild {
  label: string;
  href: string;
  module: AdminModule;
}

export interface NavEntry {
  label: string;
  href: string;
  icon: string;
  module: AdminModule;
  section?: string;
  badgeKey?: 'pendingReviews' | 'pendingOrders' | 'products';
  children?: NavChild[];
  /** If set, only these roles can see the entry (admins see all entries without a roles gate). */
  roles?: string[];
}

export const ADMIN_NAV: NavEntry[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'fa-gauge-high', module: 'dashboard', section: 'Overview', roles: ['admin', 'manager', 'staff'] },
  { label: 'Orders', href: '/admin/orders', icon: 'fa-cart-shopping', module: 'orders', badgeKey: 'pendingOrders' },
  { label: 'Products', href: '/admin/products', icon: 'fa-couch', module: 'products', badgeKey: 'products' },
  { label: 'Categories', href: '/admin/categories', icon: 'fa-layer-group', module: 'categories' },
  { label: 'Customers', href: '/admin/customers', icon: 'fa-users', module: 'customers', section: 'Sales' },
  {
    label: 'Quotations', href: '/admin/quotations', icon: 'fa-file-invoice', module: 'quotations',
    children: [
      { label: 'New Quotation', href: '/admin/quotations/new', module: 'quotations' },
      { label: 'Saved Quotations', href: '/admin/quotations', module: 'quotations' },
    ],
  },
  { label: 'Furniture Collections', href: '/admin/collections', icon: 'fa-swatchbook', module: 'collections' },
  { label: 'Offers & Discounts', href: '/admin/offers', icon: 'fa-tags', module: 'offers' },
  { label: 'Payments', href: '/admin/payments', icon: 'fa-credit-card', module: 'payments' },
  { label: 'Shipping & Delivery', href: '/admin/shipping', icon: 'fa-truck-fast', module: 'shipping' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'fa-boxes-stacked', module: 'inventory', section: 'Catalog' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'fa-star', module: 'reviews', badgeKey: 'pendingReviews' },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: 'fa-chart-line', module: 'reports', section: 'Insights' },
  { label: 'Staff / Users', href: '/admin/staff', icon: 'fa-user-tie', module: 'staff' },
  { label: 'Employee Management', href: '/admin/team/employees', icon: 'fa-clipboard-user', module: 'team', section: 'Team',
    children: [
      { label: 'Employee List', href: '/admin/team/employees', module: 'team' },
      { label: 'Live Attendance', href: '/admin/team/live-attendance', module: 'team' },
      { label: 'Job Sites', href: '/admin/team/sites', module: 'team' },
      { label: 'Payroll & Settlement', href: '/admin/team/payroll', module: 'team' },
    ],
  },
  { label: 'Notifications', href: '/admin/notifications', icon: 'fa-bell', module: 'dashboard', section: 'System', roles: ['admin', 'manager', 'staff'] },
  { label: 'Settings', href: '/admin/settings', icon: 'fa-gear', module: 'settings' },
  // Customer account links — the customer's custom menu inside the same shell.
  { label: 'My Orders', href: '/account', icon: 'fa-box', module: 'dashboard', section: 'My Account', roles: ['customer'] },
  { label: 'Wishlist', href: '/wishlist', icon: 'fa-heart', module: 'dashboard', roles: ['customer'] },
  { label: 'Cart', href: '/cart', icon: 'fa-shopping-cart', module: 'dashboard', roles: ['customer'] },
  { label: 'Help & Support', href: '/contact', icon: 'fa-headset', module: 'dashboard', roles: ['customer'] },
  { label: 'View Website', href: '/', icon: 'fa-globe', module: 'dashboard', roles: ['customer'] },
];

export function filterNav(role: string, permissions: string[]): NavEntry[] {
  const inRole = (n: NavEntry) => !n.roles || n.roles.includes(role);
  if (role === 'admin') return ADMIN_NAV.filter(inRole);
  // Dashboard is the one common screen — always visible; other items follow permissions.
  return ADMIN_NAV.filter((n) => inRole(n) && roleCanAccess(role, permissions, n.module));
}

/** Route prefix → module map for the shell's per-page gate (same map as the server). */
export const ROUTE_MODULES: { prefix: string; module: AdminModule }[] = [
  { prefix: '/admin/dashboard', module: 'dashboard' },
  { prefix: '/admin/products', module: 'products' },
  { prefix: '/admin/categories', module: 'categories' },
  { prefix: '/admin/orders', module: 'orders' },
  { prefix: '/admin/customers', module: 'customers' },
  { prefix: '/admin/quotations', module: 'quotations' },
  { prefix: '/admin/collections', module: 'collections' },
  { prefix: '/admin/offers', module: 'offers' },
  { prefix: '/admin/payments', module: 'payments' },
  { prefix: '/admin/shipping', module: 'shipping' },
  { prefix: '/admin/inventory', module: 'inventory' },
  { prefix: '/admin/reviews', module: 'reviews' },
  { prefix: '/admin/reports', module: 'reports' },
  { prefix: '/admin/team', module: 'team' },
  { prefix: '/admin/staff', module: 'staff' },
  { prefix: '/admin/gallery', module: 'collections' },
  { prefix: '/admin/notifications', module: 'dashboard' },
  { prefix: '/admin/settings', module: 'settings' },
];

export function moduleForPath(pathname: string): AdminModule {
  const hit = ROUTE_MODULES.filter((r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return hit ? hit.module : 'dashboard';
}
