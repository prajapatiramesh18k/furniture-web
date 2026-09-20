'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import UIDropdown from '@/components/UIDropdown';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { AdminToast } from '@/components/admin/AdminUI';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmationModal from '@/components/ConfirmationModal';

interface Company { _id: string; id: string; name: string; slug: string; status: string }
interface LoginRow {
  _id: string; name: string; email: string; role: string; phone: string;
  active: boolean; createdAt?: string; tenantId: string; tenantName: string; tenantSlug: string;
}

const ROLES = ['owner', 'admin', 'manager', 'staff'] as const;

export default function SuperLoginsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');

  // Create form — only company + username + password (+ role).
  const [companyId, setCompanyId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('manager');
  const [creating, setCreating] = useState(false);
  const [cMsg, setCMsg] = useState('');

  const [pendingToggle, setPendingToggle] = useState<LoginRow | null>(null);
  const [toggling, setToggling] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [resetting, setResetting] = useState(false);

  const flash = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        fetch('/api/super/tenants', { cache: 'no-store' }),
        fetch('/api/super/logins', { cache: 'no-store' }),
      ]);
      const cData = await cRes.json().catch(() => ({}));
      const uData = await uRes.json().catch(() => ({}));
      if (cRes.ok) {
        const list: Company[] = (cData.tenants || []).map((t: {
          _id?: unknown; id?: unknown; name: string; slug: string; status: string;
        }) => ({
          _id: String(t._id || t.id), id: String(t.id || t._id), name: t.name, slug: t.slug, status: t.status,
        }));
        setCompanies(list);
        setCompanyId((prev) => {
          if (prev) return prev;
          const firstActive = list.find((c) => c.status === 'active') || list[0];
          return firstActive ? firstActive.id : prev;
        });
      }
      if (uRes.ok) setLogins(uData.users || []);
    } catch {
      flash('Failed to load logins.');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return logins;
    return logins.filter((u) =>
      `${u.name} ${u.email} ${u.role} ${u.tenantName}`.toLowerCase().includes(s),
    );
  }, [logins, q]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(filtered, 10, [q]);

  const createLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !username.trim() || !password) {
      setCMsg('Company, username and password are required.');
      return;
    }
    setCreating(true);
    setCMsg('');
    try {
      const res = await fetch('/api/super/logins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, username: username.trim(), password, role }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to create login');
      setCMsg(`Created "${d.user.email}" for ${d.user.tenantName}. They can log in now.`);
      flash(`Login created for ${d.user.tenantName}`);
      setUsername('');
      setPassword('');
      await load();
    } catch (err) {
      setCMsg(err instanceof Error ? err.message : 'Failed to create login');
    } finally {
      setCreating(false);
    }
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setToggling(true);
    try {
      const res = await fetch('/api/super/logins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pendingToggle._id, active: !pendingToggle.active }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Update failed');
      flash(pendingToggle.active ? 'Login deactivated.' : 'Login activated.');
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setToggling(false);
      setPendingToggle(null);
    }
  };

  const resetPassword = async (id: string) => {
    if (!resetPw || resetPw.length < 6) {
      flash('New password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/super/logins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: resetPw }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Reset failed');
      flash('Password updated.');
      setResetId(null);
      setResetPw('');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <ModuleShell
      title="User Logins"
      sub="Create company user logins with just a company, username and password"
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

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-head">
          <div>
            <h3>Create user login</h3>
            <p>Pick the company, set a username + password — that&apos;s it. Login email is generated as username@company.</p>
          </div>
        </div>
        <div className="ahf-panel-body">
          <form onSubmit={createLogin}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
              <UIDropdown
                label="Company"
                value={companyId}
                placeholder="Select company…"
                options={[
                  { value: '', label: 'Select company…' },
                  ...companies.map((c) => ({ value: c.id, label: `${c.name}${c.status !== 'active' ? ' (suspended)' : ''}` })),
                ]}
                onChange={setCompanyId}
              />
              <input
                className="ahf-input" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="User name — e.g. ramesh" autoComplete="off"
              />
              <input
                className="ahf-input" required type="password" minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)" autoComplete="new-password"
              />
              <UIDropdown
                label="Login role"
                value={role}
                options={ROLES.map((r) => ({ value: r, label: r }))}
                onChange={setRole}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="ahf-btn ahf-btn-primary" disabled={creating}>
                <i className="fas fa-user-plus"></i> {creating ? 'Creating…' : 'Create login'}
              </button>
              {cMsg && <span style={{ fontSize: 13, fontWeight: 600 }}>{cMsg}</span>}
            </div>
          </form>
        </div>
      </div>

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--ahf-muted)' }}>
              {filtered.length} login{filtered.length === 1 ? '' : 's'} across companies
            </span>
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>All User Logins ({filtered.length})</h3><p>Company, username, role and status</p></div>
        </div>
        {loading ? <LoadingList /> : filtered.length === 0 ? (
          <p style={{ padding: 18, color: 'var(--ahf-muted)', fontSize: 13 }}>No logins found.</p>
        ) : (
          <>
          <div className="ahf-tablewrap">
            <table className="ahf-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>User Name</th>
                  <th>Login Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <Fragment key={u._id}>
                    <tr>
                      <td><strong>{u.tenantName || '—'}</strong></td>
                      <td>
                        <div className="ahf-cust">
                          <span className="ahf-avatar">{(u.name || '?')[0].toUpperCase()}</span>
                          <div><strong>{u.name}</strong></div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12.5 }}>{u.email}</span></td>
                      <td><StatusBadge status={u.role} /></td>
                      <td><StatusBadge status={u.active ? 'Active' : 'Cancelled'} /></td>
                      <td>
                        <div className="ahf-row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => { setResetId(resetId === u._id ? null : u._id); setResetPw(''); }}>
                            <i className="fas fa-key"></i> Reset PW
                          </button>
                          <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => setPendingToggle(u)}>
                            <i className={`fas ${u.active ? 'fa-ban' : 'fa-check'}`}></i> {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {resetId === u._id && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--ahf-cream)' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: 13 }}>New password for {u.name}</strong>
                            <input
                              className="ahf-input" type="password" minLength={6} value={resetPw}
                              onChange={(e) => setResetPw(e.target.value)}
                              placeholder="Min 6 chars" style={{ maxWidth: 220 }} autoComplete="new-password"
                            />
                            <button className="ahf-btn ahf-btn-primary ahf-btn-sm" onClick={() => resetPassword(u._id)} disabled={resetting}>
                              <i className="fas fa-check"></i> {resetting ? 'Saving…' : 'Save'}
                            </button>
                            <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => { setResetId(null); setResetPw(''); }}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={filtered.length} onPage={setPage} />
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!pendingToggle}
        message={pendingToggle ? `${pendingToggle.active ? 'Deactivate' : 'Activate'} ${pendingToggle.name}?` : ''}
        subtext={pendingToggle?.active ? 'They will not be able to log in.' : 'They will be able to log in again.'}
        confirmText={toggling ? 'Working…' : pendingToggle?.active ? 'Yes, Deactivate' : 'Yes, Activate'}
        confirmButtonVariant={pendingToggle?.active ? 'danger' : 'primary'}
        onConfirm={confirmToggle}
        onCancel={() => !toggling && setPendingToggle(null)}
      />
    </ModuleShell>
  );
}
