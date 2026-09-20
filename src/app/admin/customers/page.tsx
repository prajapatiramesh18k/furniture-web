'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface U { _id: string; name: string; email: string; role: string; phone: string; active: boolean; createdAt: string }

export default function AdminCustomers() {
  const { data, loading } = useAdminFetch<{ users: U[] }>('/api/admin/users');
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

  const users = useMemo(() => (data?.users || []).filter((u) => {
    const s = q.trim().toLowerCase();
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      if (u.active !== isActive) return false;
    }
    if (!s) return true;
    return `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(s);
  }), [data, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(users, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Customers"
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
              options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Cancelled' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              { key: 'n', header: 'Customer', render: (u) => (
                <div className="ahf-cust"><span className="ahf-avatar">{(u.name || '?')[0].toUpperCase()}</span>
                <div><strong>{u.name}</strong><span>{u.email}</span></div></div>) },
              { key: 'p', header: 'Phone', render: (u) => <span>{u.phone || '—'}</span> },
              { key: 'r', header: 'Role', render: (u) => <StatusBadge status={u.role} /> },
              { key: 's', header: 'Status', render: (u) => <StatusBadge status={u.active ? 'Active' : 'Cancelled'} /> },
              { key: 'd', header: 'Joined', render: (u) => <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</span> },
            ]}
            rows={paged}
            emptyText="No customers found."
          />
          loading={loading}
        />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={users.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
