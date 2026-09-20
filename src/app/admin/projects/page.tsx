'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Project {
  _id: string;
  name: string;
  customer: { name: string; phone: string };
  status?: string;
  budgetValue?: number;
}

const STATUSES = ['planning', 'design', 'procurement', 'execution', 'finishing', 'completed', 'on_hold', 'cancelled'] as const;

export default function AdminProjects() {
  const router = useRouter();
  const { data, loading } = useAdminFetch<{ projects: Project[] }>('/api/projects');
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

  const projects = useMemo(() => data?.projects || [], [data]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!s) return true;
      return `${p.name} ${p.customer?.name || ''}`.toLowerCase().includes(s);
    });
  }, [projects, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  const openProject = (p: Project) => {
    router.push(`/admin/projects/${p._id}`);
  };

  return (
    <ModuleShell
      title="Projects"
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
              label="Project status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, ...STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Projects ({rows.length})</h3><p>Click a row to open the project workspace</p></div>
        </div>
        <DataTable
            columns={[
              { key: 'p', header: 'Project', render: (p) => (
                <div><strong>{p.name}</strong>
                <div style={{ fontSize: 12, color: '#8a7a66' }}>{p.customer?.name || ''}</div></div>
              ), },
              { key: 'b', header: 'Budget', render: (p) => <span className="ahf-amt">₹{Number(p.budgetValue || 0).toLocaleString('en-IN')}</span> },
              { key: 's', header: 'Status', render: (p) => <StatusBadge status={(p.status || 'planning').replace(/_/g, ' ')} /> },
              {
                key: 'a', header: 'Action', render: (p) => (
                  <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); openProject(p); }}>
                    <i className="fas fa-arrow-right"></i> Open
                  </button>
                ),
              },
            ]}
            rows={paged}
            emptyText="No projects yet."
            onRowClick={openProject}
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
