'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

export interface SessionUser {
  name: string;
  email: string;
  role: string;
  permissions: string[];
  tenantName?: string;
  isSuperAdmin?: boolean;
}

export default function Header({
  user,
  title,
  trail,
  onToggleSidebar,
  notifCount,
  notifications,
}: {
  user: SessionUser;
  title: string;
  trail: { label: string; href?: string }[];
  onToggleSidebar: () => void;
  notifCount: number;
  notifications: { icon: string; color: string; bg: string; title: string; sub: string }[];
}) {
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try { sessionStorage.removeItem('auth-user'); } catch {}
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/');
  };

  const initials = (user.name || 'A').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  // Customers get their own versions of these pages (no admin role/access).
  const isCustomer = String(user.role || '').toLowerCase() === 'customer';
  const profileHref = isCustomer ? '/customer/settings' : '/admin/settings';
  const notifHref = isCustomer ? '/account' : '/admin/notifications';

  return (
    <header className="ahf-header">
      <button className="ahf-icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar" title="Toggle sidebar">
        <i className="fas fa-bars"></i>
      </button>
      <div className="ahf-crumbs">
        <h1>{title}</h1>
        <Breadcrumbs trail={trail} />
        {user.tenantName && (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ahf-gold)', marginTop: 2 }}>{user.tenantName}</div>
        )}
      </div>

      <div className="ahf-header-spacer" />

      <div className="ahf-popwrap" ref={notifRef}>
        <button
          className="ahf-icon-btn"
          aria-label="Notifications"
          onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
        >
          <i className="fas fa-bell"></i>
          {notifCount > 0 && <span className="ahf-dot">{notifCount > 99 ? '99+' : notifCount}</span>}
        </button>
        {notifOpen && (
          <div className="ahf-pop ahf-notif">
            <div className="ahf-pop-head">
              <strong>Notifications</strong>
              <span>{notifCount} unread update{notifCount === 1 ? '' : 's'}</span>
            </div>
            {notifications.length === 0 && (
              <p style={{ padding: '16px', fontSize: 13, color: 'var(--ahf-muted)', margin: 0 }}>You&apos;re all caught up.</p>
            )}
            {notifications.slice(0, 6).map((n, i) => (
              <div className="ahf-notif-row" key={i}>
                <span className="ahf-notif-ic" style={{ background: n.bg, color: n.color }}>
                  <i className={`fas ${n.icon}`}></i>
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div style={{ color: 'var(--ahf-muted)', fontSize: 12 }}>{n.sub}</div>
                </div>
              </div>
            ))}
            <Link href="/admin/notifications" className="ahf-pop-item" style={{ justifyContent: 'center', fontWeight: 700 }} onClick={() => setNotifOpen(false)}>
              View all
            </Link>
          </div>
        )}
      </div>

      <div className="ahf-popwrap" ref={userRef}>
        <button className="ahf-userchip" onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }} aria-label="User menu">
          <span className="ahf-avatar">{initials}</span>
          <span className="ahf-meta">
            <strong>{user.name}</strong>
          </span>
          <i className="fas fa-chevron-down" style={{ fontSize: 11, color: 'var(--ahf-muted)' }}></i>
        </button>
        {userOpen && (
          <div className="ahf-pop">
            <div className="ahf-pop-head">
              <strong>{user.name}</strong>
              <span>{(user.email || '').toLowerCase()}</span>
            </div>
            <Link href={profileHref} className="ahf-pop-item" onClick={() => setUserOpen(false)}>
              <i className="fas fa-user"></i> Profile
            </Link>
            <Link href={profileHref} className="ahf-pop-item" onClick={() => setUserOpen(false)}>
              <i className="fas fa-gear"></i> Account Settings
            </Link>
            <Link href={notifHref} className="ahf-pop-item" onClick={() => setUserOpen(false)}>
              <i className="fas fa-bell"></i> Notifications
            </Link>
            <div className="ahf-pop-div" />
            <button className="ahf-pop-item ahf-danger" onClick={logout}>
              <i className="fas fa-right-from-bracket"></i> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
