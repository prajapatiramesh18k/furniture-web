'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import DateRangePicker from '@/components/DateRangePicker';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  projectType?: string;
  message?: string;
  status?: string;
  source?: string;
  budget?: string;
  followUpAt?: string | null;
  notes?: string;
  assignedTo?: { _id: string; name: string } | string | null;
  createdAt: string;
}

interface Emp { _id: string; name: string }

const STATUSES = ['new', 'contacted', 'site_visit', 'proposal', 'quotation', 'won', 'lost'] as const;
type StatusFilter = 'all' | (typeof STATUSES)[number];

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  site_visit: 'Site Visit',
  proposal: 'Proposal',
  quotation: 'Quotation',
  won: 'Won',
  lost: 'Lost',
  converted: 'Won (legacy)',
};

const labelOf = (s?: string) => STATUS_LABEL[String(s || 'new')] || String(s || 'new');
const isClosed = (s?: string) => ['won', 'lost', 'converted'].includes(String(s || ''));

const toDateInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const isOverdue = (l: Lead) => {
  if (isClosed(l.status) || !l.followUpAt) return false;
  const d = new Date(l.followUpAt);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const assigneeName = (l: Lead) =>
  l.assignedTo && typeof l.assignedTo === 'object' ? l.assignedTo.name : '';

const assigneeId = (l: Lead) =>
  l.assignedTo && typeof l.assignedTo === 'object' ? l.assignedTo._id : '';

export default function AdminLeads() {
  const { data, loading, refresh } = useAdminFetch<Lead[]>('/api/contacts');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [fromDate, setFromDate] = useState(todayKey);
  const [toDate, setToDate] = useState(todayKey);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', address: '', projectType: '',
    message: '', source: '', budget: '', followUpAt: '',
  });
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [form, setForm] = useState({ status: 'new', assignedTo: '', followUpAt: '', source: '', budget: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    boldWord?: string;
    afterBold?: string;
    subtext?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ visitDate: '', requirements: '', notes: '' });

  // Assignee list — team module only; hide assignment when not permitted.
  useEffect(() => {
    fetch('/api/admin/employees?limit=500', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setEmps(list.filter((e: Emp) => e && e._id).map((e: Emp) => ({ _id: e._id, name: e.name })));
      })
      .catch(() => {});
  }, []);

  const leads = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const l of leads) {
      const s = String(l.status || 'new');
      const key = s === 'converted' ? 'won' : s;
      c[key] = (c[key] || 0) + 1;
    }
    return c;
  }, [leads]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) {
      const src = String(l.source || '').trim();
      if (src) set.add(src);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [leads]);

  // NOTE: date selection above is display-only for now — it does NOT
  // filter rows. Real date filtering will be added in future.
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== 'all') {
        const cur = String(l.status || 'new');
        const key = cur === 'converted' ? 'won' : cur;
        if (key !== filter) return false;
      }
      if (sourceFilter !== 'all') {
        const src = String(l.source || '').trim();
        if (sourceFilter === '__none__' ? src !== '' : src !== sourceFilter) return false;
      }
      if (assigneeFilter !== 'all') {
        const aid = assigneeId(l);
        if (assigneeFilter === '__none__' ? aid !== '' : aid !== assigneeFilter) return false;
      }
      if (!s) return true;
      return `${l.name} ${l.phone} ${l.email} ${l.projectType || ''} ${l.source || ''} ${l.message || ''}`.toLowerCase().includes(s);
    });
  }, [leads, q, filter, sourceFilter, assigneeFilter]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, filter, sourceFilter, assigneeFilter]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const clearCreateFieldError = (field: string) => {
    setCreateFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setCreateError(null);
  };

  const openCreateModal = () => {
    setCreateFieldErrors({});
    setCreateError(null);
    setCreateOpen(true);
  };

  const createLead = async () => {
    const name = newLead.name.trim();
    const email = newLead.email.trim();
    const message = newLead.message.trim();
    const digits = newLead.phone.replace(/\D/g, '');
    const cleanPhone = digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits.slice(0, 10);

    // Inline validation — errors appear inside the Create Lead modal,
    // right under each field (no window.alert popup).
    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = 'Please enter the name.';
    if (!email) nextErrors.email = 'Please enter the email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Please enter a valid email address.';
    if (!newLead.phone.trim()) nextErrors.phone = 'Please enter the mobile number.';
    else if (cleanPhone.length !== 10) nextErrors.phone = 'Mobile number must be exactly 10 digits.';
    else if (!/^[6-9]\d{9}$/.test(cleanPhone)) nextErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    if (!message) nextErrors.message = 'Please enter the requirement.';

    if (Object.keys(nextErrors).length > 0) {
      setCreateFieldErrors(nextErrors);
      const missing = [
        nextErrors.name && 'Name',
        nextErrors.phone && 'Phone',
        nextErrors.email && 'Email',
        nextErrors.message && 'Requirement',
      ].filter(Boolean);
      setCreateError(
        missing.length > 0
          ? `Please fill the required fields: ${missing.join(', ')}.`
          : 'Please fix the highlighted fields.'
      );
      return;
    }
    setCreateFieldErrors({});
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: cleanPhone,
          email,
          address: newLead.address.trim(),
          projectType: newLead.projectType.trim() || 'not specified',
          message,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to create lead');
      // Store admin-only fields (source, budget, follow-up) via update.
      if (d.id && (newLead.source.trim() || newLead.budget.trim() || newLead.followUpAt)) {
        await fetch('/api/contacts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: d.id,
            source: newLead.source.trim(),
            budget: newLead.budget.trim(),
            followUpAt: newLead.followUpAt || null,
          }),
        }).catch(() => {});
      }
      setNewLead({ name: '', phone: '', email: '', address: '', projectType: '', message: '', source: '', budget: '', followUpAt: '' });
      setCreateFieldErrors({});
      setCreateError(null);
      setCreateOpen(false);
      refresh();
      flash(`Lead created — ${name}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const openEditor = (l: Lead) => {
    if (openId === l._id) {
      setOpenId(null);
      return;
    }
    setOpenId(l._id);
    setForm({
      status: String(l.status || 'new'),
      assignedTo: assigneeId(l),
      followUpAt: toDateInput(l.followUpAt),
      source: l.source || '',
      budget: l.budget || '',
      notes: l.notes || '',
    });
  };

  const save = async (l: Lead) => {
    setSaving(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: l._id,
          status: form.status,
          assignedTo: form.assignedTo || null,
          followUpAt: form.followUpAt || null,
          source: form.source,
          budget: form.budget,
          notes: form.notes,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Save failed');
      setOpenId(null);
      refresh();
      flash('Lead saved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteLead = (l: Lead) => {
    // Shared confirmation modal — never window.confirm.
    setConfirmModal({
      isOpen: true,
      message: 'Delete lead',
      boldWord: `"${l.name}"?`,
      subtext: 'This cannot be undone.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setDeleting(true);
        try {
          const res = await fetch(`/api/contacts?id=${encodeURIComponent(l._id)}`, { method: 'DELETE' });
          const d = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(d.error || 'Delete failed');
          setOpenId(null);
          refresh();
          flash(`Lead deleted — ${l.name}`);
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Delete failed');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const scheduleSiteVisit = async (l: Lead) => {    if (!visitForm.visitDate) return alert('Visit date is required');
    setSchedulingVisit(true);
    try {
      const res = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: l.name,
          phone: l.phone,
          email: l.email || '',
          address: l.address || '',
          visitDate: visitForm.visitDate,
          requirements: visitForm.requirements || l.projectType || '',
          notes: visitForm.notes || l.message || '',
          leadId: l._id,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to schedule');
      // Also update lead status to site_visit
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: l._id, status: 'site_visit' }),
      });
      setVisitForm({ visitDate: '', requirements: '', notes: '' });
      refresh();
      flash(`Site visit scheduled for ${l.name}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setSchedulingVisit(false);
    }
  };

  return (
    <ModuleShell
      title="Leads"
      sub=""
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
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Status filter"
              value={filter}
              options={[
                { value: 'all', label: `All Statuses (${counts.all || 0})` },
                ...STATUSES.map((s) => ({
                  value: s,
                  label: `${s === 'site_visit' ? 'Site Visit' : STATUS_LABEL[s]} (${counts[s] || 0})`,
                })),
              ]}
              onChange={(v) => setFilter(v as StatusFilter)}
            />
            <UIDropdown
              label="Source filter"
              value={sourceFilter}
              options={[
                { value: 'all', label: 'All Sources' },
                ...sources.map((src) => ({ value: src, label: src })),
                { value: '__none__', label: 'Not specified' },
              ]}
              onChange={setSourceFilter}
            />
            <UIDropdown
              label="Assignee filter"
              value={assigneeFilter}
              options={[
                { value: 'all', label: 'All Team' },
                ...emps.map((e) => ({ value: e._id, label: e.name })),
                { value: '__none__', label: 'Unassigned' },
              ]}
              onChange={setAssigneeFilter}
            />
            <button
              className="ahf-btn ahf-btn-primary ahf-btn-sm"
              onClick={openCreateModal}
              style={{ marginLeft: 'auto' }}
            >
              <i className="fas fa-plus"></i> Create
            </button>
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <DataTable
          columns={[
            {
              key: 'l', header: 'Lead', render: (l) => (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {l.name}{' '}
                    {String(l.projectType || '').toLowerCase().includes('job') && (
                      <span style={{ fontSize: 10.5, fontWeight: 800, background: '#0c2b16', color: '#25d366', borderRadius: 999, padding: '2px 8px', verticalAlign: 'middle' }}>JOB</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8a7a66' }}>{l.projectType || '—'}{l.source ? ` · via ${l.source}` : ''}</div>
                </div>
              ),
            },
            {
              key: 'c', header: 'Contact', render: (l) => (
                <div>
                  <div style={{ fontSize: 12 }}>{l.phone}</div>
                  <div style={{ fontSize: 11.5, color: '#8a7a66' }}>{l.email}</div>
                </div>
              ),
            },
            {
              key: 'f', header: 'Follow-up', render: (l) => (
                <span style={{ fontSize: 12 }}>
                  {l.followUpAt ? new Date(l.followUpAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  {assigneeName(l) && <><br /><span style={{ color: '#8a7a66', fontSize: 11.5 }}><i className="fas fa-user"></i> {assigneeName(l)}</span></>}
                  {isOverdue(l) && <><br /><span style={{ fontSize: 11, fontWeight: 800, color: '#b3273a' }}><i className="fas fa-triangle-exclamation"></i> Overdue</span></>}
                </span>
              ),
            },
            {
              key: 'd', header: 'Date', render: (l) => (
                <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              ),
            },
            { key: 's', header: 'Status', render: (l) => <StatusBadge status={labelOf(l.status)} /> },
            {
              key: 'a', header: 'Action', render: (l) => (
                <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); openEditor(l); }}>
                  <i className={`fas ${openId === l._id ? 'fa-chevron-up' : 'fa-pen'}`}></i> {openId === l._id ? 'Hide' : 'Work'}
                </button>
              ),
            },
          ]}
          rows={paged}
          emptyText="No leads in this view yet."
          onRowClick={openEditor}
          loading={loading}
        />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>

      {createOpen && (
        <div
          onClick={() => { if (!creating) { setCreateOpen(false); setCreateError(null); setCreateFieldErrors({}); } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}
          >
            <div style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', padding: '18px 22px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>NEW LEAD</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Create Lead</div>
                <div style={{ fontSize: 12.5, opacity: 0.9 }}>Appears in the list — click its row to work it</div>
              </div>
              <button onClick={() => { if (!creating) { setCreateOpen(false); setCreateError(null); setCreateFieldErrors({}); } }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}><i className="fas fa-times"></i></button>
            </div>

            <div style={{ padding: 22 }}>
              {createError && (
                <div role="alert" style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }}></i>
                  {createError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Name *
                  <input className="ahf-input" value={newLead.name} onChange={(e) => { setNewLead((f) => ({ ...f, name: e.target.value })); clearCreateFieldError('name'); }} placeholder="e.g. Rahul Mehta" aria-invalid={!!createFieldErrors.name} style={createFieldErrors.name ? { borderColor: '#ef4444', background: '#fef2f2' } : undefined} />
                  {createFieldErrors.name && <span role="alert" style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>{createFieldErrors.name}</span>}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Phone (10 digits) *
                  <input className="ahf-input" value={newLead.phone} onChange={(e) => setNewLead((f) => { let d = e.target.value.replace(/\D/g, ''); if (d.length > 10 && d.startsWith('91')) d = d.slice(2); else if (d.length === 11 && d.startsWith('0')) d = d.slice(1); clearCreateFieldError('phone'); return { ...f, phone: d.slice(0, 10) }; })} placeholder="98765 43210" inputMode="numeric" maxLength={10} aria-invalid={!!createFieldErrors.phone} style={createFieldErrors.phone ? { borderColor: '#ef4444', background: '#fef2f2' } : undefined} />
                  {createFieldErrors.phone && <span role="alert" style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>{createFieldErrors.phone}</span>}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Email *
                  <input className="ahf-input" type="email" value={newLead.email} onChange={(e) => { setNewLead((f) => ({ ...f, email: e.target.value })); clearCreateFieldError('email'); }} placeholder="customer@email.com" aria-invalid={!!createFieldErrors.email} style={createFieldErrors.email ? { borderColor: '#ef4444', background: '#fef2f2' } : undefined} />
                  {createFieldErrors.email && <span role="alert" style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>{createFieldErrors.email}</span>}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Address
                  <input className="ahf-input" value={newLead.address} onChange={(e) => setNewLead((f) => ({ ...f, address: e.target.value }))} placeholder="Flat, road, area, city" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Project Type
                  <input className="ahf-input" value={newLead.projectType} onChange={(e) => setNewLead((f) => ({ ...f, projectType: e.target.value }))} placeholder="Modular Kitchen…" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Source
                  <input className="ahf-input" value={newLead.source} onChange={(e) => setNewLead((f) => ({ ...f, source: e.target.value }))} placeholder="Website, WhatsApp, Referral…" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Budget
                  <input className="ahf-input" value={newLead.budget} onChange={(e) => setNewLead((f) => ({ ...f, budget: e.target.value }))} placeholder="e.g. 2–3 L" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Follow-up date
                  <input type="date" className="ahf-input" value={newLead.followUpAt} onChange={(e) => setNewLead((f) => ({ ...f, followUpAt: e.target.value }))} />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, marginBottom: 16 }}>Requirement *
                <textarea className="ahf-input" rows={3} value={newLead.message} onChange={(e) => { setNewLead((f) => ({ ...f, message: e.target.value })); clearCreateFieldError('message'); }} placeholder="What does the customer need…" aria-invalid={!!createFieldErrors.message} style={createFieldErrors.message ? { borderColor: '#ef4444', background: '#fef2f2', borderRadius: 12 } : { borderRadius: 12 }} />
                {createFieldErrors.message && <span role="alert" style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>{createFieldErrors.message}</span>}
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="ahf-btn ahf-btn-ghost" disabled={creating} onClick={() => { setCreateOpen(false); setCreateError(null); setCreateFieldErrors({}); }}>
                  Cancel
                </button>
                <button className="ahf-btn ahf-btn-primary" disabled={creating} onClick={createLead}>
                  <i className="fas fa-plus"></i> {creating ? 'Creating…' : 'Create lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openId && (() => {
        const l = leads.find((x) => x._id === openId);
        if (!l) return null;
        return (
          <div
            onClick={() => setOpenId(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}
            >
              <div style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', padding: '18px 22px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>LEAD EDITOR</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{l.name}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.9 }}>{l.phone} · {l.email}</div>
                </div>
                <button onClick={() => setOpenId(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}><i className="fas fa-times"></i></button>
              </div>

              <div style={{ padding: 22 }}>
                {l.message && (
                  <p style={{ margin: '0 0 16px', fontSize: 13, background: '#faf7ef', border: '1px solid #eee3cd', borderRadius: 10, padding: '10px 12px', whiteSpace: 'pre-wrap' }}>{l.message}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Status
                    <UIDropdown
                      label="Lead status"
                      value={form.status}
                      options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                      onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                    />
                  </label>
                  {emps.length > 0 && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Assigned to
                      <UIDropdown
                        label="Assigned to"
                        value={form.assignedTo}
                        placeholder="Unassigned"
                        options={[{ value: '', label: 'Unassigned' }, ...emps.map((e) => ({ value: e._id, label: e.name }))]}
                        onChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}
                      />
                    </label>
                  )}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Follow-up date
                    <input type="date" className="ahf-input" value={form.followUpAt} onChange={(e) => setForm((f) => ({ ...f, followUpAt: e.target.value }))} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Source
                    <input className="ahf-input" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="Website, WhatsApp, Referral…" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Budget
                    <input className="ahf-input" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="e.g. 2–3 L" />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, marginBottom: 16 }}>Notes
                  <textarea className="ahf-input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Call outcome, requirements, next step…" />
                </label>

                {form.status === 'site_visit' && (
                  <p style={{ margin: '0 0 16px', fontSize: 12, color: '#8a7a66' }}>
                    <i className="fas fa-circle-info"></i> This status alone doesn&apos;t create a visit record — use <strong>Schedule Site Visit</strong> below so it appears on the Site Visits page.
                  </p>
                )}
                {['contacted', 'site_visit', 'proposal'].includes(form.status) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Schedule Site Visit</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Visit Date & Time
                        <input type="datetime-local" className="ahf-input" value={visitForm.visitDate} onChange={(e) => setVisitForm((f) => ({ ...f, visitDate: e.target.value }))} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Requirements
                        <input className="ahf-input" value={visitForm.requirements} onChange={(e) => setVisitForm((f) => ({ ...f, requirements: e.target.value }))} placeholder={l.projectType || 'Kitchen, Wardrobe…'} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>Notes
                        <input className="ahf-input" value={visitForm.notes} onChange={(e) => setVisitForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes…" />
                      </label>
                    </div>
                    <button className="ahf-btn ahf-btn-secondary" style={{ marginTop: 8 }} disabled={schedulingVisit || !visitForm.visitDate} onClick={() => scheduleSiteVisit(l)}>
                      <i className="fas fa-calendar-plus"></i> {schedulingVisit ? 'Scheduling…' : 'Schedule Site Visit'}
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 16 }}>
                  <button
                    className="ahf-btn ahf-btn-ghost"
                    disabled={saving || deleting}
                    onClick={() => deleteLead(l)}
                    style={{ color: '#b3273a' }}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                  <button className="ahf-btn ahf-btn-primary" disabled={saving || deleting} onClick={() => save(l)}>
                    <i className="fas fa-check"></i> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        boldWord={confirmModal.boldWord}
        afterBold={confirmModal.afterBold}
        subtext={confirmModal.subtext}
        confirmText={deleting ? 'Deleting…' : 'Yes, Delete'}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </ModuleShell>
  );
}
