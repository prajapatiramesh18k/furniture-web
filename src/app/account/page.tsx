'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/admin/DashboardCard';
import { PHONES } from '@/lib/site-config';

type Panel = 'profile' | 'orders' | 'notifications' | null;

export default function CustomerAccountPage() {
  const [userName, setUserName] = useState('there');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Panel>('profile');

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const me = await res.json().catch(() => ({}));
        if (me?.user?.name) {
          setUserName(me.user.name.split(' ')[0]);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="ahf-skel" style={{ height: 64, marginBottom: 16 }} />
        <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', display: 'grid' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ahf-skel" style={{ height: 130 }} />
          ))}
        </div>
      </div>
    );
  }

  const links = [
    { icon: 'fa-box', title: 'My Orders', sub: 'Track your purchases', href: '/orders', key: 'orders' },
    { icon: 'fa-shopping-cart', title: 'Cart', sub: 'Review your items', href: '/cart', key: '' },
    { icon: 'fa-heart', title: 'Wishlist', sub: 'Your saved pieces', href: '/wishlist', key: '' },
    { icon: 'fa-headset', title: 'Help & Support', sub: 'Talk to our team', href: '/contact', key: '' },
    { icon: 'fa-globe', title: 'View Website', sub: 'Back to shopping', href: '/', key: '' },
  ];

  const toggle = (k: Exclude<Panel, null>) => setOpen((e) => (e === k ? null : k));

  return (
    <div>
      <div className="ahf-pagehead">
        <div>
          <p>{today}</p>
          <h2>Welcome back, {userName} 👋</h2>
          <p>Your furniture account at a glance.</p>
        </div>
      </div>

      <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', display: 'grid' }}>
        {links.map((l) =>
          l.key ? (
            <button
              key={l.title}
              onClick={() => toggle(l.key as Exclude<Panel, null>)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <DashboardCard icon={l.icon} value={l.title} label={l.sub} accent="#a27341" accentSoft="rgba(162,115,65,.14)" />
            </button>
          ) : (
            <Link key={l.title} href={l.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <DashboardCard icon={l.icon} value={l.title} label={l.sub} accent="#a27341" accentSoft="rgba(162,115,65,.14)" />
            </Link>
          )
        )}
      </div>

      {open === 'orders' && (
        <div className="ahf-panel" style={{ marginTop: 16 }}>
          <div className="ahf-panel-head">
            <div>
              <h3>My Orders</h3>
              <p>Share your order phone number and we&apos;ll update you right away</p>
            </div>
          </div>
          <div className="ahf-panel-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="ahf-btn ahf-btn-primary" href={`tel:${PHONES.mumbaiPrimary.tel}`}>
              <i className="fas fa-phone"></i> {PHONES.mumbaiPrimary.display}
            </a>
            <a
              className="ahf-btn ahf-btn-ghost"
              href={`https://wa.me/${PHONES.whatsappPrimary.e164}?text=${encodeURIComponent('Hi, I want to track my order.')}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i> Track on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
