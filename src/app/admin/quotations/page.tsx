'use client';

import { useMemo, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminField, AdminModalFooter } from '@/components/admin/AdminUI';
import ConfirmationModal from '@/components/ConfirmationModal';
import Link from 'next/link';

type QuotationDoc = {
  _id: string;
  customer: { name: string; phone: string };
  project: { quoteNo: string; type: string };
  createdAt: string;
  status?: string;
};

type QuotationFull = {
  _id: string;
  customer?: { name?: string; phone?: string; email?: string; address?: string };
  project?: { quoteNo?: string; type?: string; date?: string; validTill?: string };
  items?: { name?: string; quantity?: number; rate?: number; unit?: string }[];
  totals?: { subtotal?: number; gst?: number; total?: number; totalDiscount?: number };
  status?: string;
  rejectReason?: string;
  decidedAt?: string | null;
  decidedBy?: string;
  terms?: string;
  createdAt?: string;
};

const inr = (n: number | undefined) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function AdminQuotations() {
  const { data, loading, refresh } = useAdminFetch<{ quotations: QuotationDoc[] }>('/api/quotations');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<QuotationFull | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [acting, setActing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const quotations = useMemo(() => data?.quotations || [], [data]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return quotations.filter((x) => {
      if (statusFilter !== 'all' && String(x.status || 'sent') !== statusFilter) return false;
      if (!s) return true;
      return `${x.project?.quoteNo || ''} ${x.customer?.name || ''}`.toLowerCase().includes(s);
    });
  }, [quotations, q, statusFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, statusFilter]);

  const openDetail = async (x: QuotationDoc) => {
    if (openId === x._id) {
      setOpenId(null);
      return;
    }
    setOpenId(x._id);
    setDetail(null);
    setDetailError('');
    setRejectOpen(false);
    setReason('');
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/quotations?id=${x._id}`, { cache: 'no-store' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to load quotation');
      setDetail(d.quotation as QuotationFull);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load quotation');
    } finally {
      setDetailLoading(false);
    }
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const transition = async (status: 'sent' | 'approved' | 'rejected', rejectReason?: string) => {
    if (!detail) return;
    if (status === 'rejected' && !String(rejectReason || '').trim()) {
      alert('Please enter a reject reason');
      return;
    }
    setActing(true);
    try {
      const res = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detail._id, status, ...(rejectReason ? { rejectReason } : {}) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Update failed');
      setDetail(d.quotation as QuotationFull);
      setRejectOpen(false);
      setReason('');
      refresh();
      flash(
        status === 'approved'
          ? `Approved — ${d.quotation?.project?.quoteNo || ''}${d.projectId ? ' · project created' : ''}`
          : status === 'rejected'
            ? `Rejected — ${d.quotation?.project?.quoteNo || ''}`
            : `Moved to sent — ${d.quotation?.project?.quoteNo || ''}`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActing(false);
    }
  };

  const removeQuotation = async () => {
    if (!detail) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotations?id=${detail._id}`, { method: 'DELETE' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      setConfirmDelete(false);
      setOpenId(null);
      setDetail(null);
      refresh();
      flash('Quotation deleted');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModuleShell
      title="Quotations"
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
      <AdminToast message={toast} />
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Quotation status filter"
              value={statusFilter}
              options={[{ value: 'all', label: 'All Statuses' }, { value: 'sent', label: 'Sent' }, { value: 'draft', label: 'Draft' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]}
              onChange={(v) => setStatusFilter(v as string)}
            />
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Saved quotations ({rows.length})</h3><p>Click a row to see all details</p></div>
        </div>
        <DataTable
            columns={[
              { key: 'date', header: 'Date', render: (q) => <span>{new Date(q.createdAt).toLocaleDateString('en-IN')}</span> },
              { key: 'qno', header: 'Quote No', render: (q) => <strong>{q.project?.quoteNo}</strong> },
              { key: 'cust', header: 'Customer', render: (q) => <span>{q.customer?.name || '—'}</span> },
              { key: 'type', header: 'Project Type', render: (q) => <span>{q.project?.type || '—'}</span> },
              { key: 's', header: 'Status', render: (q) => <StatusBadge status={q.status || 'sent'} /> },
              {
                key: 'a', header: 'Action', render: (q) => (
                  <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); openDetail(q); }}>
                    <i className={`fas ${openId === q._id ? 'fa-chevron-up' : 'fa-eye'}`}></i> {openId === q._id ? 'Hide' : 'View'}
                  </button>
                ),
              },
            ]}
            rows={paged}
            emptyText="No quotations found."
            onRowClick={openDetail}
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>

      {openId && (
        <AdminModal
          eyebrow="QUOTATION"
          title={detail?.project?.quoteNo || 'Loading…'}
          subtitle={detail ? `${detail.customer?.name || ''}${detail.customer?.phone ? ` · ${detail.customer.phone}` : ''}` : undefined}
          onClose={() => { setOpenId(null); setDetail(null); setDetailError(''); }}
          busy={detailLoading}
        >
          {detailLoading ? (
            <LoadingList rows={4} />
          ) : detailError ? (
            <p style={{ color: 'var(--ahf-danger)', fontSize: 13.5, fontWeight: 600 }}>{detailError}</p>
          ) : detail ? (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                <StatusBadge status={detail.status || 'sent'} />
                <span style={{ fontSize: 12.5, color: '#8a7a66' }}>
                  {detail.project?.type || '—'}
                  {detail.project?.date ? ` · ${new Date(detail.project.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  {detail.project?.validTill ? ` · valid till ${new Date(detail.project.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </span>
              </div>
              {(detail.items || []).length > 0 && (
                <div className="ahf-tablewrap" style={{ marginBottom: 16 }}>
                  <table className="ahf-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map((it, i) => (
                        <tr key={i}>
                          <td><strong>{it.name || '—'}</strong>{it.unit ? <span style={{ color: '#8a7a66', fontSize: 12 }}> · {it.unit}</span> : null}</td>
                          <td>{it.quantity ?? 1}</td>
                          <td>{inr(Number(it.rate) || 0)}</td>
                          <td style={{ textAlign: 'right' }}><span className="ahf-amt">{inr((Number(it.quantity) || 1) * (Number(it.rate) || 0))}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8a7a66' }}>Subtotal</span><strong>{inr(detail.totals?.subtotal)}</strong></div>
                {(detail.totals?.totalDiscount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8a7a66' }}>Discount</span><strong>− {inr(detail.totals?.totalDiscount)}</strong></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8a7a66' }}>GST</span><strong>{inr(detail.totals?.gst)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}><span>Total</span><span className="ahf-amt">{inr(detail.totals?.total)}</span></div>
              </div>
              {detail.status === 'rejected' && detail.rejectReason && (
                <p style={{ margin: '0 0 16px', fontSize: 13, background: '#fbe7e3', border: '1px solid #f0c4bc', borderRadius: 10, padding: '10px 12px' }}>
                  <strong>Reject reason:</strong> {detail.rejectReason}
                </p>
              )}
              {(() => {
                const cur = String(detail.status || 'sent');
                return (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                    {cur === 'draft' && (
                      <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={acting} onClick={() => transition('sent')}>
                        <i className="fas fa-paper-plane"></i> {acting ? 'Saving…' : 'Send'}
                      </button>
                    )}
                    {cur === 'sent' && (
                      <>
                        <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={acting} onClick={() => transition('approved')}>
                          <i className="fas fa-check"></i> {acting ? 'Saving…' : 'Approve'}
                        </button>
                        <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" disabled={acting} onClick={() => setRejectOpen((v) => !v)}>
                          <i className="fas fa-xmark"></i> Reject
                        </button>
                      </>
                    )}
                    {(cur === 'approved' || cur === 'rejected') && (
                      <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" disabled={acting} onClick={() => transition('sent')}>
                        <i className="fas fa-rotate-left"></i> {acting ? 'Saving…' : 'Reopen to sent'}
                      </button>
                    )}
                    <button
                      className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                      disabled={acting || deleting}
                      onClick={() => setConfirmDelete(true)}
                      style={{ marginLeft: 'auto' }}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                );
              })()}
              {rejectOpen && String(detail.status || 'sent') === 'sent' && (
                <AdminField label="Reject reason *" style={{ marginBottom: 16 }}>
                  <textarea
                    className="ahf-input"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why was this quotation rejected…"
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={acting} onClick={() => transition('rejected', reason)}>
                      <i className="fas fa-check"></i> {acting ? 'Saving…' : 'Confirm reject'}
                    </button>
                  </div>
                </AdminField>
              )}
              <AdminModalFooter>
                <Link href="/admin/quotations/new" className="ahf-btn ahf-btn-ghost" onClick={() => { setOpenId(null); }}>
                  <i className="fas fa-plus"></i> New quotation
                </Link>
                <Link href={`/admin/quotations/new?edit=${detail._id}`} className="ahf-btn ahf-btn-ghost">
                  <i className="fas fa-pen"></i> Edit in maker
                </Link>
                <Link href={`/admin/quotations/new?edit=${detail._id}`} className="ahf-btn ahf-btn-primary" title="Opens the quotation maker — use Download PDF there">
                  <i className="fas fa-download"></i> Download PDF
                </Link>
              </AdminModalFooter>
            </>
          ) : null}
        </AdminModal>
      )}
      <ConfirmationModal
        isOpen={confirmDelete}
        message="Delete this quotation? This cannot be undone."
        confirmText={deleting ? 'Deleting…' : 'Yes, Delete'}
        confirmButtonVariant="danger"
        onConfirm={removeQuotation}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />
    </ModuleShell>
  );
}
