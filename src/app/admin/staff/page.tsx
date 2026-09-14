'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';
import { ADMIN_MODULES } from '@/lib/admin-roles';

interface U { _id: string; name: string; email: string; role: string; active: boolean }

const ROLES = ['admin', 'manager', 'staff', 'customer'];

export default function AdminStaff() {
  const { data, loading, refresh } = useAdminFetch<{ users: U[] }>('/api/admin/users');
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const users = useMemo(() => (data?.users || []).filter((u) => {
    const s = q.toLowerCase();
    return !s || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(s);
  }), [data, q]);

  const setRole = async (id: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setToast(`Role updated to ${role}`); refresh(); }
    else alert(d.error || 'Failed to update role');
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <ModuleShell title="Staff / Users" sub="Roles control which admin modules each member can open">
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div className="ahf-toolbar" style={{ marginBottom: 0 }}>
            <div className="ahf-search-inline">
              <i className="fas fa-search"></i>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff…" />
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ahf-muted)' }}>
              Modules available for assignment: {ADMIN_MODULES.join(', ')}
            </span>
          </div>
        </div>
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>Team & Accounts ({users.length})</h3><p>Admins can change roles — changes apply on next login</p></div></div>
        {loading ? <LoadingList /> : (
          <DataTable
            columns={[
              { key: 'n', header: 'Member', render: (u) => (
                <div className="ahf-cust"><span className="ahf-avatar">{(u.name || '?')[0].toUpperCase()}</span>
                <div><strong>{u.name}</strong><span>{u.email}</span></div></div>) },
              { key: 'r', header: 'Current Role', render: (u) => <StatusBadge status={u.role} /> },
              { key: 's', header: 'Status', render: (u) => <StatusBadge status={u.active ? 'Active' : 'Cancelled'} /> },
              { key: 'a', header: 'Change Role', render: (u) => (
                <select className="ahf-select" style={{ padding: '6px 8px', fontSize: 12 }} value={u.role} onChange={(e) => setRole(u._id, e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>) },
            ]}
            rows={users}
            emptyText="No team members found."
          />
        )}
      </div>
    </ModuleShell>
  );
}
