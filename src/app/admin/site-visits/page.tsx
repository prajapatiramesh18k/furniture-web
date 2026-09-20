'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminField, AdminFormGrid, AdminModalFooter } from '@/components/admin/AdminUI';

interface Visit {
  _id: string;
  customerName: string;
  phone?: string;
  address?: string;
  visitDate: string;
  status?: string;
  requirements?: string;
  createdAt: string;
}

const STATUSES = ['scheduled', 'completed', 'rescheduled', 'cancelled'] as const;

export default function AdminSiteVisits() {
  const { data, loading, refresh } = useAdminFetch<{ visits: Visit[] }>('/api/site-visits');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const visits = useMemo(() => data?.visits || [], [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: visits.length };
    for (const v of visits) {
      const s = String(v.status || 'scheduled');
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [visits]);

  const openCount = (counts.scheduled || 0) + (counts.rescheduled || 0);

  const inVisitRange = (iso?: string) => {
    if (!fromDate && !toDate) return true;
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    if (fromDate && d < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && d > new Date(`${toDate}T23:59:59`)) return false;
    return true;
  };

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return visits.filter((v) => {
      if (statusFilter !== 'all' && String(v.status || 'scheduled') !== statusFilter) return false;
      if (!inVisitRange(v.visitDate)) return false;
      if (!s) return true;
      return `${v.customerName} ${v.phone || ''} ${v.address || ''}`.toLowerCase().includes(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, q, statusFilter, fromDate, toDate]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter, fromDate, toDate]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const openEditor = (v: Visit) => {
    if (openId === v._id) {
      setOpenId(null);
      return;
    }
    setOpenId(v._id);
    setNewDate(v.visitDate ? new Date(v.visitDate).toISOString().slice(0, 16) : '');
  };

  const setStatus = async (v: Visit, status: 'completed' | 'rescheduled' | 'cancelled', visitDate?: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v._id, status, ...(visitDate ? { visitDate } : {}) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Update failed');
      setOpenId(null);
      refresh();
      flash(status === 'completed' ? `Visit done — ${v.customerName}` : `Visit cancelled — ${v.customerName}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const reschedule = async (v: Visit) => {
    if (!newDate) return alert('Pick a new visit date & time');
    await setStatus(v, 'rescheduled', new Date(newDate).toISOString());
  };

  return (
    <ModuleShell
      title="Site Visits"
      sub={`${visits.length} total · ${openCount} upcoming · ${counts.completed || 0} done`}
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
      {toast && <AdminToast message={toast} />}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Visit status filter"
              value={statusFilter}
              options={[
                { value: 'all', label: `All Statuses (${counts.all || 0})` },
                ...STATUSES.map((s) => ({
                  value: s,
                  label: `${s.replace('_', ' ')} (${counts[s] || 0})`,
                })),
              ]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Visits ({rows.length} of {visits.length})</h3><p>Click a row to update status</p></div>
        </div>
        <DataTable
            columns={[
              {
                key: 'v', header: 'Visit', render: (v) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{v.customerName}</div>
                    <div style={{ fontSize: 12.5, color: '#8a7a66' }}>
                      {v.visitDate ? new Date(v.visitDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      {v.phone ? ` · ${v.phone}` : ''}
                    </div>
                  </div>
                ),
              },
              { key: 's', header: 'Status', render: (v) => <StatusBadge status={String(v.status || 'scheduled').replace('_', ' ')} /> },
              {
                key: 'a', header: 'Action', render: (v) => (
                  <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); openEditor(v); }}>
                    <i className={`fas ${openId === v._id ? 'fa-chevron-up' : 'fa-pen'}`}></i> {openId === v._id ? 'Hide' : 'Work'}
                  </button>
                ),
              },
            ]}
            rows={paged}
            emptyText="No site visits yet."
            onRowClick={openEditor}
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>

      {openId && (() => {
        const v = visits.find((x) => x._id === openId);
        if (!v) return null;
        const cur = String(v.status || 'scheduled');
        const closed = ['completed', 'cancelled'].includes(cur);
        return (
          <AdminModal
            eyebrow="SITE VISIT"
            title={v.customerName}
            subtitle={`${v.visitDate ? new Date(v.visitDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}${v.phone ? ` · ${v.phone}` : ''}`}
            onClose={() => !saving && setOpenId(null)}
            busy={saving}
          >
            {v.requirements && (
              <p style={{ margin: '0 0 16px', fontSize: 13, background: '#faf7ef', border: '1px solid #eee3cd', borderRadius: 10, padding: '10px 12px', whiteSpace: 'pre-wrap' }}>{v.requirements}</p>
            )}
            <AdminFormGrid>
              <AdminField label="Status">
                <StatusBadge status={cur.replace(/_/g, ' ')} />
              </AdminField>
              <AdminField label="Address">
                <span style={{ fontSize: 13 }}>{v.address || '—'}</span>
              </AdminField>
            </AdminFormGrid>
            {!closed && (
              <>
                <AdminField label="Reschedule to" style={{ marginBottom: 16 }}>
                  <input type="datetime-local" className="ahf-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </AdminField>
                <AdminModalFooter>
                  <button className="ahf-btn ahf-btn-ghost" disabled={saving} onClick={() => reschedule(v)}>
                    <i className="fas fa-calendar-days"></i> {saving ? 'Saving…' : 'Reschedule'}
                  </button>
                  <button className="ahf-btn ahf-btn-ghost" disabled={saving} onClick={() => setStatus(v, 'cancelled')}>
                    <i className="fas fa-ban"></i> Cancel visit
                  </button>
                  <button className="ahf-btn ahf-btn-primary" disabled={saving} onClick={() => setStatus(v, 'completed')}>
                    <i className="fas fa-check"></i> {saving ? 'Saving…' : 'Mark done'}
                  </button>
                </AdminModalFooter>
              </>
            )}
          </AdminModal>
        );
      })()}
    </ModuleShell>
  );
}
