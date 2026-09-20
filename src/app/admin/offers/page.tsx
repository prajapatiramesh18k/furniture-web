'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface P { _id: string; name: string; image: string; price: number; originalPrice: number; category: string }

export default function AdminOffers() {
  const { data, loading } = useAdminFetch<{ products: P[] }>('/api/admin/products');
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

  const deals = useMemo(() =>
    (data?.products || [])
      .filter((p) => Number(p.originalPrice) > Number(p.price))
      .map((p) => ({ ...p, off: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) }))
      .sort((a, b) => b.off - a.off),
    [data]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of deals) if (p.category) set.add(p.category);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [deals]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return deals.filter((p) => {
      if (statusFilter !== 'all' && p.category !== statusFilter) return false;
      if (!s) return true;
      return `${p.name} ${p.category}`.toLowerCase().includes(s);
    });
  }, [deals, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Offers & Discounts"
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
              label="Category filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c.replace(/-/g, ' ') }))]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              { key: 'p', header: 'Product', render: (p) => (
                <div className="ahf-prod-cell"><img src={p.image} alt={p.name} /><strong>{p.name}</strong></div>) },
              { key: 'c', header: 'Category', render: (p) => <span style={{ textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</span> },
              { key: 'mrp', header: 'MRP', render: (p) => <span style={{ textDecoration: 'line-through', color: 'var(--ahf-muted)' }}>₹{Number(p.originalPrice).toLocaleString('en-IN')}</span> },
              { key: 'sp', header: 'Offer Price', render: (p) => <span className="ahf-amt">₹{Number(p.price).toLocaleString('en-IN')}</span> },
              { key: 'off', header: 'Discount', render: (p) => <StatusBadge status={`${p.off}% OFF`} /> },
            ]}
            rows={paged}
            emptyText="No discounted products right now."
          />
          loading={loading}
        />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
