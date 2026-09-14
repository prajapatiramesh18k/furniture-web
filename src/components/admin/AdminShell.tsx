'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header, { type SessionUser } from './Header';
import { moduleForPath } from './AdminNav';
import { roleCanAccess } from '@/lib/admin-roles';

const TITLES: Record<string, { title: string; trail: { label: string; href?: string }[] }> = {
  '/admin/dashboard': { title: 'Dashboard', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Dashboard' }] },
  '/admin/products': { title: 'Products', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Products' }] },
  '/admin/orders': { title: 'Orders', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Orders' }] },
  '/admin/categories': { title: 'Categories', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Categories' }] },
  '/admin/customers': { title: 'Customers', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Customers' }] },
  '/admin/inventory': { title: 'Inventory', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Inventory' }] },
  '/admin/collections': { title: 'Furniture Collections', trail: [{ label: 'Home', href: '/admin/dashboard' }, { label: 'Collections' }] },
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
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const [counts, setCounts] = useState<{ pendingReviews?: number; pendingOrders?: number; products?: number }>({});

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.status === 401) {
        setAuthState('denied');
        router.replace('/login?next=' + encodeURIComponent(pathname || '/admin/dashboard'));
        return;
      }
      const data = await res.json();
      // /admin/* is for staff roles only (admin/manager/staff or explicit permission).
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
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || (data.user.isAdmin ? 'admin' : 'staff'),
        permissions: data.user.permissions || [],
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
  useEffect(() => {
    if (authState !== 'ok') return;
    (async () => {
      try {
        const res = await fetch('/api/admin/badges', { cache: 'no-store' });
        if (!res.ok) return;
        const s = await res.json();
        setCounts({
          pendingReviews: s.pendingReviews,
          pendingOrders: s.pendingOrders,
          products: s.products,
        });
      } catch {}
    })();
  }, [authState]);

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
    if (counts.pendingReviews) list.push({ icon: 'fa-star', color: '#8a5f32', bg: '#f3e8d3', title: `${counts.pendingReviews} reviews awaiting approval`, sub: 'Customer feedback queue' });
    return list;
  }, [counts]);

  const notifCount = notifications.length;

  // Per-page gate: same dashboard shell for everyone, pages filtered by permission.
  // (Server APIs enforce the same map — this only controls what renders.)
  const pageAllowed = !user
    ? false
    : roleCanAccess(user.role || 'customer', user.permissions || [], moduleForPath(pathname || '/admin/dashboard'));

  if (authState === 'loading') {
    return (
      <div className="ahf-admin">
        <div className="ahf-loading-wrap">
          <div className="ahf-spinner" />
          <p>Loading your workspace…</p>
          <div style={{ display: 'flex', gap: 12, width: 'min(560px, 90%)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="ahf-skel" style={{ height: 90, flex: 1 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          />
        </aside>
        <div className="ahf-scrim" onClick={() => setMobileOpen(false)} />
        <div className="ahf-main">
          <Header
            user={user!}
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
