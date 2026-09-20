'use client';

import { useMemo, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminField, AdminFormGrid, AdminModalFooter } from '@/components/admin/AdminUI';
import { normalizePhone, isValidPhone } from '@/lib/phone';

interface Vendor {
  _id: string;
  company: string;
  contactName?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  materials?: string;
  notes?: string;
}

export default function AdminVendors() {
  const { data, loading, refresh } = useAdminFetch<{ vendors: Vendor[] }>('/api/vendors');
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ company: '', contactName: '', phone: '', email: '', gstNumber: '', address: '', materials: '', notes: '' });

  const vendors = useMemo(() => data?.vendors || [], [data]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return vendors;
    return vendors.filter((v) => `${v.company} ${v.contactName || ''} ${v.phone || ''} ${v.materials || ''}`.toLowerCase().includes(s));
  }, [vendors, q]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const startAdd = () => {
    setEditId(null);
    setF({ company: '', contactName: '', phone: '', email: '', gstNumber: '', address: '', materials: '', notes: '' });
    setOpen(true);
  };

  const startEdit = (v: Vendor) => {
    setEditId(v._id);
    setF({
      company: v.company, contactName: v.contactName || '', phone: v.phone || '', email: v.email || '',
      gstNumber: v.gstNumber || '', address: v.address || '', materials: v.materials || '', notes: v.notes || '',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.company.trim()) return alert('Company name is required');
    const phone = normalizePhone(f.phone);
    if (phone && !isValidPhone(phone)) return alert('Phone must be exactly 10 digits');
    setBusy(true);
    try {
      const res = await fetch('/api/vendors', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editId ? { id: editId, ...f, phone } : { ...f, phone }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Save failed');
      setOpen(false);
      refresh();
      flash(editId ? 'Vendor updated' : 'Vendor added');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModuleShell
      title="Vendors"
      sub={`${vendors.length} suppliers — materials, hardware, services`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <AdminToast message={toast} />

      {open && (
        <AdminModal
          eyebrow={editId ? 'EDIT VENDOR' : 'NEW VENDOR'}
          title={editId ? 'Edit vendor' : 'New vendor'}
          subtitle="Appears in the directory on save"
          onClose={() => !busy && setOpen(false)}
          busy={busy}
        >
          <form onSubmit={save}>
            <AdminFormGrid min={200} style={{ marginBottom: 16 }}>
              <AdminField label="Company *">
                <input className="ahf-input" required value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Company *" />
              </AdminField>
              <AdminField label="Contact person">
                <input className="ahf-input" value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} placeholder="Contact person" />
              </AdminField>
              <AdminField label="Phone">
                <input className="ahf-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 12) })} placeholder="Phone (10 digits)" inputMode="numeric" />
              </AdminField>
              <AdminField label="Email">
                <input className="ahf-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" />
              </AdminField>
              <AdminField label="GST number">
                <input className="ahf-input" value={f.gstNumber} onChange={(e) => setF({ ...f, gstNumber: e.target.value })} placeholder="GST number" />
              </AdminField>
              <AdminField label="Supplies">
                <input className="ahf-input" value={f.materials} onChange={(e) => setF({ ...f, materials: e.target.value })} placeholder="Supplies (plywood, hardware…)" />
              </AdminField>
              <AdminField label="Address">
                <input className="ahf-input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Address" />
              </AdminField>
              <AdminField label="Notes">
                <input className="ahf-input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Notes" />
              </AdminField>
            </AdminFormGrid>
            <AdminModalFooter>
              <button type="button" className="ahf-btn ahf-btn-ghost" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
              <button className="ahf-btn ahf-btn-primary" disabled={busy}><i className="fas fa-check"></i> {busy ? 'Saving…' : 'Save vendor'}</button>
            </AdminModalFooter>
          </form>
        </AdminModal>
      )}

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#8a7a66' }}>{rows.length} vendor{rows.length === 1 ? '' : 's'}</span>
            <button
              className="ahf-btn ahf-btn-primary ahf-btn-sm"
              onClick={() => (open ? setOpen(false) : startAdd())}
              style={{ marginLeft: 'auto' }}
            >
              <i className={`fas ${open ? 'fa-chevron-up' : 'fa-plus'}`}></i> {open ? 'Hide' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head"><div><h3>Directory</h3></div></div>
        <DataTable
            columns={[
              {
                key: 'v', header: 'Vendor', render: (v) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{v.company}</div>
                    <div style={{ fontSize: 12.5, color: '#8a7a66' }}>
                      {[v.contactName, v.phone].filter(Boolean).join(' · ') || '—'}
                    </div>
                    {v.materials && <div style={{ fontSize: 12, color: '#8a7a66' }}>{v.materials}</div>}
                  </div>
                ),
              },
              { key: 'g', header: 'GST', render: (v) => <span style={{ fontSize: 12.5 }}>{v.gstNumber || '—'}</span> },
              {
                key: 'e', header: 'Action', render: (v) => (
                  <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); startEdit(v); }}><i className="fas fa-pen"></i> Work</button>
                ),
              },
            ]}
            rows={paged}
            emptyText="No vendors yet."
            onRowClick={startEdit}
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
