'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/admin/DashboardCard';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';

interface Stats {
  totals: { products: number; orders: number; pendingOrders: number; customers: number; revenue: number; reviews: number };
  monthly: { label: string; revenue: number; orders: number }[];
  categoryCounts: Record<string, number>;
  bestSellers: { name: string; qty: number; revenue: number; image: string }[];
  recentOrders: { _id: string; customer: string; phone: string; city: string; items: number; itemNames: string; total: number; paymentMethod: string; status: string; date: string }[];
  recentReviews: { _id: string; name: string; rating: number; text: string; approved: boolean }[];
  pendingReviews: number;
}

const inr = (n: number) =>
  '₹' + Number(n || 0).toLocaleString('en-IN');

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userName, setUserName] = useState('there');
  const [showFull, setShowFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Instant landing: only the light session lookup runs on login.
  // Heavy analytics load when "View Dashboard" is clicked.
  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        const me = await meRes.json().catch(() => ({}));
        if (me?.user?.name) setUserName(me.user.name.split(' ')[0]);
      } catch {}
    })();
  }, []);

  const loadFull = async () => {
    if (showFull) return;
    setShowFull(true);
    setLoading(true);
    setError('');
    try {
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (!statsRes.ok) throw new Error('stats');
      setStats(await statsRes.json());
    } catch {
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const maxRev = Math.max(1, ...(stats?.monthly.map((m) => m.revenue) || [1]));
  const maxOrders = Math.max(1, ...(stats?.monthly.map((m) => m.orders) || [1]));
  const topCats = useMemo(() => {
    if (!stats) return [];
    const entries = Object.entries(stats.categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return entries.map(([k, v]) => ({ name: k, count: v, pct: Math.round((v / max) * 100) }));
  }, [stats]);

  if (!showFull) {
    const shortcuts = [
      { icon: 'fa-cart-shopping', label: 'Orders', href: '/admin/orders' },
      { icon: 'fa-couch', label: 'Products', href: '/admin/products' },
      { icon: 'fa-file-invoice', label: 'New Quotation', href: '/admin/quotations/new' },
      { icon: 'fa-clipboard-user', label: 'Employee Management', href: '/admin/team/employees' },
      { icon: 'fa-star', label: 'Reviews', href: '/admin/reviews' },
      { icon: 'fa-chart-line', label: 'Reports', href: '/admin/reports' },
      { icon: 'fa-users', label: 'Customers', href: '/admin/customers' },
    ];
    return (
      <ModuleShell title={`Welcome back, ${userName}`} sub={today}>
        <div className="ahf-panel" style={{ marginBottom: 16 }}>
          <div className="ahf-panel-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span className="ahf-stat-ic" style={{ width: 52, height: 52, fontSize: 20 }}>
              <i className="fas fa-gauge-high"></i>
            </span>
            <div style={{ flex: '1 1 220px' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Analytics Dashboard</div>
              <div style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>
                Sales, revenue, best sellers and recent orders — loaded on demand.
              </div>
            </div>
            <button className="ahf-btn ahf-btn-primary" onClick={loadFull}>
              <i className="fas fa-chart-line"></i> View Dashboard
            </button>
          </div>
        </div>
        <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', display: 'grid', marginBottom: 0 }}>
          {shortcuts.map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <DashboardCard icon={s.icon} value={s.label} label="Open module" accent="#a27341" accentSoft="rgba(162,115,65,.14)" />
            </Link>
          ))}
        </div>
      </ModuleShell>
    );
  }

  if (loading) {
    return (
      <ModuleShell title={`Welcome back, ${userName}`} sub={today}>
        <LoadingList rows={6} />
      </ModuleShell>
    );
  }

  if (error || !stats) {
    return (
      <ModuleShell title={`Welcome back, ${userName}`} sub={today}>
      <div className="ahf-panel">
        <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--ahf-muted)' }}>{error || 'No data available.'}</p>
          <button className="ahf-btn ahf-btn-primary" onClick={loadFull}>
            <i className="fas fa-rotate-right"></i> Retry
          </button>
        </div>
      </div>
      </ModuleShell>
    );
  }

  const cards = [
    { icon: 'fa-couch', value: String(stats.totals.products), label: 'Total Products', sub: `${topCats.length} categories`, delta: undefined as string | undefined, tone: 'flat' as const, accent: '#a27341', soft: '#f3e8d3' },
    { icon: 'fa-cart-shopping', value: String(stats.totals.orders), label: 'Total Orders', sub: 'All time', delta: undefined, tone: 'flat' as const, accent: '#8a5f32', soft: '#eee0c4' },
    { icon: 'fa-hourglass-half', value: String(stats.totals.pendingOrders), label: 'Pending Orders', sub: 'Need attention', delta: stats.totals.pendingOrders > 0 ? `${stats.totals.pendingOrders} open` : 'All clear', tone: (stats.totals.pendingOrders > 0 ? 'down' : 'up') as 'up' | 'down', accent: '#d9930d', soft: '#fdf3dd' },
    { icon: 'fa-users', value: String(stats.totals.customers), label: 'Total Customers', sub: 'Registered accounts', delta: undefined, tone: 'flat' as const, accent: '#7a5327', soft: '#e9d9b8' },
    { icon: 'fa-indian-rupee-sign', value: inr(stats.totals.revenue), label: 'Revenue', sub: 'From recorded orders', delta: undefined, tone: 'flat' as const, accent: '#a27341', soft: 'rgba(162,115,65,.14)' },
    { icon: 'fa-star', value: String(stats.totals.reviews), label: 'Reviews', sub: `${stats.pendingReviews} awaiting approval`, delta: stats.pendingReviews > 0 ? `${stats.pendingReviews} pending` : undefined, tone: 'flat' as const, accent: '#b98a4e', soft: '#f5e9d2' },
  ];

  return (
    <ModuleShell
      title={`Welcome back, ${userName}`}
      sub="Here's what's happening across your furniture business today."
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin/products" className="ahf-btn ahf-btn-primary ahf-btn-sm">
            <i className="fas fa-plus"></i> Create
          </Link>
          <Link href="/admin/orders" className="ahf-btn ahf-btn-ghost ahf-btn-sm">
            <i className="fas fa-cart-shopping"></i> View Orders
          </Link>
          <Link href="/admin/quotations/new" className="ahf-btn ahf-btn-ghost ahf-btn-sm">
            <i className="fas fa-file-invoice"></i> New Quotation
          </Link>
        </div>
      )}
    >
      <div className="ahf-grid-stats">
        {cards.map((c) => (
          <DashboardCard key={c.label} icon={c.icon} value={c.value} label={c.label} sub={c.sub} delta={c.delta} deltaTone={c.tone} accent={c.accent} accentSoft={c.soft} />
        ))}
      </div>

      <div className="ahf-grid-2eq">
        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>Sales Overview</h3>
              <p>Revenue & order volume · last 6 months (live data)</p>
            </div>
            <div className="ahf-legend">
              <span><i style={{ background: '#a27341' }}></i>Revenue</span>
              <span><i style={{ background: '#8a5f32' }}></i>Orders</span>
            </div>
          </div>
          <div className="ahf-panel-body">
            {stats.monthly.every((m) => m.revenue === 0 && m.orders === 0) ? (
              <p style={{ color: 'var(--ahf-muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
                No sales recorded in the last 6 months yet. New orders will appear here automatically.
              </p>
            ) : (
              <div className="ahf-bars">
                {stats.monthly.map((m) => (
                  <div className="ahf-bar-col" key={m.label} title={`${m.label}: ${inr(m.revenue)} · ${m.orders} orders`}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 150 }}>
                      <div className="ahf-bar-track" style={{ width: 26 }}>
                        <div className="ahf-bar-fill" style={{ height: `${Math.max(3, Math.round((m.revenue / maxRev) * 100))}%` }} />
                      </div>
                      <div className="ahf-bar-track" style={{ width: 26 }}>
                        <div className="ahf-bar-fill blue" style={{ height: `${Math.max(3, Math.round((m.orders / maxOrders) * 100))}%` }} />
                      </div>
                    </div>
                    <span className="ahf-bar-lbl">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>Orders Overview</h3>
              <p>Products per category in your catalog</p>
            </div>
            <Link href="/admin/categories" className="ahf-link">Manage →</Link>
          </div>
          <div className="ahf-panel-body" style={{ paddingTop: 8 }}>
            {topCats.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No products yet.</p>}
            {topCats.map((c) => (
              <div className="ahf-cat-row" key={c.name}>
                <span style={{ minWidth: 120, fontWeight: 600, textTransform: 'capitalize' }}>{c.name.replace(/-/g, ' ')}</span>
                <div className="ahf-cat-bar"><span style={{ width: `${c.pct}%` }} /></div>
                <strong>{c.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact" style={{ marginBottom: 20 }}>
        <div className="ahf-panel-head">
          <div>
            <h3>Recent Orders</h3>
            <p>Latest customer orders from your store</p>
          </div>
          <Link href="/admin/orders" className="ahf-link">View all →</Link>
        </div>
        <DataTable
            columns={[
              { key: 'id', header: 'Order ID', render: (o) => <span style={{ fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</span> },
              {
                key: 'cust', header: 'Customer',
                render: (o) => (
                  <div className="ahf-cust">
                    <span className="ahf-avatar">{(o.customer || '?')[0].toUpperCase()}</span>
                    <div><strong>{o.customer}</strong><span>{o.city}</span></div>
                  </div>
                ),
              },
              { key: 'items', header: 'Products', render: (o) => <span title={o.itemNames}>{o.items} item{o.items === 1 ? '' : 's'}</span> },
              { key: 'amt', header: 'Amount', render: (o) => <span className="ahf-amt">{inr(o.total)}</span> },
              { key: 'pay', header: 'Payment', render: (o) => <span style={{ fontSize: 12.5 }}>{o.paymentMethod}</span> },
              { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
            ]}
            rows={stats.recentOrders}
            emptyText="No orders yet — new website orders will show up here."
          />
      </div>

      <div className="ahf-grid-2eq">
          <div className="ahf-panel">
            <div className="ahf-panel-head">
              <div>
                <h3>Best Selling Products</h3>
                <p>Ranked by units ordered</p>
              </div>
              <Link href="/admin/reports" className="ahf-link">Reports →</Link>
            </div>
            <div className="ahf-panel-body" style={{ paddingTop: 6 }}>
              {stats.bestSellers.length === 0 && (
                <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No sales data yet — best sellers will appear once orders come in.</p>
              )}
              {stats.bestSellers.map((b, i) => (
                <div className="ahf-seller" key={b.name}>
                  <span style={{ fontWeight: 800, color: 'var(--ahf-muted)', width: 18 }}>#{i + 1}</span>
                  {b.image ? <img src={b.image} alt={b.name} /> : <span className="ahf-avatar" style={{ width: 44, height: 44, borderRadius: 10 }}>{b.name[0]}</span>}
                  <div>
                    <div className="ahf-s-name">{b.name}</div>
                    <div className="ahf-s-sub">{b.qty} sold</div>
                  </div>
                  <span className="ahf-s-rev">{inr(b.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ahf-panel">
            <div className="ahf-panel-head">
              <div>
                <h3>Latest Reviews</h3>
                <p>{stats.pendingReviews} awaiting approval</p>
              </div>
              <Link href="/admin/reviews" className="ahf-link">Moderate →</Link>
            </div>
            <div className="ahf-panel-body" style={{ paddingTop: 6 }}>
              {stats.recentReviews.length === 0 && (
                <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No reviews yet.</p>
              )}
              {stats.recentReviews.slice(0, 3).map((r) => (
                <div className="ahf-seller" key={r._id}>
                  <span className="ahf-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>{(r.name || '?')[0].toUpperCase()}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="ahf-s-name">{r.name} <span style={{ color: '#d9930d' }}>{'★'.repeat(Math.round(r.rating || 0))}</span></div>
                    <div className="ahf-s-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{r.text}</div>
                  </div>
                  <span style={{ marginLeft: 'auto' }}><StatusBadge status={r.approved ? 'Approved' : 'Pending'} /></span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </ModuleShell>
  );
}
