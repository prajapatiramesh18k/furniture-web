'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface O { _id: string; total: number; paymentMethod: string; status: string; date: string; customerInfo?: { name: string } }

export default function AdminPayments() {
  const { data, loading } = useAdminFetch<{ orders: O[] }>('/api/orders');
  const [q, setQ] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const orders = useMemo(() => data?.orders || [], [data]);
  const { byMethod, methods } = useMemo(() => {
    const m: Record<string, { count: number; total: number }> = {};
    for (const o of orders) {
      const k = o.paymentMethod || 'Unknown';
      m[k] = m[k] || { count: 0, total: 0 };
      m[k].count += 1;
      m[k].total += Number(o.total) || 0;
    }
    return { byMethod: m, methods: Object.keys(m).sort((a, b) => a.localeCompare(b)) };
  }, [orders]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (methodFilter !== 'all' && (o.paymentMethod || 'Unknown') !== methodFilter) return false;
      if (!s) return true;
      return `${o._id} ${o.customerInfo?.name || ''} ${o.paymentMethod} ${o.status}`.toLowerCase().includes(s);
    });
  }, [orders, q, methodFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, methodFilter]);

  return (
    <ModuleShell
      title="Payments"
      sub="Payment methods used across real orders"
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
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
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Method filter"
              value={methodFilter}
              options={[{ value: 'all', label: 'All Methods' }, ...methods.map((m) => ({ value: m, label: m }))]}
              onChange={setMethodFilter}
            />
          </div>
        </div>
      </div>
      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head"><div><h3>Transactions</h3><p>Latest payment activity</p></div></div>
        <DataTable
            columns={[
              { key: 'id', header: 'Order', render: (o) => <strong>#{o._id.slice(-6).toUpperCase()}</strong> },
              { key: 'c', header: 'Customer', render: (o) => <span>{o.customerInfo?.name || '—'}</span> },
              { key: 'm', header: 'Method', render: (o) => <StatusBadge status={o.paymentMethod} /> },
              { key: 'a', header: 'Amount', render: (o) => <span className="ahf-amt">₹{Number(o.total).toLocaleString('en-IN')}</span> },
              { key: 's', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'd', header: 'Date', render: (o) => <span>{o.date}</span> },
            ]}
            rows={paged}
            emptyText="No payment records yet."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
