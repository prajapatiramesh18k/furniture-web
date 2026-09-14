'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header, { type SessionUser } from '@/components/admin/Header';

/**
 * Customer portal shell — the SAME sidebar + header UI as the staff portal,
 * but wired to the customer menu (My Orders, Cart, Wishlist, Help & Support).
 * Staff accounts are sent to /admin/dashboard; guests to /login.
 */
export default function CustomerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/login?next=/account');
        setAuthState('denied');
        return;
      }
      const data = await res.json();
      if (!data.user) {
        setAuthState('denied');
        return;
      }
      const role = String(data.user.role || (data.user.isAdmin ? 'admin' : 'customer')).toLowerCase();
      const perms: string[] = Array.isArray(data.user.permissions) ? data.user.permissions : [];
      if (role !== 'customer' || perms.length > 0) {
        router.replace('/admin/dashboard');
        return;
      }
      setUser({ name: data.user.name, email: data.user.email, role: 'customer', permissions: [] });
      setAuthState('ok');
    } catch {
      setAuthState('denied');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authState === 'loading') {
    return (
      <div className="ahf-admin">
        <div className="ahf-loading-wrap">
          <div className="ahf-spinner" />
          <p>Loading your account…</p>
        </div>
      </div>
    );
  }

  if (authState === 'denied' || !user) {
    return (
      <div className="ahf-admin">
        <div className="ahf-denied">
          <div className="ahf-denied-card">
            <div className="ahf-denied-ic">
              <i className="fas fa-lock"></i>
            </div>
            <h2 style={{ margin: '0 0 8px' }}>Access Denied</h2>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 22px' }}>
              Please log in with your customer account to view this page.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/login?next=/account" className="ahf-btn ahf-btn-primary">Go to Login</a>
              <a href="/" className="ahf-btn ahf-btn-ghost">Back to Website</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ahf-admin">
      <div className={`ahf-shell ${mobileOpen ? 'ahf-open' : ''}`}>
        <aside className="ahf-sidebar">
          <Sidebar
            userName={user.name}
            userEmail={user.email}
            userRole="customer"
            permissions={[]}
            counts={{}}
            query={menuQuery}
            onQuery={setMenuQuery}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
        <div className="ahf-scrim" onClick={() => setMobileOpen(false)} />
        <div className="ahf-main">
          <Header
            user={user}
            title="My Account"
            trail={[{ label: 'My Account' }]}
            onToggleSidebar={() => {
              if (window.innerWidth <= 1024) setMobileOpen((o) => !o);
            }}
            notifCount={0}
            notifications={[]}
          />
          <main className="ahf-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
