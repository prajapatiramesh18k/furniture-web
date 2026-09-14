'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleShell } from '@/components/admin/ModuleBits';

interface Me {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export default function AdminSettings() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const u = data?.user;
        if (!u) {
          setState('denied');
          return;
        }
        const role = String(u.role || (u.isAdmin ? 'admin' : 'customer')).toLowerCase();
        const perms: string[] = Array.isArray(u.permissions) ? u.permissions : [];
        // Customers never see settings — the shell also blocks /admin/* for them.
        if (role === 'customer' && perms.length === 0) {
          setState('denied');
          return;
        }
        setUser({ name: u.name, email: u.email, role, isAdmin: !!u.isAdmin });
        setState('ok');
      } catch {
        setState('denied');
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      sessionStorage.removeItem('auth-user');
    } catch {}
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/');
  };

  if (state === 'loading') {
    return (
      <ModuleShell title="Settings" sub="Account and business preferences">
        <div style={{ display: 'flex', gap: 12 }}>
          {[1, 2].map((i) => (
            <div key={i} className="ahf-skel" style={{ height: 220, flex: 1 }} />
          ))}
        </div>
      </ModuleShell>
    );
  }

  if (state === 'denied' || !user) {
    return (
      <ModuleShell title="Settings" sub="Account and business preferences">
        <div className="ahf-panel">
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic" style={{ marginBottom: 14 }}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>Not Permitted</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>
              Settings are available to staff accounts only.
            </p>
            <Link href="/admin/dashboard" className="ahf-btn ahf-btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ModuleShell>
    );
  }

  const initial = (user.name || '?')[0].toUpperCase();

  return (
    <ModuleShell title="Settings" sub="Account and business preferences">
      <div className="ahf-grid-2eq">
        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>My Profile</h3>
              <p>Signed-in account details</p>
            </div>
            <span className="ahf-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{initial}</span>
          </div>
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="ahf-cat-row">
              <span style={{ minWidth: 110, color: 'var(--ahf-muted)' }}>Full Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="ahf-cat-row">
              <span style={{ minWidth: 110, color: 'var(--ahf-muted)' }}>Email</span>
              <strong style={{ wordBreak: 'break-all' }}>{(user.email || '').toLowerCase()}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <Link href="/forgot-password" className="ahf-btn ahf-btn-ghost ahf-btn-sm">
                <i className="fas fa-key"></i> Change Password
              </Link>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={logout}>
                <i className="fas fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>Business Info</h3>
              <p>Anaya House of Furniture</p>
            </div>
          </div>
          <div className="ahf-panel-body" style={{ fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0 }}><i className="fas fa-location-dot" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>Diva-Shil Road, Khardipada, Thane, Maharashtra — 400612</p>
            <p style={{ margin: 0 }}><i className="fas fa-phone" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>+91 93218 12823</p>
            <p style={{ margin: 0 }}><i className="fas fa-envelope" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>ananyahouseoffurniture@gmail.com</p>
            <p style={{ margin: 0 }}><i className="fas fa-shield-halved" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>5-year warranty on manufacturing defects</p>
            {user.isAdmin && (
              <div style={{ marginTop: 6 }}>
                <Link href="/admin/staff" className="ahf-btn ahf-btn-primary ahf-btn-sm">
                  <i className="fas fa-user-tie"></i> Manage Team &amp; Roles
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}
