'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface U { _id: string; name: string; email: string; role: string; phone: string; active: boolean; createdAt: string }

export default function AdminCustomers() {
  const { data, loading } = useAdminFetch<{ users: U[] }>('/api/admin/users');
  const [q, setQ] = useState('');
  const users = useMemo(() => (data?.users || []).filter((u) => {
    const s = q.toLowerCase();
    return !s || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(s);
  }), [data, q]);

  return (
    <ModuleShell title="Customers" sub={`${data?.users?.length || 0} registered accounts`}>
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div className="ahf-toolbar" style={{ marginBottom: 0 }}>
            <div className="ahf-search-inline">
              <i className="fas fa-search"></i>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" />
            </div>
          </div>
        </div>
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>Customer Directory</h3><p>Live data from your user database</p></div></div>
        {loading ? <LoadingList /> : (
          <DataTable
            columns={[
              { key: 'n', header: 'Customer', render: (u) => (
                <div className="ahf-cust"><span className="ahf-avatar">{(u.name || '?')[0].toUpperCase()}</span>
                <div><strong>{u.name}</strong><span>{u.email}</span></div></div>) },
              { key: 'p', header: 'Phone', render: (u) => <span>{u.phone || '—'}</span> },
              { key: 'r', header: 'Role', render: (u) => <StatusBadge status={u.role} /> },
              { key: 's', header: 'Status', render: (u) => <StatusBadge status={u.active ? 'Active' : 'Cancelled'} /> },
              { key: 'd', header: 'Joined', render: (u) => <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</span> },
            ]}
            rows={users}
            emptyText="No customers found."
          />
        )}
      </div>
    </ModuleShell>
  );
}
