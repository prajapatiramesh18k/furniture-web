'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header, { type SessionUser } from './Header';
import { moduleForPath, CATALOG_ADMIN_MODULES, isDefaultTenant } from './AdminNav';
import { roleCanAccess } from '@/lib/admin-roles';

/** Client-safe mirror of the server sales-module map. */
const SALES_MODULE_FOR_ADMIN: Record<string, string | null> = {
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

const TITLES: Record<string, { title: string; trail: { label: string; href?: string }[] }> = {
  '/admin/dashboard': { title: 'Dashboard', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Dashboard' }] },
  '/admin/products': { title: 'Products', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Products' }] },
  '/admin/orders': { title: 'Orders', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Orders' }] },
  '/admin/categories': { title: 'Categories', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Categories' }] },
  '/admin/customers': { title: 'Customers', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Customers' }] },
  '/admin/leads': { title: 'Leads', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Sales' }, { label: 'Leads' }] },
  '/admin/inventory': { title: 'Inventory', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Inventory' }] },
  '/admin/collections': { title: 'Furniture Collections', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Collections' }] },
  '/admin/gallery': { title: 'Design Gallery', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Gallery' }] },
  '/admin/offers': { title: 'Offers & Discounts', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Offers' }] },
  '/admin/payments': { title: 'Payments', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Payments' }] },
  '/admin/shipping': { title: 'Shipping & Delivery', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Shipping' }] },
  '/admin/reviews': { title: 'Reviews', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Reviews' }] },
  '/admin/reports': { title: 'Reports & Analytics', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Reports' }] },
  '/admin/staff': { title: 'Staff / Users', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Staff' }] },
  '/admin/settings': { title: 'Settings', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Settings' }] },
  '/admin/notifications': { title: 'Notifications', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Notifications' }] },
  '/admin/quotations': { title: 'Saved Quotations', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Quotations' }, { label: 'Saved' }] },
  '/admin/quotations/new': { title: 'New Quotation', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Quotations' }, { label: 'New' }] },
  '/admin/team': { title: 'Employee Management', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Employee Management' }] },
  '/admin/team/employees': { title: 'Employee List', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Employee Management' }, { label: 'Employee List' }] },
  '/admin/team/live-attendance': { title: 'Live Attendance', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Employee Management' }, { label: 'Live Attendance' }] },
  '/admin/team/sites': { title: 'Job Sites', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Employee Management' }, { label: 'Job Sites' }] },
  '/admin/team/payroll': { title: 'Payroll & Settlement', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Employee Management' }, { label: 'Payroll' }] },
  '/admin/projects': { title: 'Projects', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Projects' }, { label: 'All Projects' }] },
  '/admin/tasks': { title: 'Tasks', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Projects' }, { label: 'Tasks' }] },
  '/admin/progress': { title: 'Site Progress', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Projects' }, { label: 'Site Progress' }] },
  '/admin/measurements': { title: 'Measurements', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Design' }, { label: 'Measurements' }] },
  '/admin/expenses': { title: 'Expenses', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Finance' }, { label: 'Expenses' }] },
  '/admin/invoices': { title: 'Invoices', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Finance' }, { label: 'Invoices' }] },
  '/admin/project-payments': { title: 'Project Payments', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Finance' }, { label: 'Payments' }] },
  '/admin/profitability': { title: 'Profitability', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Finance' }, { label: 'Profitability' }] },
  '/admin/site-visits': { title: 'Site Visits', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Sales' }, { label: 'Site Visits' }] },
  '/admin/vendors': { title: 'Suppliers', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Materials' }, { label: 'Suppliers' }] },
  '/super': { title: 'Super Admin', trail: [{ label: 'Platform', href: '/super' }, { label: 'Companies' }] },
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authState, setAuthState] = useState<'ok' | 'denied'>('ok');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const [counts, setCounts] = useState<{ pendingReviews?: number; pendingOrders?: number; pendingQuotations?: number; pendingLeads?: number; products?: number }>({});
  const [tenantName, setTenantName] = useState<string>('');
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.status === 401) {
        setAuthState('denied');
        router.replace('/login?next=' + encodeURIComponent(pathname || '/admin/dashboard'));
        return;
      }
      const data = await res.json();
      // /admin/* is for staff roles only (owner/admin/manager/staff or explicit permission).
      // Customers get their own custom page at /account; outsiders get Access Denied.
      // Menu items and pages are further filtered by role/permissions below and on the server.
      if (!data.user) {
        setAuthState('denied');
        return;
      }
      const role = String(data.user.role || (data.user.isAdmin ? 'admin' : 'customer')).toLowerCase();
      const perms: string[] = Array.isArray(data.user.permissions) ? data.user.permissions : [];
      if (role === 'customer' && perms.length === 0) {
        setAuthState('denied');
        return;
      }
      if (!data.user.isSuperAdmin && !data.user.tenant) {
        setAuthState('denied');
        return;
      }
      setTenantName(data.user?.tenant?.name || '');
      setTenantSlug(data.user?.tenant?.slug || null);
      setEnabledModules(Array.isArray(data.user?.enabledModules) ? data.user.enabledModules : []);
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || (data.user.isAdmin ? 'admin' : 'staff'),
        permissions: data.user.permissions || [],
        tenantName: data.user?.tenant?.name || '',
        isSuperAdmin: !!data.user.isSuperAdmin,
      });
      setAuthState('ok');
    } catch {
      setAuthState('denied');
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Badge counts from the lightweight badges API (never blocks the shell).
  // Super admins have no tenant — skip tenant badges.
  useEffect(() => {
    if (authState !== 'ok') return;
    if (user?.isSuperAdmin) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/badges', { cache: 'no-store' });
        if (!res.ok) return;
        const s = await res.json();
        setCounts({
          pendingReviews: s.pendingReviews,
          pendingOrders: s.pendingOrders,
          pendingQuotations: s.pendingQuotations,
          pendingLeads: s.pendingLeads,
          products: s.products,
        });
      } catch {}
    })();
  }, [authState, user?.isSuperAdmin]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const meta = useMemo(() => {
    const exact = TITLES[pathname];
    if (exact) return exact;
    const base = pathname.split('/').slice(0, 3).join('/');
    return TITLES[base] || { title: 'Admin', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Admin' }] };
  }, [pathname]);

  const notifications = useMemo(() => {
    const list: { icon: string; color: string; bg: string; title: string; sub: string }[] = [];
    if (counts.pendingOrders) list.push({ icon: 'fa-cart-shopping', color: '#9a6b0a', bg: '#fdf3dd', title: `${counts.pendingOrders} orders need attention`, sub: 'Pending / processing orders' });
    if (counts.pendingLeads) list.push({ icon: 'fa-magnet', color: '#7a5327', bg: '#f3e8d3', title: `${counts.pendingLeads} new leads need follow-up`, sub: 'Website enquiries awaiting first contact' });
    if (counts.pendingQuotations) list.push({ icon: 'fa-file-invoice', color: '#6e4c22', bg: '#f1e4cb', title: `${counts.pendingQuotations} quotations awaiting decision`, sub: 'Sent quotations needing follow-up' });
    if (counts.pendingReviews) list.push({ icon: 'fa-star', color: '#8a5f32', bg: '#f3e8d3', title: `${counts.pendingReviews} reviews awaiting approval`, sub: 'Customer feedback queue' });
    return list;
  }, [counts]);

  const notifCount = notifications.length;

  // Per-page gate: same dashboard shell for everyone, pages filtered by permission.
  // (Server APIs enforce the same map — this only controls what renders.)
  // Disabled sold modules are also hidden here; the server re-checks on every request.
  // /super/* is super-admin-only and bypasses tenant module gating (fixed shell, no layout switch).
  const pageAllowed = useMemo(() => {
    if (!user) return false;
    const path = pathname || '/admin/dashboard';
    const isSuperRoute = path === '/super' || path.startsWith('/super/');
    if (isSuperRoute) return user.isSuperAdmin === true || String(user.role || '').toLowerCase() === 'super_admin';
    // Job Sites + Payroll & Settlement are owner/admin-only (manager sees
    // Employee List + Live Attendance only). Server APIs enforce the same.
    const restrictedTeam = path === '/admin/team/sites' || path.startsWith('/admin/team/sites/') || path === '/admin/team/payroll' || path.startsWith('/admin/team/payroll/');
    if (restrictedTeam) {
      const r = String(user.role || '').toLowerCase();
      if (user.isSuperAdmin) return true;
      if (r === 'owner' || r === 'admin') return true;
      return false;
    }
    const adminModule = moduleForPath(path);
    // Catalog pages are exclusive to the default (Ananya) tenant — block direct URLs too.
    if (CATALOG_ADMIN_MODULES.has(String(adminModule)) && !isDefaultTenant(tenantSlug) && !user.isSuperAdmin) return false;
    if (!roleCanAccess(user.role || 'customer', user.permissions || [], adminModule)) return false;
    const salesKey = SALES_MODULE_FOR_ADMIN[adminModule];
    if (salesKey && enabledModules.length > 0 && !enabledModules.includes(salesKey)) return false;
    return true;
  }, [user, pathname, enabledModules, tenantSlug]);

  if (authState === 'denied') {
    return (
      <div className="ahf-admin">
        <div className="ahf-denied">
          <div className="ahf-denied-card">
            <div className="ahf-denied-ic">
              <i className="fas fa-lock"></i>
            </div>
            <h2 style={{ margin: '0 0 8px' }}>Access Denied</h2>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 22px' }}>
              You don&apos;t have permission to view the admin portal. If you believe this is a mistake, please contact your administrator.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/login" className="ahf-btn ahf-btn-primary">Go to Login</a>
              <a href="/" className="ahf-btn ahf-btn-ghost">Back to Website</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ahf-admin">
        <div className="ahf-denied">
          <div className="ahf-denied-card">
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: 0 }}>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ahf-admin">
      <div className={`ahf-shell ${collapsed ? 'ahf-collapsed' : ''} ${mobileOpen ? 'ahf-open' : ''}`}>
        <aside className="ahf-sidebar">
          <Sidebar
            userName={user?.name || ''}
            userEmail={user?.email || ''}
            userRole={user?.role || 'staff'}
            permissions={user?.permissions || []}
            counts={counts}
            query={menuQuery}
            onQuery={setMenuQuery}
            onNavigate={() => setMobileOpen(false)}
            enabledModules={enabledModules}
            tenantName={tenantName}
            tenantSlug={tenantSlug}
          />
        </aside>
        <div className="ahf-scrim" onClick={() => setMobileOpen(false)} />
        <div className="ahf-main">
          <Header
            user={user}
            title={meta.title}
            trail={meta.trail}
            onToggleSidebar={() => {
              if (window.innerWidth <= 1024) setMobileOpen((o) => !o);
              else setCollapsed((c) => !c);
            }}
            notifCount={notifCount}
            notifications={notifications}
          />
          <main className="ahf-content">
            {pageAllowed ? (
              children
            ) : (
              <div className="ahf-panel">
                <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="ahf-denied-ic" style={{ marginBottom: 14 }}>
                    <i className="fas fa-lock"></i>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>Not Permitted</h3>
                  <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>
                    Your account doesn&apos;t have access to this section.
                  </p>
                  <a href="/admin/dashboard" className="ahf-btn ahf-btn-primary">Back to Dashboard</a>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
