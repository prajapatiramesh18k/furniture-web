'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import EmployeesTab from '@/components/admin/EmployeesTab';
import LiveAttendanceTab from '@/components/admin/LiveAttendanceTab';
import SitesTab from '@/components/admin/SitesTab';
import PayrollTab from '@/components/admin/PayrollTab';

export type TeamTab = 'employees' | 'live-attendance' | 'sites' | 'payroll';

const TAB_TITLES: Record<TeamTab, { title: string; sub: string }> = {
  employees: { title: 'Employee List', sub: 'All staff records, attendance & payments per employee' },
  'live-attendance': { title: 'Live Attendance', sub: "Who is on site right now" },
  sites: { title: 'Job Sites', sub: 'Manage work locations and site radius' },
  payroll: { title: 'Payroll & Settlement', sub: 'Advances, payments and monthly settlements' },
};

function TeamGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const u = data?.user;
        const role = String(u?.role || (u?.isAdmin ? 'admin' : '')).toLowerCase();
        const perms: string[] = Array.isArray(u?.permissions) ? u.permissions : [];
        setState(u && (u.isAdmin || role === 'admin' || perms.includes('team')) ? 'ok' : 'denied');
      } catch {
        setState('denied');
      }
    })();
  }, []);

  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="ahf-skel" style={{ height: 64 }} />
        ))}
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="ahf-panel">
        <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
          <h3 style={{ margin: '0 0 8px' }}>Access Denied</h3>
          <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5 }}>
            Employee Management is restricted to administrators.
          </p>
          <Link href="/admin/dashboard" className="ahf-btn ahf-btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function TeamPage({ tab }: { tab: TeamTab }) {
  const meta = TAB_TITLES[tab];
  return (
    <TeamGate>
      <div className="ahf-pagehead">
        <div>
          <p>Employee Management</p>
          <h2>{meta.title}</h2>
          <p>{meta.sub}</p>
        </div>
      </div>
      {tab === 'employees' && <EmployeesTab />}
      {tab === 'live-attendance' && <LiveAttendanceTab />}
      {tab === 'sites' && <SitesTab />}
      {tab === 'payroll' && <PayrollTab />}
    </TeamGate>
  );
}
