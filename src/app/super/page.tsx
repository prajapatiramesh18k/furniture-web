'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UIDropdown from '@/components/UIDropdown';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmationModal from '@/components/ConfirmationModal';

interface TenantRow {
  _id: string;
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  plan: string;
  users: number;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  gstNumber?: string;
  quotationPrefix?: string;
  employeePrefix?: string;
  modules: { moduleKey: string; enabled: boolean }[];
}

const MODULES = ['QUOTATION', 'EMPLOYEE_MANAGEMENT', 'INVENTORY', 'ACCOUNTING'] as const;

const MODULE_LABEL: Record<string, string> = {
  QUOTATION: 'Quotation',
  EMPLOYEE_MANAGEMENT: 'Employees',
  INVENTORY: 'Inventory',
  ACCOUNTING: 'Accounting',
};

/** Downscale an uploaded logo so it fits comfortably in MongoDB + renders fast in PDFs. */
function fileToLogoDataUrl(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const keepPng = file.type === 'image/png';
        resolve(canvas.toDataURL(keepPng ? 'image/png' : 'image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const EMPTY_BRAND = { name: '', phone: '', email: '', website: '', address: '', gstNumber: '', quotationPrefix: 'Q', employeePrefix: '', logo: '' };

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ...EMPTY_BRAND,
    modules: { QUOTATION: true, EMPLOYEE_MANAGEMENT: true, INVENTORY: false, ACCOUNTING: false } as Record<string, boolean>,
  });
  const [logoBusy, setLogoBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersModalLoading, setUsersModalLoading] = useState(false);
  const [usersModalList, setUsersModalList] = useState<{ _id: string; name: string; email: string; role: string; phone: string; active: boolean; tenantName?: string; createdAt?: string }[]>([]);
  const [usersModalError, setUsersModalError] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const usersDialogRef = useRef<HTMLDialogElement>(null);
  const [brandOpen, setBrandOpen] = useState<string | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);
  const [brandForm, setBrandForm] = useState(EMPTY_BRAND);
  const [brandLogoBusy, setBrandLogoBusy] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg, setBrandMsg] = useState('');
  const onboardLogoRef = useRef<HTMLInputElement>(null);
  const editLogoRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/super/tenants', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load companies');
      setTenants(data.tenants || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openUsersModal = useCallback(async () => {
    setUsersModalOpen(true);
    setUsersModalLoading(true);
    setUsersModalError('');
    setUsersSearch('');
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsersModalList(data.users || []);
    } catch (e) {
      setUsersModalError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setUsersModalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen && !brandOpen) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen, brandOpen]);

  const closeModal = () => {
    if (creating || logoBusy || brandSaving || brandLogoBusy) return;
    setBrandOpen(null);
    setEditingTenant(null);
    setBrandMsg('');
    setModalOpen(false);
    setMsg('');
    setForm({ companyName: '', ownerName: '', ownerEmail: '', ownerPassword: '', ...EMPTY_BRAND, modules: { QUOTATION: true, EMPLOYEE_MANAGEMENT: true, INVENTORY: false, ACCOUNTING: false } });
  };

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating || logoBusy) return;
    setCreating(true);
    setMsg('');
    try {
      const res = await fetch('/api/super/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          ownerName: form.ownerName,
          ownerEmail: form.ownerEmail,
          ownerPassword: form.ownerPassword,
          modules: form.modules,
          logo: form.logo,
          phone: form.phone,
          email: form.email,
          website: form.website,
          address: form.address,
          gstNumber: form.gstNumber,
          quotationPrefix: form.quotationPrefix || 'Q',
          employeePrefix: form.employeePrefix || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Creation failed');
      setSuccess(`Created ${data.tenant.name} (${data.tenant.slug}). Owner can now log in.`);
      setModalOpen(false);
      setSearch('');
      setForm({ companyName: '', ownerName: '', ownerEmail: '', ownerPassword: '', ...EMPTY_BRAND, modules: { QUOTATION: true, EMPLOYEE_MANAGEMENT: true, INVENTORY: false, ACCOUNTING: false } });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const [pendingTenant, setPendingTenant] = useState<TenantRow | null>(null);
  const [toggling, setToggling] = useState(false);

  const toggleStatus = async () => {
    if (!pendingTenant) return;
    const t = pendingTenant;
    const next = t.status === 'active' ? 'suspended' : 'active';
    setToggling(true);
    try {
      await fetch(`/api/super/tenants/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      await load();
    } finally {
      setToggling(false);
      setPendingTenant(null);
    }
  };

  const toggleModule = async (t: TenantRow, key: string, enabled: boolean) => {
    await fetch(`/api/super/tenants/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: { [key]: enabled } }),
    });
    await load();
  };

  const [editPlan, setEditPlan] = useState('FREE');

  const openBrand = (t: TenantRow) => {
    setModalOpen(false);
    setSuccess('');
    setBrandOpen(t.id);
    setEditingTenant(t);
    setBrandMsg('');
    setEditPlan(t.plan || 'FREE');
    setBrandForm({
      name: t.name || '',
      phone: t.phone || '',
      email: t.email || '',
      website: t.website || '',
      address: t.address || '',
      gstNumber: t.gstNumber || '',
      quotationPrefix: t.quotationPrefix || 'Q',
      employeePrefix: t.employeePrefix || '',
      logo: t.logo || '',
    });
  };

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandOpen || brandSaving || brandLogoBusy) return;
    setBrandSaving(true);
    setBrandMsg('');
    try {
      const res = await fetch(`/api/super/tenants/${brandOpen}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brandForm, plan: editPlan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccess('Company updated — changes apply immediately.');
      setBrandOpen(null);
      await load();
    } catch (e) {
      setBrandMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBrandSaving(false);
    }
  };

  const stats = useMemo(() => {
    const active = tenants.filter((t) => t.status === 'active').length;
    const suspended = tenants.length - active;
    const users = tenants.reduce((s, t) => s + (t.users || 0), 0);
    return { total: tenants.length, active, suspended, users };
  }, [tenants]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? tenants.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q))
    : tenants;

  const pickOnboardLogo = async (file: File | undefined) => {
    if (!file) return;
    setLogoBusy(true);
    try {
      const url = await fileToLogoDataUrl(file);
      setForm((f) => ({ ...f, logo: url }));
    } catch {
      setMsg('Logo upload failed — try a PNG/JPG under 5MB.');
    } finally {
      setLogoBusy(false);
    }
  };

  const pickEditLogo = async (file: File | undefined) => {
    if (!file) return;
    setBrandLogoBusy(true);
    try {
      const url = await fileToLogoDataUrl(file);
      setBrandForm((f) => ({ ...f, logo: url }));
    } catch {
      setBrandMsg('Logo upload failed — try a PNG/JPG under 5MB.');
    } finally {
      setBrandLogoBusy(false);
    }
  };

  return (
    <div>
      <div className="ahf-pagehead">
        <div>
          <p>Platform</p>
          <h2>Companies</h2>
          <p>Create tenants, upload each company&apos;s logo + contact details, enable modules and onboard owners. The quotation maker shows that branding on every PDF.</p>
        </div>
        <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={load} disabled={loading} aria-label="Refresh companies">
          <i className={`fas fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      <div className="ahf-grid-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="ahf-stat" style={{ ['--ahf-accent' as string]: 'var(--ahf-primary-gradient)' }}>
          <div className="ahf-stat-top">
            <span className="ahf-stat-ic"><i className="fas fa-building"></i></span>
          </div>
          <div className="ahf-stat-num">{loading ? '—' : stats.total}</div>
          <div className="ahf-stat-label">Total companies</div>
          <div className="ahf-stat-sub">All tenants on the platform</div>
        </div>
        <div className="ahf-stat" style={{ ['--ahf-accent' as string]: 'linear-gradient(135deg,#2e7d4f,#1d5c37)', ['--ahf-accent-soft' as string]: '#e6f2e9' }}>
          <div className="ahf-stat-top">
            <span className="ahf-stat-ic"><i className="fas fa-circle-check"></i></span>
            <span className="ahf-delta up">{loading ? '…' : `${stats.total ? Math.round((stats.active / Math.max(stats.total, 1)) * 100) : 0}%`}</span>
          </div>
          <div className="ahf-stat-num">{loading ? '—' : stats.active}</div>
          <div className="ahf-stat-label">Active</div>
          <div className="ahf-stat-sub">Live and billable</div>
        </div>
        <div className="ahf-stat" style={{ ['--ahf-accent' as string]: 'linear-gradient(135deg,#c0392b,#8e2b20)', ['--ahf-accent-soft' as string]: '#fbe7e3' }}>
          <div className="ahf-stat-top">
            <span className="ahf-stat-ic"><i className="fas fa-pause-circle"></i></span>
          </div>
          <div className="ahf-stat-num">{loading ? '—' : stats.suspended}</div>
          <div className="ahf-stat-label">Suspended</div>
          <div className="ahf-stat-sub">Blocked from login</div>
        </div>
        <div
          className="ahf-stat"
          role="button"
          tabIndex={0}
          style={{ ['--ahf-accent' as string]: 'linear-gradient(135deg,#6e4c22,#3d2a1a)', ['--ahf-accent-soft' as string]: '#f1e4cb', cursor: 'pointer' }}
          onClick={() => { if (!loading) openUsersModal(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!loading) openUsersModal(); } }}
          title="Click to view tenant users"
        >
          <div className="ahf-stat-top">
            <span className="ahf-stat-ic"><i className="fas fa-users"></i></span>
          </div>
          <div className="ahf-stat-num">{loading ? '—' : stats.users}</div>
          <div className="ahf-stat-label">Tenant users</div>
          <div className="ahf-stat-sub">Owners + staff + customers · click for details</div>
        </div>
      </div>

      {(modalOpen || brandOpen) && (
        <dialog
          ref={dialogRef}
          aria-labelledby="company-dialog-title"
          onCancel={(e) => { e.preventDefault(); closeModal(); }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            width: '100vw',
            height: '100dvh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            border: 'none',
            color: 'var(--ahf-ink)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', padding: '18px 22px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{brandOpen ? 'EDIT COMPANY' : 'NEW COMPANY'}</div>
                <h2 id="company-dialog-title" style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                  {brandOpen ? `Edit ${editingTenant?.name || 'company'}` : 'Onboard a new company'}
                </h2>
                <p style={{ fontSize: 12.5, opacity: 0.9, margin: '4px 0 0' }}>
                  {brandOpen ? 'Update branding, contact details and plan — applies immediately.' : 'Logo + contact details appear in that company&apos;s quotation maker and PDFs.'}
                </p>
              </div>
              <button type="button" aria-label="Close company form" disabled={creating || logoBusy || brandSaving || brandLogoBusy} onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: 22 }}>
            {brandOpen ? (
            <form onSubmit={saveBrand}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="ahf-avatar" style={{ width: 72, height: 72, fontSize: 22, overflow: 'hidden', padding: 0 }}>
                  {brandForm.logo
                    ? <img src={brandForm.logo} alt="logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="fas fa-building"></i>}
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => editLogoRef.current?.click()} disabled={brandLogoBusy}>
                    <i className="fas fa-upload"></i> {brandLogoBusy ? 'Uploading…' : 'Upload logo'}
                  </button>
                  <input ref={editLogoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickEditLogo(e.target.files?.[0])} />
                  {brandForm.logo && (
                    <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setBrandForm((f) => ({ ...f, logo: '' }))}>
                      <i className="fas fa-trash"></i> Remove logo
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
                {([
                  { k: 'name', label: 'Company name', ph: 'Company name' },
                  { k: 'phone', label: 'Company mobile', ph: 'Company mobile' },
                  { k: 'email', label: 'Company email', ph: 'Company email' },
                  { k: 'website', label: 'Website', ph: 'Website' },
                  { k: 'gstNumber', label: 'GST number', ph: 'GST number' },
                  { k: 'quotationPrefix', label: 'Quotation prefix', ph: 'e.g. Q' },
                  { k: 'employeePrefix', label: 'Employee ID prefix (2-5 letters)', ph: 'e.g. PIS' },
                ] as const).map((f) => (
                  <label key={f.k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--ahf-muted)' }}>
                    {f.label}
                    <input
                      className="ahf-input"
                      value={brandForm[f.k]}
                      onChange={(e) => setBrandForm((bf) => ({
                        ...bf,
                        [f.k]: f.k === 'employeePrefix'
                          ? e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5)
                          : f.k === 'quotationPrefix'
                            ? e.target.value.slice(0, 8)
                            : e.target.value,
                      }))}
                      placeholder={f.ph}
                    />
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--ahf-muted)' }}>
                  Plan
                  <UIDropdown
                    label="Plan"
                    value={editPlan}
                    options={['FREE', 'BASIC', 'PRO', 'ENTERPRISE']}
                    onChange={setEditPlan}
                  />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--ahf-muted)', marginBottom: 14 }}>
                Company address
                <input className="ahf-input" value={brandForm.address} onChange={(e) => setBrandForm((f) => ({ ...f, address: e.target.value }))} placeholder="Company address" />
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="ahf-btn ahf-btn-primary" disabled={brandSaving || brandLogoBusy}>
                  <i className="fas fa-check"></i> {brandSaving ? 'Saving…' : 'Save changes'}
                </button>
                {brandMsg && <span style={{ fontSize: 13, color: 'var(--ahf-danger)', fontWeight: 600 }}>{brandMsg}</span>}
              </div>
            </form>
            ) : (
            <form onSubmit={createTenant}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="ahf-avatar" style={{ width: 56, height: 56, fontSize: 18, overflow: 'hidden', padding: 0 }}>
                  {form.logo ? <img src={form.logo} alt="Company logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-building"></i>}
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => onboardLogoRef.current?.click()} disabled={logoBusy}>
                    <i className="fas fa-upload"></i> {logoBusy ? 'Uploading…' : form.logo ? 'Change logo' : 'Upload logo'}
                  </button>
                  {form.logo && (
                    <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setForm((f) => ({ ...f, logo: '' }))}>
                      <i className="fas fa-trash"></i> Remove
                    </button>
                  )}
                </div>
                <input ref={onboardLogoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickOnboardLogo(e.target.files?.[0])} />
                <span style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>PNG/JPG, auto-resized. Shown on quotations.</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                <input className="ahf-input" required value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Company name — e.g. Pritesh Interior" />
                <input className="ahf-input" required value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} placeholder="Owner name — e.g. Pritesh Patel" />
                <input className="ahf-input" type="email" required value={form.ownerEmail} onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))} placeholder="Owner email — owner@company.com" />
                <input className="ahf-input" type="password" required minLength={6} value={form.ownerPassword} onChange={(e) => setForm((f) => ({ ...f, ownerPassword: e.target.value }))} placeholder="Owner password (min 6 chars)" />
                <input className="ahf-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Company mobile — e.g. +91 98765 43210" />
                <input className="ahf-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Company email — hello@company.com" />
                <input className="ahf-input" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="Website — e.g. www.company.com" />
                <input className="ahf-input" value={form.gstNumber} onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))} placeholder="GST number (optional)" />
                <input className="ahf-input" value={form.quotationPrefix} onChange={(e) => setForm((f) => ({ ...f, quotationPrefix: e.target.value.slice(0, 8) }))} placeholder="Quotation prefix — e.g. Q (optional)" />
                <input className="ahf-input" value={form.employeePrefix} onChange={(e) => setForm((f) => ({ ...f, employeePrefix: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) }))} placeholder="Employee ID prefix — e.g. PIS (auto from name if empty)" />
              </div>
              <input className="ahf-input" style={{ marginBottom: 12 }} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Company address — shop, road, city, PIN" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {MODULES.map((m) => (
                  <button key={m} type="button" onClick={() => setForm((f) => ({ ...f, modules: { ...f.modules, [m]: !f.modules[m] } }))} className={`ahf-btn ahf-btn-sm ${form.modules[m] ? 'ahf-btn-primary' : 'ahf-btn-ghost'}`}>
                    <i className={`fas ${form.modules[m] ? 'fa-circle-check' : 'fa-circle'}`}></i> {MODULE_LABEL[m]}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="ahf-btn ahf-btn-primary" disabled={creating || logoBusy}>
                  <i className="fas fa-plus"></i> {creating ? 'Creating…' : 'Create company + owner'}
                </button>
                {msg && <span style={{ fontSize: 13, color: 'var(--ahf-danger)', fontWeight: 600 }}>{msg}</span>}
              </div>
            </form>
            )}
            </div>
          </div>
        </dialog>
      )}

      {usersModalOpen && (
        <dialog
          ref={usersDialogRef}
          onCancel={(e) => { e.preventDefault(); setUsersModalOpen(false); }}
          onClick={(e) => { if (e.target === e.currentTarget) setUsersModalOpen(false); }}
          style={{
            width: '100vw',
            height: '100dvh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            border: 'none',
            color: 'var(--ahf-ink)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', padding: '18px 22px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>PLATFORM</div>
                <h2 id="users-dialog-title" style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>Tenant users</h2>
                <p style={{ fontSize: 12.5, opacity: 0.9, margin: '4px 0 0' }}>Owners, staff and customers across all companies.</p>
              </div>
              <button type="button" aria-label="Close users list" onClick={() => setUsersModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: 22 }}>
            <div className="ahf-search-inline" style={{ maxWidth: '100%', marginBottom: 12 }}>
              <i className="fas fa-search"></i>
              <input value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} placeholder="Search users…" aria-label="Search users" />
            </div>
            {usersModalLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="ahf-skel" style={{ height: 52 }} />
                ))}
              </div>
            ) : usersModalError ? (
              <p style={{ color: 'var(--ahf-danger)', fontSize: 13.5, fontWeight: 600 }}>{usersModalError}</p>
            ) : usersModalList.length === 0 ? (
              <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5 }}>No users found.</p>
            ) : (
              <div className="ahf-tablewrap">
                <table className="ahf-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersModalList
                      .filter((u) => {
                        const s = usersSearch.trim().toLowerCase();
                        if (!s) return true;
                        return `${u.name} ${u.email} ${u.role} ${u.phone} ${u.tenantName || ''}`.toLowerCase().includes(s);
                      })
                      .map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="ahf-cust">
                              <span className="ahf-avatar">{(u.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                              <div>
                                <strong>{u.name}</strong>
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5 }}>{u.tenantName || <span style={{ color: 'var(--ahf-muted)' }}>—</span>}</td>
                          <td><StatusBadge status={u.role} /></td>
                          <td style={{ fontSize: 12.5 }}>{u.phone || '—'}</td>
                          <td>
                            <span className={`ahf-badge ${u.active ? 'ahf-b-active' : 'ahf-b-cancelled'}`}>{u.active ? 'active' : 'disabled'}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>
        </dialog>
      )}

      {success && <p role="status" style={{ color: 'var(--ahf-success)', marginBottom: 16 }}>{success}</p>}

      <div className="ahf-panel" id="onboard">
        <div className="ahf-panel-head" style={{ flexWrap: 'wrap' }}>
          <div>
            <h3>{loading ? 'Loading companies…' : `${filtered.length} ${filtered.length === 1 ? 'company' : 'companies'}`}</h3>
            <p>Toggle modules, edit any company field (name, logo, contact, prefixes, plan), or suspend. Changes apply immediately.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="ahf-search-inline" style={{ maxWidth: 300 }}>
              <i className="fas fa-search"></i>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies…" aria-label="Search companies" />
            </div>
            <button className="ahf-btn ahf-btn-primary ahf-btn-sm" onClick={() => setModalOpen(true)} title="Add company">
              <i className="fas fa-plus"></i> Create
            </button>
            <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={load} disabled={loading} title="Refresh">
              <i className={`fas fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>
        {error ? (
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic"><i className="fas fa-triangle-exclamation"></i></div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>Couldn&apos;t load companies</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>{error}</p>
            <button className="ahf-btn ahf-btn-primary" onClick={load}>Retry</button>
          </div>
        ) : loading ? (
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="ahf-skel" style={{ height: 72 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic" style={{ background: 'var(--ahf-cream)', color: 'var(--ahf-primary)', borderColor: 'var(--ahf-line)' }}>
              <i className="fas fa-building"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>No companies found</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: 0 }}>
              {search ? `Nothing matches “${search}”.` : 'Add your first company using the + button above.'}
            </p>
          </div>
        ) : (
          <div className="ahf-tablewrap">
            <table className="ahf-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact (quotation header)</th>
                  <th>Status</th>
                  <th>Plan / Users</th>
                  <th>Modules</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <Fragment key={t.id}>
                    <tr>
                      <td>
                        <div className="ahf-cust">
                          <span className="ahf-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {t.logo
                              ? <img src={t.logo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (t.name || 'C').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong>{t.name}</strong>
                            <span>{t.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
                          {t.phone ? <span><i className="fas fa-phone" style={{ color: 'var(--ahf-gold)', marginRight: 6 }}></i>{t.phone}</span> : <span style={{ color: 'var(--ahf-muted)' }}>No phone</span>}
                          {t.email ? <span style={{ wordBreak: 'break-all' }}><i className="fas fa-envelope" style={{ color: 'var(--ahf-gold)', marginRight: 6 }}></i>{t.email}</span> : null}
                          {t.website ? <span style={{ wordBreak: 'break-all' }}><i className="fas fa-globe" style={{ color: 'var(--ahf-gold)', marginRight: 6 }}></i>{t.website}</span> : null}
                        </div>
                      </td>
                      <td>
                        <span className={`ahf-badge ${t.status === 'active' ? 'ahf-b-active' : 'ahf-b-cancelled'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.plan}</div>
                        <div style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>{t.users} users</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {MODULES.map((m) => {
                            const row = t.modules.find((x) => x.moduleKey === m);
                            const on = row ? row.enabled : m === 'QUOTATION' || m === 'EMPLOYEE_MANAGEMENT';
                            return (
                              <button
                                key={m}
                                title={`${MODULE_LABEL[m]}: ${on ? 'enabled' : 'disabled'} — click to toggle`}
                                onClick={() => toggleModule(t, m, !on)}
                                className={`ahf-badge ${on ? 'ahf-b-active' : 'ahf-b-draft'}`}
                                style={{ cursor: 'pointer', borderStyle: on ? 'solid' : 'dashed' }}
                              >
                                {MODULE_LABEL[m]}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="ahf-row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => openBrand(t)}>
                            <i className="fas fa-pen"></i> Edit
                          </button>
                          <button
                            className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                            onClick={() => setPendingTenant(t)}
                          >
                            <i className={`fas ${t.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                            {t.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!pendingTenant}
        message={pendingTenant ? `${pendingTenant.status === 'active' ? 'Suspend' : 'Activate'} ${pendingTenant.name}?` : ''}
        subtext={pendingTenant?.status === 'active' ? 'Their whole team will be locked out immediately.' : 'Their team will be able to log in again.'}
        confirmText={toggling ? 'Working…' : pendingTenant?.status === 'active' ? 'Yes, Suspend' : 'Yes, Activate'}
        confirmButtonVariant={pendingTenant?.status === 'active' ? 'danger' : 'primary'}
        onConfirm={toggleStatus}
        onCancel={() => !toggling && setPendingTenant(null)}
      />
    </div>
  );
}
