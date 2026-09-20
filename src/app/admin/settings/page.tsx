'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleShell } from '@/components/admin/ModuleBits';
import { AdminField, AdminFormGrid } from '@/components/admin/AdminUI';

interface Me {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export default function AdminSettings() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [tenant, setTenant] = useState<{ name: string; slug?: string; address: string; phone: string; email: string; gstNumber: string; quotationPrefix: string; employeePrefix: string; website: string; logo: string } | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', gstNumber: '', quotationPrefix: 'Q', employeePrefix: '', website: '', logo: '' });
  const [logoBusy, setLogoBusy] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    setLogoBusy(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('image'));
          img.onload = () => {
            const max = 512;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(String(reader.result));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85));
          };
          img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      });
      setForm((f) => ({ ...f, logo: dataUrl }));
    } catch {
      setSavedMsg('Logo upload failed — try a PNG/JPG under 5MB.');
    } finally {
      setLogoBusy(false);
    }
  };
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const u = data?.user;
        if (!u) {
          setState('denied');
          return;
        }
        const role = String(u.role || (u.isAdmin ? 'admin' : 'customer')).toLowerCase();
        const perms: string[] = Array.isArray(u.permissions) ? u.permissions : [];
        // Customers never see settings — the shell also blocks /admin/* for them.
        if (role === 'customer' && perms.length === 0) {
          setState('denied');
          return;
        }
        setUser({ name: u.name, email: u.email, role, isAdmin: !!u.isAdmin });
        try {
          const t = await fetch('/api/tenant/settings', { cache: 'no-store' }).then((r) => r.json());
          if (t?.tenant) {
            setTenant(t.tenant);
            setForm({
              name: t.tenant.name || '',
              address: t.tenant.address || '',
              phone: t.tenant.phone || '',
              email: t.tenant.email || '',
              gstNumber: t.tenant.gstNumber || '',
              quotationPrefix: t.tenant.quotationPrefix || 'Q',
              employeePrefix: t.tenant.employeePrefix || '',
              website: t.tenant.website || '',
              logo: t.tenant.logo || '',
            });
          }
        } catch {}
        setState('ok');
      } catch {
        setState('denied');
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      sessionStorage.removeItem('auth-user');
    } catch {}
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/');
  };

  if (state === 'loading') {
    return (
      <ModuleShell title="Settings" sub="Account and business preferences">
        <div className="ahf-grid-2eq">
          <div className="ahf-panel"><div className="ahf-panel-body"><div className="ahf-skel" style={{ height: 20 }} /><div className="ahf-skel" style={{ height: 18, marginTop: 8 }} /><div className="ahf-skel" style={{ height: 18, marginTop: 8 }} /></div></div>
          <div className="ahf-panel"><div className="ahf-panel-body"><div className="ahf-skel" style={{ height: 100 }} /></div></div>
        </div>
      </ModuleShell>
    );
  }

  if (state === 'denied' || !user) {
    return (
      <ModuleShell title="Settings" sub="Account and business preferences">
        <div className="ahf-panel">
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic" style={{ marginBottom: 14 }}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>Not Permitted</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>
              Settings are available to staff accounts only.
            </p>
            <Link href="/admin/dashboard" className="ahf-btn ahf-btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ModuleShell>
    );
  }

  const initial = (user.name || '?')[0].toUpperCase();

  return (
    <ModuleShell title="Settings" sub="Account and business preferences">
      <div className="ahf-grid-2eq">
        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>My Profile</h3>
              <p>Signed-in account details</p>
            </div>
            <span className="ahf-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{initial}</span>
          </div>
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="ahf-cat-row">
              <span style={{ minWidth: 110, color: 'var(--ahf-muted)' }}>Full Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="ahf-cat-row">
              <span style={{ minWidth: 110, color: 'var(--ahf-muted)' }}>Email</span>
              <strong style={{ wordBreak: 'break-all' }}>{(user.email || '').toLowerCase()}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <Link href="/forgot-password" className="ahf-btn ahf-btn-ghost ahf-btn-sm">
                <i className="fas fa-key"></i> Change Password
              </Link>
              <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={logout}>
                <i className="fas fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="ahf-panel">
          <div className="ahf-panel-head">
            <div>
              <h3>Business Info</h3>
              <p>{tenant?.name || 'Your company'}</p>
            </div>
          </div>
          <div className="ahf-panel-body" style={{ fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="ahf-avatar" style={{ width: 56, height: 56, overflow: 'hidden', padding: 0 }}>
                {tenant?.logo || form.logo
                  ? <img src={form.logo || tenant?.logo} alt="Company logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="fas fa-building"></i>}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong>{tenant?.name || 'Your company'}</strong>
                <span style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>Logo appears on quotations + PDFs</span>
              </div>
            </div>
            <p style={{ margin: 0 }}><i className="fas fa-location-dot" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>{tenant?.address || '—'}</p>
            <p style={{ margin: 0 }}><i className="fas fa-phone" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>{tenant?.phone || '—'}</p>
            <p style={{ margin: 0 }}><i className="fas fa-envelope" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>{tenant?.email || '—'}</p>
            {tenant?.website && <p style={{ margin: 0 }}><i className="fas fa-globe" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>{tenant.website}</p>}
            {tenant?.gstNumber && <p style={{ margin: 0 }}><i className="fas fa-receipt" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>GST: {tenant.gstNumber}</p>}
            <p style={{ margin: 0 }}><i className="fas fa-file-invoice" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>Quotation prefix: {tenant?.quotationPrefix || 'Q'}</p>
            {tenant?.slug && (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span><i className="fas fa-fingerprint" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>Worker punch link:</span>
                <code style={{ fontSize: 12, background: 'var(--ahf-cream)', border: '1px solid var(--ahf-line)', borderRadius: 8, padding: '2px 8px', wordBreak: 'break-all' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/punch?tenant=${tenant.slug}` : `/punch?tenant=${tenant.slug}`}
                </code>
                <button
                  type="button"
                  className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                  onClick={() => {
                    const link = `${window.location.origin}/punch?tenant=${tenant.slug}`;
                    if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => setSavedMsg('Punch link copied — share it with workers.')).catch(() => setSavedMsg(link));
                    else setSavedMsg(link);
                  }}
                >
                  <i className="fas fa-copy"></i> Copy
                </button>
              </p>
            )}
            <p style={{ margin: 0 }}><i className="fas fa-id-badge" style={{ color: 'var(--ahf-gold)', marginRight: 8 }}></i>Employee ID prefix: {tenant?.employeePrefix || '—'} <span style={{ color: 'var(--ahf-muted)' }}>(new staff get {tenant?.employeePrefix ? `${tenant.employeePrefix}-001, ${tenant.employeePrefix}-002…` : 'company-wise IDs'})</span></p>
            {(user.role === 'owner' || user.role === 'admin') && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setSavedMsg('');
                  try {
                    const res = await fetch('/api/tenant/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(form),
                    });
                    const d = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(d.error || 'Save failed');
                    setTenant(d.tenant);
                    setSavedMsg('Company settings saved.');
                  } catch (err) {
                    setSavedMsg(err instanceof Error ? err.message : 'Save failed');
                  } finally {
                    setSaving(false);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
              >
                <strong style={{ fontSize: 13 }}>Edit company info</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => logoRef.current?.click()} disabled={logoBusy || saving}>
                    <i className="fas fa-upload"></i> {logoBusy ? 'Uploading…' : form.logo ? 'Change logo' : 'Upload logo'}
                  </button>
                  {form.logo && (
                    <button type="button" className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setForm((f) => ({ ...f, logo: '' }))}>
                      Remove logo
                    </button>
                  )}
                  <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickLogo(e.target.files?.[0])} />
                </div>
                <AdminFormGrid min={200} style={{ marginBottom: 8, marginTop: 4 }}>
                {(['name', 'address', 'phone', 'email', 'gstNumber', 'quotationPrefix', 'employeePrefix', 'website'] as const).map((k) => (
                  <AdminField key={k} label={k === 'employeePrefix' ? 'employeePrefix (2-5 letters, e.g. PIS — used for new staff IDs)' : k}>
                    <input
                      className="ahf-input"
                      value={form[k]}
                      onChange={(e) => setForm((f) => ({ ...f, [k]: k === 'employeePrefix' ? e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) : e.target.value }))}
                      placeholder={k === 'employeePrefix' ? 'e.g. PIS' : undefined}
                    />
                  </AdminField>
                ))}
                </AdminFormGrid>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="ahf-btn ahf-btn-primary ahf-btn-sm" disabled={saving || logoBusy}>
                    {saving ? 'Saving…' : 'Save company info'}
                  </button>
                  {savedMsg && <span style={{ fontSize: 12.5 }}>{savedMsg}</span>}
                </div>
              </form>
            )}
            {user.isAdmin && (
              <div style={{ marginTop: 6 }}>
                <Link href="/admin/staff" className="ahf-btn ahf-btn-primary ahf-btn-sm">
                  <i className="fas fa-user-tie"></i> Manage Team &amp; Roles
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}
