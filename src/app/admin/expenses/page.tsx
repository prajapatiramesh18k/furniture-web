'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Expense {
  _id: string;
  category: string;
  materialName?: string;
  notes?: string;
  amount: number;
  expenseDate: string;
}

const CATS = ['material', 'labour', 'transport', 'contractor', 'misc'] as const;

export default function AdminExpensesHub() {
  const { data, loading } = useAdminFetch<{ expenses: Expense[] }>('/api/expenses');
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

  const expenses = useMemo(() => data?.expenses || [], [data]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return expenses.filter((e) => {
      if (statusFilter !== 'all' && e.category !== statusFilter) return false;
      if (!s) return true;
      return `${e.materialName || ''} ${e.notes || ''}`.toLowerCase().includes(s);
    });
  }, [expenses, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  return (
    <ModuleShell
      title="Expenses"
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
              options={[{ value: 'all', label: 'All Categories' }, ...CATS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
            columns={[
              {
                key: 'e', header: 'Expense', render: (e) => (
                  <div>
                    <div><StatusBadge status={e.category} /> <strong>{e.materialName || '—'}</strong></div>
                    <div style={{ fontSize: 12, color: '#8a7a66' }}>{new Date(e.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                ),
              },
              { key: 'a', header: 'Amount', render: (e) => <span className="ahf-amt">₹{Number(e.amount).toLocaleString('en-IN')}</span> },
            ]}
            rows={paged}
            emptyText="No expenses recorded yet."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
