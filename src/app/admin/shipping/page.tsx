'use client';

import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface O { _id: string; total: number; status: string; date: string; customerInfo?: { name: string; city: string; address: string } }

export default function AdminShipping() {
  const { data, loading } = useAdminFetch<{ orders: O[] }>('/api/orders');
  const orders = data?.orders || [];
  const byCity: Record<string, number> = {};
  for (const o of orders) {
    const c = o.customerInfo?.city || 'Unknown';
    byCity[c] = (byCity[c] || 0) + 1;
  }

  return (
    <ModuleShell title="Shipping & Delivery" sub="Fulfilment pipeline from live orders">
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head"><div><h3>Deliveries by City</h3></div></div>
        {loading ? <LoadingList rows={2} /> : (
          <div className="ahf-panel-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(byCity).map(([c, n]) => (
              <span key={c} className="ahf-badge ahf-b-default" style={{ fontSize: 12.5, padding: '8px 14px' }}>
                <i className="fas fa-location-dot"></i> {c} · {n}
              </span>
            ))}
            {Object.keys(byCity).length === 0 && <p style={{ color: 'var(--ahf-muted)' }}>No shipments yet.</p>}
          </div>
        )}
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>Delivery Queue</h3><p>Update status from the Orders page</p></div></div>
        {loading ? <LoadingList /> : (
          <DataTable
            columns={[
              { key: 'id', header: 'Order', render: (o) => <strong>#{o._id.slice(-6).toUpperCase()}</strong> },
              { key: 'c', header: 'Ship To', render: (o) => <span>{o.customerInfo?.name} · {o.customerInfo?.city}</span> },
              { key: 'a', header: 'Address', render: (o) => <span style={{ fontSize: 12.5 }}>{o.customerInfo?.address || '—'}</span> },
              { key: 's', header: 'Delivery Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'd', header: 'Date', render: (o) => <span>{o.date}</span> },
            ]}
            rows={orders.slice(0, 30)}
            emptyText="No deliveries queued."
          />
        )}
      </div>
    </ModuleShell>
  );
}
