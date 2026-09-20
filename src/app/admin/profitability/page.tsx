'use client';

import { useMemo, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Project { _id: string; name: string; status?: string; budgetValue?: number; customer?: { name: string } }

export default function AdminProfitability() {
  const { data: pData, loading } = useAdminFetch<{ projects: Project[] }>('/api/projects');
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

  const projects = useMemo(() => pData?.projects || [], [pData]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!s) return true;
      return `${p.name} ${p.customer?.name || ''}`.toLowerCase().includes(s);
    });
  }, [projects, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Project Profitability"
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
              options={[{ value: 'all', label: 'All' }, { value: 'planning', label: 'Planning' }, { value: 'execution', label: 'Execution' }, { value: 'completed', label: 'Completed' }, { value: 'on_hold', label: 'On Hold' }, { value: 'cancelled', label: 'Cancelled' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              {
                key: 'p', header: 'Project', render: (p) => (
                  <div><strong>{p.name}</strong>
                  <div style={{ fontSize: 12, color: '#8a7a66' }}>{p.customer?.name || ''}</div></div>
                ),
              },
              { key: 'i', header: 'Budget', render: (p) => <span className="ahf-amt">₹{Number(p.budgetValue || 0).toLocaleString('en-IN')}</span> },
              { key: 's', header: 'Status', render: (p) => <StatusBadge status={(p.status || '—').replace(/_/g, ' ')} /> },
            ]}
            rows={paged}
            emptyText="No projects yet."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
