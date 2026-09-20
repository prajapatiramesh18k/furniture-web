'use client';

import Link from 'next/link';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Stats {
  totals: { pendingOrders: number };
  pendingReviews: number;
  recentOrders: { _id: string; customer: string; total: number; status: string }[];
}

export default function AdminNotifications() {
  const { data, loading } = useAdminFetch<Stats>('/api/admin/stats');

  const items = [
    ...(data && data.totals.pendingOrders > 0 ? [{
      icon: 'fa-cart-shopping', color: '#9a6b0a', bg: '#fdf3dd',
      title: `${data.totals.pendingOrders} orders need attention`,
      sub: 'Pending / processing orders in the queue', href: '/admin/orders',
    }] : []),
    ...(data && data.pendingReviews > 0 ? [{
      icon: 'fa-star', color: '#8a5f32', bg: '#f3e8d3',
      title: `${data.pendingReviews} reviews awaiting approval`,
      sub: 'Customer feedback queue', href: '/admin/reviews',
    }] : []),
  ];

  return (
    <ModuleShell title="Notifications" sub="Operational alerts from your live store data">
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>All Notifications</h3></div></div>
        {loading ? (
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="ahf-skel" style={{ height: 48 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--ahf-muted)' }}>You&apos;re all caught up. New orders and reviews will notify you here.</p>
        ) : (
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((n, i) => (
              <Link key={i} href={n.href} className="ahf-notif-row" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--ahf-line)', borderRadius: 12, marginBottom: 8 }}>
                <span className="ahf-notif-ic" style={{ background: n.bg, color: n.color }}><i className={`fas ${n.icon}`}></i></span>
                <div><div style={{ fontWeight: 600 }}>{n.title}</div><div style={{ color: 'var(--ahf-muted)', fontSize: 12 }}>{n.sub}</div></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
