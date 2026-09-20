'use client';

import Link from 'next/link';
import DashboardCard from '@/components/admin/DashboardCard';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Stats {
  totals: { products: number; orders: number; pendingOrders: number; customers: number; revenue: number; reviews: number };
  monthly: { label: string; revenue: number; orders: number }[];
  categoryCounts: Record<string, number>;
  bestSellers: { name: string; qty: number; revenue: number }[];
}

export default function AdminReports() {
  const { data, loading } = useAdminFetch<Stats>('/api/admin/stats');
  const maxRev = Math.max(1, ...(data?.monthly.map((m) => m.revenue) || [1]));

  return (
    <ModuleShell
      title="Reports & Analytics"
      sub="Business performance from live store data"
      action={<Link href="/admin/dashboard" className="ahf-btn ahf-btn-ghost"><i className="fas fa-gauge-high"></i> Dashboard</Link>}
    >
      {loading || !data ? (
        <>
        <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', display: 'grid' }}>
          {[1,2,3,4].map(i => <div key={i} className="ahf-skel" style={{ height: 130 }} />)}
        </div>
        <div className="ahf-grid-2eq" style={{ marginTop: 16 }}>
          {[1,2].map(i => <div key={i} className="ahf-skel" style={{ height: 190 }} />)}
        </div>
        </>
      ) : (
        <>
          <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', display: 'grid' }}>
            <DashboardCard icon="fa-indian-rupee-sign" value={`₹${data.totals.revenue.toLocaleString('en-IN')}`} label="Total Revenue" sub="All recorded orders" accent="#a27341" accentSoft="rgba(162,115,65,.14)" />
            <DashboardCard icon="fa-cart-shopping" value={String(data.totals.orders)} label="Total Orders" sub={`${data.totals.pendingOrders} pending`} accent="#8a5f32" accentSoft="#eee0c4" />
            <DashboardCard icon="fa-couch" value={String(data.totals.products)} label="Products Live" sub={`${Object.keys(data.categoryCounts).length} categories`} accent="#a27341" accentSoft="#f3e8d3" />
            <DashboardCard icon="fa-users" value={String(data.totals.customers)} label="Customers" sub="Registered accounts" accent="#7a5327" accentSoft="#e9d9b8" />
          </div>
          <div className="ahf-grid-2eq">
            <div className="ahf-panel">
              <div className="ahf-panel-head"><div><h3>Revenue Trend</h3><p>Last 6 months</p></div></div>
              <div className="ahf-panel-body">
                <div className="ahf-bars">
                  {data.monthly.map((m) => (
                    <div className="ahf-bar-col" key={m.label} title={`${m.label}: ₹${m.revenue.toLocaleString('en-IN')}`}>
                      <div className="ahf-bar-track"><div className="ahf-bar-fill" style={{ height: `${Math.max(3, Math.round((m.revenue / maxRev) * 100))}%` }} /></div>
                      <span className="ahf-bar-lbl">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ahf-panel">
              <div className="ahf-panel-head"><div><h3>Top Products by Revenue</h3><p>From order history</p></div></div>
              <div className="ahf-panel-body" style={{ paddingTop: 6 }}>
                {data.bestSellers.length === 0 && <p style={{ color: 'var(--ahf-muted)', fontSize: 13 }}>No sales data yet.</p>}
                {[...data.bestSellers].sort((a, b) => b.revenue - a.revenue).map((b, i) => (
                  <div className="ahf-seller" key={b.name}>
                    <span style={{ fontWeight: 800, color: 'var(--ahf-muted)', width: 18 }}>#{i + 1}</span>
                    <div><div className="ahf-s-name">{b.name}</div><div className="ahf-s-sub">{b.qty} sold</div></div>
                    <span className="ahf-s-rev">₹{b.revenue.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </ModuleShell>
  );
}
