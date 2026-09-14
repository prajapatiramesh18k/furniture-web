'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
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

  const payments = useMemo(() => [...new Set(orders.map((o) => o.paymentMethod).filter(Boolean))], [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      if (q && !`${o.customerInfo?.name} ${o.customerInfo?.phone} ${o._id}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (payFilter !== 'all' && o.paymentMethod !== payFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, payFilter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
      setSelected((s) => (s && s._id === id ? { ...s, status } : s));
      setToast(`Order marked as ${status}`);
      setTimeout(() => setToast(''), 2500);
    }
  };

  return (
    <div>
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}

      <div className="ahf-pagehead">
        <div>
          <p>{orders.length} total orders</p>
          <h2>Orders</h2>
        </div>
        <button className="ahf-btn ahf-btn-ghost" onClick={load}>
          <i className="fas fa-rotate-right"></i> Refresh
        </button>
      </div>

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div className="ahf-toolbar" style={{ marginBottom: 0 }}>
            <div className="ahf-search-inline">
              <i className="fas fa-search"></i>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, phone, order ID…" />
            </div>
            <select className="ahf-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="ahf-select" value={payFilter} onChange={(e) => setPayFilter(e.target.value)}>
              <option value="all">All Payments</option>
              {payments.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="ahf-panel">
        <div className="ahf-panel-head">
          <div><h3>Recent Orders ({filtered.length})</h3></div>
        </div>
        {loading ? (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="ahf-skel" style={{ height: 56 }} />)}
          </div>
        ) : (
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
              { key: 'prod', header: 'Products', render: (o) => <span title={(o.items || []).map((i) => `${i.name} ×${i.quantity}`).join(', ')}>{(o.items || []).length} item{(o.items || []).length === 1 ? '' : 's'}</span> },
              { key: 'amt', header: 'Amount', render: (o) => <span className="ahf-amt">₹{Number(o.total).toLocaleString('en-IN')}</span> },
              { key: 'pay', header: 'Payment Status', render: (o) => <StatusBadge status={/upi|card|paid|razorpay/i.test(o.paymentMethod || '') ? 'Paid' : o.paymentMethod} /> },
              {
                key: 'status', header: 'Order Status',
                render: (o) => (
                  <select
                    className="ahf-select"
                    style={{ padding: '6px 8px', fontSize: 12 }}
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ),
              },
              { key: 'date', header: 'Date', render: (o) => <span style={{ whiteSpace: 'nowrap' }}>{o.date}</span> },
              {
                key: 'actions', header: 'Actions',
                render: (o) => (
                  <div className="ahf-row-actions">
                    <button className="ahf-mini-btn" title="View details" onClick={() => setSelected(o)}><i className="fas fa-eye"></i></button>
                  </div>
                ),
              },
            ]}
            rows={filtered}
            emptyText="No orders found."
            minWidth={980}
          />
        )}
      </div>

      {selected && (
        <div style={modalWrap} onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} style={modalCard}>
            <h3 style={{ margin: '0 0 4px' }}>Order #{selected._id.slice(-6).toUpperCase()}</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13, margin: '0 0 14px' }}>{selected.date}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <StatusBadge status={selected.status} />
              <StatusBadge status={selected.paymentMethod} />
            </div>
            <p style={{ fontSize: 13, margin: '0 0 4px' }}><strong>{selected.customerInfo?.name}</strong> · {selected.customerInfo?.phone}</p>
            <p style={{ fontSize: 13, color: 'var(--ahf-muted)', margin: '0 0 14px' }}>{selected.customerInfo?.address}, {selected.customerInfo?.city}</p>
            {(selected.items || []).map((it, i) => (
              <div className="ahf-seller" key={i}>
                <div>
                  <div className="ahf-s-name">{it.name}</div>
                  <div className="ahf-s-sub">Qty {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}</div>
                </div>
                <span className="ahf-s-rev">₹{(Number(it.price) * Number(it.quantity)).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontWeight: 800 }}>
              <span>Total ({selected.paymentMethod})</span>
              <span>₹{Number(selected.total).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="ahf-btn ahf-btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(10,18,36,.55)', zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};

const modalCard: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 22, width: 'min(560px, 100%)',
  maxHeight: '90vh', overflowY: 'auto',
};
