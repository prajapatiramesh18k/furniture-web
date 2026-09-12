'use client';

import dynamic from 'next/dynamic';

const PunchClientView = dynamic(() => import('./PunchClientView'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.8rem', color: '#a27341', marginBottom: '1.2rem' }}></i>
        <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#334155' }}>Loading Attendance...</div>
      </div>
    </div>
  ),
});

export default function PunchClientWrapper() {
  return <PunchClientView />;
}
