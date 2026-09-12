'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmployeesTab from '@/components/admin/EmployeesTab';
import PayrollTab from '@/components/admin/PayrollTab';
import SitesTab from '@/components/admin/SitesTab';
import LiveAttendanceTab from '@/components/admin/LiveAttendanceTab';

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState('employees');

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
