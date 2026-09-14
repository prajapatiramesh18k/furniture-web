'use client';

import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface O { _id: string; total: number; paymentMethod: string; status: string; date: string; customerInfo?: { name: string } }

export default function AdminPayments() {
  const { data, loading } = useAdminFetch<{ orders: O[] }>('/api/orders');
  const orders = data?.orders || [];
  const byMethod: Record<string, { count: number; total: number }> = {};
  for (const o of orders) {
    const m = o.paymentMethod || 'Unknown';
    byMethod[m] = byMethod[m] || { count: 0, total: 0 };
    byMethod[m].count += 1;
    byMethod[m].total += Number(o.total) || 0;
  }

  return (
    <ModuleShell title="Payments" sub="Payment methods used across real orders">
      <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', display: 'grid' }}>
        {Object.entries(byMethod).map(([m, v]) => (
          <div className="ahf-stat" key={m}>
            <div className="ahf-stat-top"><span className="ahf-stat-ic"><i className="fas fa-credit-card"></i></span></div>
            <div className="ahf-stat-num">₹{v.total.toLocaleString('en-IN')}</div>
            <div className="ahf-stat-label">{m}</div>
            <div className="ahf-stat-sub">{v.count} order{v.count === 1 ? '' : 's'}</div>
          </div>
        ))}
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>Transactions</h3><p>Latest payment activity</p></div></div>
        {loading ? <LoadingList /> : (
          <DataTable
            columns={[
              { key: 'id', header: 'Order', render: (o) => <strong>#{o._id.slice(-6).toUpperCase()}</strong> },
              { key: 'c', header: 'Customer', render: (o) => <span>{o.customerInfo?.name || '—'}</span> },
              { key: 'm', header: 'Method', render: (o) => <StatusBadge status={o.paymentMethod} /> },
              { key: 'a', header: 'Amount', render: (o) => <span className="ahf-amt">₹{Number(o.total).toLocaleString('en-IN')}</span> },
              { key: 's', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'd', header: 'Date', render: (o) => <span>{o.date}</span> },
            ]}
            rows={orders.slice(0, 30)}
            emptyText="No payment records yet."
          />
        )}
      </div>
    </ModuleShell>
  );
}
