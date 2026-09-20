'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface O { _id: string; total: number; status: string; date: string; customerInfo?: { name: string; city: string; address: string } }

export default function AdminShipping() {
  const { data, loading } = useAdminFetch<{ orders: O[] }>('/api/orders');
  const orders = data?.orders || [];
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!s) return true;
      return `${o.customerInfo?.name} ${o.customerInfo?.city}`.toLowerCase().includes(s);
    });
  }, [orders, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Shipping & Delivery"
      sub=""
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <DateRangePicker fromDate={fromDate} toDate={toDate} onChange={(f, t) => { setFromDate(f); setToDate(t); }} />
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Delivery status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Statuses' }, { value: 'Pending', label: 'Pending' }, { value: 'Shipped', label: 'Shipped' }, { value: 'Delivered', label: 'Delivered' }, { value: 'Cancelled', label: 'Cancelled' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              { key: 'id', header: 'Order', render: (o) => <strong>#{o._id.slice(-6).toUpperCase()}</strong> },
              { key: 'c', header: 'Ship To', render: (o) => <span>{o.customerInfo?.name} · {o.customerInfo?.city}</span> },
              { key: 'a', header: 'Address', render: (o) => <span style={{ fontSize: 12.5 }}>{o.customerInfo?.address || '—'}</span> },
              { key: 's', header: 'Delivery Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'd', header: 'Date', render: (o) => <span>{o.date}</span> },
            ]}
            rows={paged}
            emptyText="No deliveries queued."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
