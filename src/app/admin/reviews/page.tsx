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
  const { data, loading, refresh } = useAdminFetch<{ reviews: R[] }>('/api/admin/reviews');
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
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

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  // Approving is what makes a review appear on the live "What Our Clients Say" wall.
  const setApproval = async (r: R, approved: boolean) => {
    setBusyId(r._id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r._id, approved }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Update failed');
      refresh();
      flash(approved ? `Approved — “${r.name}” now shows on the live site` : `Moved “${r.name}” back to pending`);
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const removeReview = async (r: R) => {
    if (!window.confirm(`Delete review by ${r.name}?`)) return;
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(r._id)}`, { method: 'DELETE' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      refresh();
      flash(`Deleted review by ${r.name}`);
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

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
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#8a7a66' }}>
            <i className="fas fa-circle-info"></i> Only <strong>Approved</strong> reviews appear on the live “What Our Clients Say” wall. New submissions arrive as <strong>Pending</strong> — approve them here.
          </p>
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
              {
                key: 'a', header: 'Action', render: (r) => (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.approved ? (
                      <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" disabled={busyId === r._id} onClick={(e) => { e.stopPropagation(); setApproval(r, false); }}>
                        <i className="fas fa-eye-slash"></i> Unapprove
                      </button>
                    ) : (
                      <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={busyId === r._id} onClick={(e) => { e.stopPropagation(); setApproval(r, true); }}>
                        <i className="fas fa-check"></i> Approve
                      </button>
                    )}
                    <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" disabled={busyId === r._id} onClick={(e) => { e.stopPropagation(); removeReview(r); }} style={{ color: '#b3273a' }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paged}
            emptyText="No reviews."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
