'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CloseButton from '@/components/CloseButton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Code-split the 5k-line admin tabs so the page loads fast and each tab
// downloads only when opened.
const EmployeesTab = dynamic(() => import('@/components/admin/EmployeesTab'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading employees…</div>,
});
const PayrollTab = dynamic(() => import('@/components/admin/PayrollTab'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading payroll…</div>,
});
const SitesTab = dynamic(() => import('@/components/admin/SitesTab'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sites…</div>,
});
const LiveAttendanceTab = dynamic(() => import('@/components/admin/LiveAttendanceTab'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading live attendance…</div>,
});

export default function EmployeeManagementPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    document.title = 'Employee Management | Ananya House of Furniture';
    try {
      const raw = sessionStorage.getItem('auth-user');
      const user = raw ? JSON.parse(raw) : null;
      setAuthorized(!!(user && user.isAdmin));
    } catch {
      setAuthorized(false);
    }
  }, []);

  if (authorized === null) {
    return <div style={{ minHeight: '60vh' }} />;
  }

  if (authorized === false) {
    return (
      <div className="quotation-page">
        <div className="quotation-hero no-print">
          <CloseButton href="/" />
          <h1>Admin <span>Access</span></h1>
          <p>This page is restricted to administrators.</p>
        </div>
        <div className="quotation-locked">
          <i className="fas fa-lock"></i>
          <h2>Login required</h2>
          <p>You need an admin account to use the Employee Management.</p>
          <button type="button" className="cpf-submit" onClick={() => router.push('/login')}>
            <i className="fas fa-arrow-right"></i> Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-container" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 5%' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Employee Management</h1>
            <p>Manage on-site attendance, job sites, payroll, and settlements.</p>
          </div>
          <Link
            href="/punch"
            target="_blank"
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              padding: '0.8rem 1.4rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(21, 128, 61, 0.3)',
            }}
          >
            <i className="fas fa-fingerprint"></i> Open Worker Punch App
          </Link>
        </div>

        <div className="admin-tabs" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button
            className={activeTab === 'employees' ? 'active' : ''}
            onClick={() => setActiveTab('employees')}
          >
            <i className="fas fa-users"></i> Employees List
          </button>
          <button
            className={activeTab === 'live-attendance' ? 'active' : ''}
            onClick={() => setActiveTab('live-attendance')}
          >
            <i className="fas fa-clock"></i> Live Attendance
          </button>
          <button
            className={activeTab === 'sites' ? 'active' : ''}
            onClick={() => setActiveTab('sites')}
          >
            <i className="fas fa-map-marked-alt"></i> Job Sites
          </button>
          <button
            className={activeTab === 'payroll' ? 'active' : ''}
            onClick={() => setActiveTab('payroll')}
          >
            <i className="fas fa-file-invoice-dollar"></i> Payroll & Settlement
          </button>
        </div>

        <div className="admin-content" style={{ marginTop: '2rem' }}>
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'live-attendance' && <LiveAttendanceTab />}
          {activeTab === 'sites' && <SitesTab />}
          {activeTab === 'payroll' && <PayrollTab />}
        </div>
      </div>
      <Footer />
    </>
  );
}
