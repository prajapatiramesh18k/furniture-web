'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingList } from '@/components/admin/ModuleBits';

export default function CustomerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const me = await res.json().catch(() => ({}));
        if (me?.user) setUser({ name: me.user.name || '', email: me.user.email || '' });
      } catch {}
      finally {
        setLoading(false);
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

  const initial = (user.name || '?')[0].toUpperCase();

  return (
    <div>
      <div className="ahf-pagehead">
        <div>
          <p>Customer</p>
          <h2>Settings</h2>
          <p>Manage your account and security.</p>
        </div>
        <Link href="/account" className="ahf-btn ahf-btn-ghost">
          <i className="fas fa-arrow-left"></i> My Account
        </Link>
      </div>

      {loading ? (
        <LoadingList rows={2} />
      ) : (
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
                <strong style={{ wordBreak: 'break-all' }}>{user.email.toLowerCase()}</strong>
              </div>
              <div className="ahf-cat-row">
                <span style={{ minWidth: 110, color: 'var(--ahf-muted)' }}>Account</span>
                <strong>Customer</strong>
              </div>
            </div>
          </div>

          <div className="ahf-panel">
            <div className="ahf-panel-head">
              <div>
                <h3>Security</h3>
                <p>Password and session</p>
              </div>
            </div>
            <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: 'var(--ahf-muted)', fontSize: 13, margin: 0 }}>
                Forgot your password or want a new one? We&apos;ll email you a secure reset link.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/forgot-password" className="ahf-btn ahf-btn-primary">
                  <i className="fas fa-key"></i> Change Password
                </Link>
                <button className="ahf-btn ahf-btn-ghost" onClick={logout}>
                  <i className="fas fa-right-from-bracket"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
