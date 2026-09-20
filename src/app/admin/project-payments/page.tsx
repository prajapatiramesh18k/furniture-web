'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Payment {
  _id: string;
  amount: number;
  method: string;
  paymentDate: string;
  notes?: string;
  invoiceId?: { invoiceNo: string } | null;
  projectId?: { _id: string; name: string } | string | null;
}

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const projName = (p: Payment) => (p.projectId && typeof p.projectId === 'object' ? p.projectId.name : '—');
const projId = (p: Payment) => (p.projectId && typeof p.projectId === 'object' ? p.projectId._id : '');

export default function AdminProjectPaymentsHub() {
  const { data, loading } = useAdminFetch<{ payments: Payment[] }>('/api/project-payments');
  const [q, setQ] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const payments = useMemo(() => data?.payments || [], [data]);
  const total = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const { byMethod, methods } = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of payments) m[p.method || 'Unknown'] = (m[p.method || 'Unknown'] || 0) + p.amount;
    return { byMethod: m, methods: Object.keys(m).sort((a, b) => a.localeCompare(b)) };
  }, [payments]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return payments.filter((p) => {
      if (methodFilter !== 'all' && (p.method || 'Unknown') !== methodFilter) return false;
      if (!s) return true;
      return `${p.method} ${p.notes || ''} ${projName(p)} ${p.invoiceId?.invoiceNo || ''}`.toLowerCase().includes(s);
    });
  }, [payments, q, methodFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, methodFilter]);

  return (
    <ModuleShell
      title="Project Payments"
      sub={`${inr(total)} collected from customers`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', display: 'grid', marginBottom: 16 }}>
        {Object.entries(byMethod).map(([m, v]) => (
          <div className="ahf-stat" key={m}>
            <div className="ahf-stat-num" style={{ fontSize: 18 }}>{inr(v)}</div>
            <div className="ahf-stat-label">{m}</div>
          </div>
        ))}
        {Object.keys(byMethod).length === 0 && (
          <div className="ahf-stat"><div className="ahf-stat-num" style={{ fontSize: 18 }}>{inr(0)}</div><div className="ahf-stat-label">No collections yet</div></div>
        )}
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
        <div className="ahf-panel-head"><div><h3>Collections</h3><p>Record new ones from inside each project</p></div></div>
        <DataTable
            columns={[
              {
                key: 'p', header: 'Payment', render: (p) => (
                  <div>
                    <div><strong>{inr(p.amount)}</strong> · {p.method}</div>
                    <div style={{ fontSize: 12, color: '#8a7a66' }}>
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {p.invoiceId?.invoiceNo ? ` · ${p.invoiceId.invoiceNo}` : ''}{p.notes ? ` · ${p.notes}` : ''}
                    </div>
                  </div>
                ),
              },
              { key: 'pr', header: 'Project', render: (p) => (projId(p) ? <Link href={`/admin/projects/${projId(p)}`}>{projName(p)}</Link> : <span>—</span>) },
              { key: 'm', header: 'Method', render: (p) => <StatusBadge status={p.method || 'Unknown'} /> },
            ]}
            rows={paged}
            emptyText="No project payments recorded yet."
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
