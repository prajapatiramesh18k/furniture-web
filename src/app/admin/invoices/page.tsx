'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import UIDropdown from '@/components/UIDropdown';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Invoice {
  _id: string;
  invoiceNo: string;
  total: number;
  paidTotal: number;
  status: string;
  issueDate: string;
  projectId?: { _id: string; name: string } | string | null;
}

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const projName = (i: Invoice) => (i.projectId && typeof i.projectId === 'object' ? i.projectId.name : '—');
const projId = (i: Invoice) => (i.projectId && typeof i.projectId === 'object' ? i.projectId._id : '');

export default function AdminInvoicesHub() {
  const { data, loading } = useAdminFetch<{ invoices: Invoice[] }>('/api/invoices');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled'>('all');

  const invoices = useMemo(() => data?.invoices || [], [data]);
  const live = useMemo(() => invoices.filter((i) => i.status !== 'cancelled'), [invoices]);
  const billed = live.reduce((s, i) => s + i.total, 0);
  const collected = live.reduce((s, i) => s + i.paidTotal, 0);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return invoices.filter((i) => {
      if (filter !== 'all' && i.status !== filter) return false;
      if (!s) return true;
      return `${i.invoiceNo} ${projName(i)}`.toLowerCase().includes(s);
    });
  }, [invoices, q, filter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, filter]);

  const STATUS_OPTS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <ModuleShell
      title="Invoices"
      sub={`${inr(billed)} billed · ${inr(collected)} collected · ${inr(billed - collected)} due`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
              value={filter}
              options={STATUS_OPTS}
              onChange={(v) => setFilter(v as typeof filter)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head"><div><h3>All invoices</h3><p>Create and manage them from inside each project</p></div></div>
        <DataTable
            columns={[
              {
                key: 'i', header: 'Invoice', render: (i) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.invoiceNo}</div>
                    <div style={{ fontSize: 12, color: '#8a7a66' }}>{new Date(i.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                ),
              },
              { key: 'p', header: 'Project', render: (i) => (projId(i) ? <Link href={`/admin/projects/${projId(i)}`}>{projName(i)}</Link> : <span>—</span>) },
              { key: 't', header: 'Total', render: (i) => <span className="ahf-amt">{inr(i.total)}</span> },
              { key: 'd', header: 'Due', render: (i) => <span className="ahf-amt">{inr(i.total - i.paidTotal)}</span> },
              { key: 's', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
            ]}
            rows={paged}
            emptyText="No invoices yet."
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
