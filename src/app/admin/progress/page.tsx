'use client';

import { useMemo, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Update {
  _id: string;
  floor?: string;
  room?: string;
  category: string;
  notes?: string;
  updateDate: string;
  projectId?: { _id: string; name: string } | string | null;
}

export default function AdminProgressHub() {
  const { data, loading } = useAdminFetch<{ updates: Update[] }>('/api/progress');
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

  const updates = useMemo(() => data?.updates || [], [data]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return updates.filter((u) => {
      if (statusFilter !== 'all' && u.category !== statusFilter) return false;
      if (!s) return true;
      return `${u.notes || ''} ${u.room || ''} ${u.floor || ''} ${u.category} ${u.projectId ? (typeof u.projectId === 'object' ? u.projectId.name : '') : ''}`.toLowerCase().includes(s);
    });
  }, [updates, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Site Progress"
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
              options={[{ value: 'all', label: 'All Categories' }, { value: 'notes', label: 'Notes' }, { value: 'material', label: 'Material' }, { value: 'labour', label: 'Labour' }, { value: 'design', label: 'Design' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              {
                key: 'u', header: 'Update', render: (u) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{[u.floor, u.room].filter(Boolean).join(' · ') || u.category}</div>
                    <div style={{ fontSize: 12.5, color: '#555' }}>{u.notes || '—'}</div>
                    <div style={{ fontSize: 12, color: '#8a7a66' }}>{new Date(u.updateDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                ),
              },
              { key: 'p', header: 'Project', render: (u) => (u.projectId && typeof u.projectId === 'object' ? <span>{u.projectId.name}</span> : <span>—</span>) },
              { key: 'c', header: 'Category', render: (u) => <StatusBadge status={u.category} /> },
            ]}
            rows={paged}
            emptyText="No progress updates yet."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
