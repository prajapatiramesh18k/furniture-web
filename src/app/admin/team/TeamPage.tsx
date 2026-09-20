'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import EmployeesTab from '@/components/admin/EmployeesTab';
import LiveAttendanceTab from '@/components/admin/LiveAttendanceTab';
import SitesTab from '@/components/admin/SitesTab';
import PayrollTab from '@/components/admin/PayrollTab';
import { ModuleShell } from '@/components/admin/ModuleBits';

export type TeamTab = 'employees' | 'live-attendance' | 'sites' | 'payroll';

export const TAB_TITLES: Record<TeamTab, { title: string; sub: string }> = {
  employees: { title: 'Employee List', sub: 'All staff records, attendance & payments per employee' },
  'live-attendance': { title: 'Live Attendance', sub: 'Who is on site right now' },
  sites: { title: 'Job Sites', sub: 'Manage work locations and site radius' },
  payroll: { title: 'Payroll & Settlement', sub: 'Advances, payments and monthly settlements' },
};

function TeamGate({ tab, children }: { tab: TeamTab; children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [deniedMsg, setDeniedMsg] = useState('Employee Management is restricted to administrators.');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const u = data?.user;
        const role = String(u?.role || (u?.isAdmin ? 'admin' : '')).toLowerCase();
        const perms: string[] = Array.isArray(u?.permissions) ? u.permissions : [];
        const hasTeam = !!(u && (u.isSuperAdmin || u.isAdmin || role === 'owner' || role === 'admin' || role === 'manager' || perms.includes('team')));
        if (!hasTeam) {
          setDeniedMsg('Employee Management is restricted to administrators.');
          setState('denied');
          return;
        }
        // Job Sites + Payroll & Settlement are owner/admin-only.
        // Managers keep Employee List + Live Attendance (mark attendance, view team).
        if ((tab === 'sites' || tab === 'payroll') && !(u.isSuperAdmin || role === 'owner' || role === 'admin')) {
          setDeniedMsg(tab === 'sites' ? 'Job Sites can only be managed by the owner/admin.' : 'Payroll & Settlement is visible to the owner/admin only.');
          setState('denied');
          return;
        }
        setState('ok');
      } catch {
        setState('denied');
      }
    })();
  }, [tab]);

  if (state === 'loading') {
    return (
      <ModuleShell title={TAB_TITLES[tab].title} sub={TAB_TITLES[tab].sub}>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="ahf-skel" style={{ height: 56 }} />)}
        </div>
      </ModuleShell>
    );
  }

  if (state === 'denied') {
    return (
      <ModuleShell title={TAB_TITLES[tab].title} sub={TAB_TITLES[tab].sub}>
        <div className="ahf-panel">
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic" style={{ marginBottom: 14 }}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>Not Permitted</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>
              {deniedMsg}
            </p>
            <Link href="/admin/dashboard" className="ahf-btn ahf-btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ModuleShell>
    );
  }

  return <>{children}</>;
}

export default function TeamPage({ tab }: { tab: TeamTab }) {
  return (
    <TeamGate tab={tab}>
      {tab === 'employees' && <EmployeesTab />}
      {tab === 'live-attendance' && <LiveAttendanceTab />}
      {tab === 'sites' && <SitesTab />}
      {tab === 'payroll' && <PayrollTab />}
    </TeamGate>
  );
}
