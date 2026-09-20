'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface R { _id: string; name: string; location: string; rating: number; text: string; date: string; approved: boolean }

export default function AdminReviews() {
  const { data, loading } = useAdminFetch<{ reviews: R[] }>('/api/admin/reviews');
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

  const reviews: R[] = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.reviews || [];
    if (statusFilter === 'pending') return list.filter((r) => !r.approved);
    if (statusFilter === 'approved') return list.filter((r) => r.approved);
    return list;
  }, [data, statusFilter]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return reviews.filter((r) => {
      if (!s) return true;
      return `${r.name} ${r.location} ${r.text}`.toLowerCase().includes(s);
    });
  }, [reviews, q]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Reviews"
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
              label="Status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Reviews' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              { key: 'n', header: 'Reviewer', render: (r) => (
                <div className="ahf-cust"><span className="ahf-avatar">{(r.name || '?')[0].toUpperCase()}</span>
                <div><strong>{r.name}</strong><span>{r.location}</span></div></div>) },
              { key: 'r', header: 'Rating', render: (r) => <span style={{ color: '#d9930d' }}>{'★'.repeat(Math.round(r.rating || 0))}</span> },
              { key: 't', header: 'Text', render: (r) => <p style={{ fontSize: 13, margin: 0 }}>“{r.text}”</p> },
              { key: 'd', header: 'Date', render: (r) => <span>{r.date}</span> },
              { key: 's', header: 'Status', render: (r) => <StatusBadge status={r.approved ? 'Approved' : 'Pending'} /> },
            ]}
            rows={paged}
            emptyText="No reviews."
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
