'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Order {
  _id: string;
  customerInfo: { name: string; phone: string; address: string; city: string; email?: string };
  items: { name: string; price: number; quantity: number; image?: string }[];
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
}

const STATUSES = ['New Order', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Paid'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!s) return true;
      return `${o.customerInfo?.name} ${o.customerInfo?.phone} ${o._id}`.toLowerCase().includes(s);
    });
  }, [orders, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
      setToast(`Order marked as ${status}`);
      setTimeout(() => setToast(''), 2500);
    }
  };

  return (
    <ModuleShell
      title="Orders"
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
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Order status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
          columns={[
            { key: 'id', header: 'Order ID', render: (o) => <strong>#{o._id.slice(-6).toUpperCase()}</strong> },
            {
              key: 'cust', header: 'Customer',
              render: (o) => (
                <div className="ahf-cust">
                  <span className="ahf-avatar">{(o.customerInfo?.name || '?')[0].toUpperCase()}</span>
                  <div><strong>{o.customerInfo?.name}</strong><span>{o.customerInfo?.phone} · {o.customerInfo?.city}</span></div>
                </div>
              ),
            },
            { key: 'amt', header: 'Amount', render: (o) => <span className="ahf-amt">₹{Number(o.total).toLocaleString('en-IN')}</span> },
            { key: 'pay', header: 'Payment Status', render: (o) => <StatusBadge status={/upi|card|paid|razorpay/i.test(o.paymentMethod || '') ? 'Paid' : o.paymentMethod} /> },
            {
              key: 'status', header: 'Order Status',
              render: (o) => (
                <UIDropdown
                  label="Order status"
                  small
                  value={o.status}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                  onChange={(v) => updateStatus(o._id, v)}
                />
              ),
            },
            { key: 'date', header: 'Date', render: (o) => <span style={{ whiteSpace: 'nowrap' }}>{o.date}</span> },
          ]}
          rows={loading ? [] : paged}
          emptyText="No orders found."
          minWidth={980}
          onRowClick={() => {}}
          loading={loading}
        />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
