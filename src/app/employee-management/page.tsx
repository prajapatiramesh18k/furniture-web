'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EmployeesTab from '@/components/admin/EmployeesTab';
import PayrollTab from '@/components/admin/PayrollTab';

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <>
      <Navbar />
      <div className="admin-container" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 5%' }}>
        <div className="admin-header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage attendance, payments, and settlements.</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === 'employees' ? 'active' : ''}
            onClick={() => setActiveTab('employees')}
          >
            <i className="fas fa-users"></i> Employees List
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
          {activeTab === 'payroll' && <PayrollTab />}
        </div>
      </div>
      <Footer />
    </>
  );
}
