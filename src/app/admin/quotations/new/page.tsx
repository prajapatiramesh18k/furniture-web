'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell } from '@/components/admin/ModuleBits';
import { AdminToast } from '@/components/admin/AdminUI';
import QuotationMakerPage from '@/app/quotation-maker/page';

type VisitRow = {
  _id: string;
  customerName: string;
  phone?: string;
  address?: string;
  visitDate: string;
  status?: string;
  quoteStatus?: string;
  requirements?: string;
  notes?: string;
};

function RequestList() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [toast, setToast] = useState('');

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const load = () => {
    setLoading(true);
    fetch('/api/site-visits', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setVisits(Array.isArray(d?.visits) ? d.visits : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'New Quotation | Requests';
    load();
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return visits.filter((v) => {
      const qs = String(v.quoteStatus || 'pending');
      if (filter !== 'all' && qs !== filter) return false;
      if (fromDate || toDate) {
        const d = new Date(v.visitDate);
        if (Number.isNaN(d.getTime())) return false;
        if (fromDate && d < new Date(`${fromDate}T00:00:00`)) return false;
        if (toDate && d > new Date(`${toDate}T23:59:59`)) return false;
      }
      if (!s) return true;
      return `${v.customerName || ''} ${v.phone || ''} ${v.address || ''} ${v.requirements || ''}`.toLowerCase().includes(s);
    });
  }, [visits, q, filter, fromDate, toDate]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, filter, fromDate, toDate]);

  const toggle = async (e: React.MouseEvent, v: VisitRow) => {
    e.stopPropagation();
    const next = String(v.quoteStatus || 'pending') === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v._id, quoteStatus: next }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Update failed');
      setVisits((list) => list.map((x) => (x._id === v._id ? { ...x, quoteStatus: next } : x)));
      flash(`Marked ${next} — ${v.customerName}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const isVisitDone = (v: VisitRow) => String(v.status || 'scheduled') === 'completed';

  const openMaker = (v: VisitRow) => {
    if (!isVisitDone(v)) {
      flash(`Complete the site visit for ${v.customerName} first — only done visits can open the Quotation Maker.`);
      return;
    }
    router.push(`/admin/quotations/new?visit=${v._id}`);
  };

  return (
    <ModuleShell
      title="New Quotation"
      sub="Only done site visits can open the Quotation Maker — click any done row with details autofilled."
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onChange={(f, t) => { setFromDate(f); setToDate(t); }}
          />
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <AdminToast message={toast} />

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Quotation status filter"
              value={filter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
              ]}
              onChange={(v) => setFilter(v as typeof filter)}
            />
            <button
              className="ahf-btn ahf-btn-primary ahf-btn-sm"
              onClick={() => router.push('/admin/quotations/new?manual=1')}
              style={{ marginLeft: 'auto' }}
            >
              <i className="fas fa-plus"></i> Create
            </button>
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Requests ({rows.length})</h3><p>Done visits open the maker autofilled</p></div>
        </div>
        <DataTable
            columns={[
              {
                key: 'd', header: 'Date', render: (v) => (
                  <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                ),
              },
              {
                key: 'c', header: 'Customer', render: (v) => (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{v.customerName}</div>
                    <div style={{ fontSize: 11.5, color: '#8a7a66' }}>{v.phone || '—'}</div>
                  </div>
                ),
              },
              {
                key: 'r', header: 'Requirement', render: (v) => (
                  <span style={{ fontSize: 12 }}>{v.requirements || '—'}</span>
                ),
              },
              { key: 'vs', header: 'Visit', render: (v) => <StatusBadge status={String(v.status || 'scheduled').replace(/_/g, ' ')} /> },
              { key: 'qs', header: 'Quotation', render: (v) => <StatusBadge status={String(v.quoteStatus || 'pending')} /> },
              {
                key: 'a', header: 'Action', render: (v) => (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      className="ahf-btn ahf-btn-primary ahf-btn-sm"
                      disabled={!isVisitDone(v)}
                      title={isVisitDone(v) ? 'Open the Quotation Maker' : 'Complete the site visit first'}
                      style={!isVisitDone(v) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      onClick={(e) => { e.stopPropagation(); openMaker(v); }}
                    >
                      <i className="fas fa-fill-drip"></i> Make
                    </button>
                    <button
                      className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                      onClick={(e) => toggle(e, v)}
                      title={String(v.quoteStatus || 'pending') === 'pending' ? 'Mark completed' : 'Mark pending'}
                    >
                      {String(v.quoteStatus || 'pending') === 'pending' ? 'Mark Done' : 'Reopen'}
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paged}
            emptyText="No requests in this view yet."
            onRowClick={openMaker}
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}

function AdminNewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const edit = params.get('edit');
  const visit = params.get('visit');
  const manual = params.get('manual');

  const inMaker = Boolean(edit || visit || manual);

  useEffect(() => {
    if (!inMaker) document.title = 'New Quotation | Requests';
  }, [inMaker]);

  if (inMaker) {
    return (
      <div>
        <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            className="ahf-btn ahf-btn-ghost ahf-btn-sm"
            onClick={() => router.push('/admin/quotations/new')}
          >
            <i className="fas fa-arrow-left"></i> Back to requests
          </button>
          {visit && <span style={{ fontSize: 12.5, color: '#8a7a66' }}>Autofilling from site visit…</span>}
          {edit && <span style={{ fontSize: 12.5, color: '#8a7a66' }}>Editing quotation…</span>}
        </div>
        <QuotationMakerPage />
      </div>
    );
  }

  return <RequestList />;
}

/** List-first New Quotation: requests table, row click opens maker autofilled. */
export default function AdminNewQuotationPage() {
  return (
    <Suspense>
      <AdminNewInner />
    </Suspense>
  );
}
