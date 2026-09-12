'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const monthStr = searchParams.get('month');
  const yearStr = searchParams.get('year');

  const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  const [employee, setEmployee] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'long' });

  useEffect(() => {
    if (!employeeId) {
      setError('Invalid receipt link. Missing employee information.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [empRes, settRes, payRes] = await Promise.all([
          fetch(`/api/admin/employees/${employeeId}`),
          fetch(`/api/admin/employees/settlements?employeeId=${employeeId}&month=${month}&year=${year}`),
          fetch(`/api/admin/employees/payments?employeeId=${employeeId}`),
        ]);

        if (!empRes.ok) throw new Error('Employee not found');
        const empData = await empRes.json();
        setEmployee(empData);

        if (settRes.ok) {
          const settData = await settRes.json();
          setPreview(settData);
        }

        if (payRes.ok) {
          const payData = await payRes.json();
          const filtered = (payData || []).filter((p: any) => {
            const pDate = new Date(p.date);
            return pDate.getMonth() + 1 === month && pDate.getFullYear() === year;
          });
          setPayments(filtered);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading receipt details');
      }
      setLoading(false);
    };

    fetchData();
  }, [employeeId, month, year]);

  const generateReceiptNumber = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `AHF-${year}-${pad(month)}-${employee?.name?.substring(0, 3).toUpperCase() || '000'}`;
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;

      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const renderW = canvas.width * ratio;
      const renderH = canvas.height * ratio;
      const posX = margin + (maxW - renderW) / 2;
      const posY = margin + Math.max(0, (maxH - renderH) / 6);

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH);

      const safeName = (employee?.name || 'Employee').replace(/\s+/g, '_');
      pdf.save(`Payment_Receipt_${safeName}_${monthName}_${year}.pdf`);
    } catch (err) {
      console.error('PDF error', err);
      alert('Failed to generate PDF. Please try again.');
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2.4rem', color: '#a27341', marginBottom: '1rem' }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p style={{ fontSize: '1.4rem', color: '#666' }}>Loading official payment receipt...</p>
      </div>
    );
  }

  if (error || !employee || !preview) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', color: '#dc2626', marginBottom: '1rem' }}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.8rem' }}>Receipt Not Found</h2>
        <p style={{ fontSize: '1.4rem', color: '#64748b', maxWidth: '450px' }}>
          {error || 'Unable to retrieve receipt for this employee and period.'}
        </p>
      </div>
    );
  }

  const isSettled = !preview.isPreview;
  const netPaid = isSettled
    ? (preview.settlementAmount !== undefined && preview.settlementAmount !== null ? preview.settlementAmount : preview.balanceAmount)
    : preview.balanceAmount;

  const rcptSection: React.CSSProperties = { padding: '0.9rem 2.2rem', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptSectionTitle: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 700, color: '#1b1b1b', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.4rem', marginBottom: '0.7rem', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '1.25rem', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTd: React.CSSProperties = { padding: '0.5rem 0.8rem', borderBottom: '1px solid #f0f0f0', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTdRight: React.CSSProperties = { ...rcptTd, textAlign: 'right', fontWeight: 500 };
  const rcptTdBold: React.CSSProperties = { ...rcptTd, fontWeight: 700, color: '#1b1b1b' };
  const rcptTdBoldRight: React.CSSProperties = { ...rcptTdRight, fontWeight: 700, color: '#1b1b1b', fontSize: '1.35rem' };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '2rem 1rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Download Action Bar */}
      <div style={{
        maxWidth: '820px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '1.2rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Payment Receipt</h1>
          <p style={{ fontSize: '1.25rem', color: '#64748b', margin: '2px 0 0' }}>{employee.name} • {monthName} {year}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            backgroundColor: '#a27341',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.9rem 2rem',
            fontSize: '1.35rem',
            fontWeight: 700,
            cursor: downloading ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 2px 6px rgba(162, 115, 65, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <i className={downloading ? 'fas fa-spinner fa-spin' : 'fas fa-download'}></i>
          {downloading ? 'Generating PDF...' : 'Download PDF Receipt'}
        </button>
      </div>

      {/* Printable Receipt Container */}
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div
          ref={receiptRef}
          style={{
            width: '800px',
            minWidth: '800px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
            color: '#1b1b1b',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.8rem 2.2rem 1.4rem',
            borderBottom: '3px solid #a27341',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1 1 320px', minWidth: '240px' }}>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1b1b1b', margin: 0, textTransform: 'none', letterSpacing: '0.2px' }}>
                Payment Receipt
              </h2>
              <div style={{ fontSize: '1.2rem', color: '#666', margin: '0.3rem 0 0', fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.2px' }}>
                Employee Salary & Settlement Statement
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a27341', margin: '0.8rem 0 0.4rem', letterSpacing: '0.5px' }}>
                {monthName} {year}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1b1b1b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                ANANYA HOUSE OF FURNITURE
              </div>
              <div style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.7 }}>
                Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612<br />
                <span style={{ fontWeight: 600, color: '#333' }}>Tel :</span> +91 93218 12823, +91 83187 27813<br />
                <span style={{ fontWeight: 600, color: '#333' }}>Email :</span> ananyahouseoffurniture@gmail.com
              </div>
            </div>

            {/* Right: Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', alignSelf: 'center', marginTop: '2rem' }}>
              <svg width="54" height="54" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="5" fill="#a27341"/>
                <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                <path d="M10 21V15.5H18V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                <path d="M7 11.5H21" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#a27341', letterSpacing: '4px', lineHeight: 1 }}>
                  ANANYA
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', letterSpacing: '3px', marginTop: '5px', textTransform: 'uppercase' }}>
                  HOUSE OF FURNITURE
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Info Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 2.2rem',
            background: '#faf8f5',
            borderBottom: '1px solid #e8dfd2',
            fontSize: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#555', fontWeight: 700 }}>Receipt No :</span>
              <span style={{ color: '#1b1b1b', fontWeight: 800, letterSpacing: '0.5px' }}>{generateReceiptNumber()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#555', fontWeight: 700 }}>Period :</span>
              <span style={{ color: '#a27341', fontWeight: 800 }}>{monthName} {year}</span>
            </div>
          </div>

          {/* Employee Details */}
          <div style={rcptSection}>
            <div style={rcptSectionTitle}>Employee Details</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              background: '#faf8f5',
              border: '1px solid #e8dfd2',
              borderRadius: '8px',
              padding: '0.8rem 1.4rem',
              gap: '0.8rem 1.5rem',
            }}>
              <div>
                <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                  Employee Name
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1b1b1b' }}>
                  {employee.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                  Department
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a27341' }}>
                  {employee.department || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                  Role
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#333' }}>
                  {employee.role || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                  Phone Number
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#333' }}>
                  {employee.phone ? `+91 ${employee.phone.replace(/\D/g, '').slice(-10)}` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                  Daily Rate
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a27341' }}>
                  ₹{employee.dailyRate}&nbsp;<span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#777' }}>/ day</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Work History */}
          <div style={rcptSection}>
            <div style={rcptSectionTitle}>Work History</div>
            <table style={rcptTable}>
              <tbody>
                <tr><td style={rcptTd}>Total Work Hours</td><td style={rcptTdRight}>{preview.totalWorkHours} Hours</td></tr>
                <tr><td style={rcptTd}>Earned Days</td><td style={rcptTdRight}>{preview.totalEarnedDays} Days</td></tr>
                <tr><td style={rcptTd}>Daily Rate</td><td style={rcptTdRight}>₹{preview.dailyRate}</td></tr>
                <tr style={{ background: '#faf8f5' }}><td style={rcptTdBold}>Total Earnings</td><td style={rcptTdBoldRight}>₹{preview.grossAmount?.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>

          {/* 2. Payment History */}
          <div style={rcptSection}>
            <div style={rcptSectionTitle}>Payment History</div>
            {payments.length > 0 ? (
              <table style={rcptTable}>
                <thead>
                  <tr style={{ background: '#f5efe8', color: '#1b1b1b' }}>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Payment Date</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Payment Type</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'right', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td style={rcptTd}>{new Date(p.date).toLocaleDateString()}</td>
                      <td style={rcptTd}>{p.paymentType}</td>
                      <td style={rcptTdRight}>₹{p.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#faf8f5' }}>
                    <td colSpan={2} style={rcptTdBold}>Total Previous Advances / Deductions</td>
                    <td style={rcptTdBoldRight}>₹{preview.totalPaid?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table style={rcptTable}>
                <tbody>
                  <tr><td style={rcptTd}>Total Previous Advances</td><td style={rcptTdRight}>₹0</td></tr>
                </tbody>
              </table>
            )}
          </div>

          {/* 3. Payment Details */}
          <div style={rcptSection}>
            <div style={rcptSectionTitle}>Payment Details</div>
            <table style={rcptTable}>
              <tbody>
                <tr><td style={rcptTd}>Total Earnings</td><td style={rcptTdRight}>₹{preview.grossAmount?.toLocaleString()}</td></tr>
                <tr><td style={rcptTd}>Previous Advances / Deductions</td><td style={rcptTdRight}>- ₹{preview.totalPaid?.toLocaleString()}</td></tr>
                <tr style={{ background: '#faf8f5' }}>
                  <td style={{ ...rcptTdBold, fontSize: '1.45rem', color: '#a27341' }}>
                    {isSettled ? 'Total Paid / Settled' : 'Final Amount Due'}
                  </td>
                  <td style={{ ...rcptTdBoldRight, fontSize: '1.65rem', color: '#a27341' }}>
                    ₹{netPaid?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem 3rem 0.6rem', marginTop: '0.6rem' }}>
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1.5px solid #333', width: '180px', marginBottom: '0.4rem' }}></div>
              <p style={{ fontSize: '1.2rem', color: '#555', margin: 0 }}>Employee Signature</p>
            </div>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1.5px solid #333', width: '200px', marginBottom: '0.6rem' }}></div>
              <p style={{ fontSize: '1.2rem', color: '#555', margin: '0 0 0.4rem' }}>Authorized By</p>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#000000', margin: 0, letterSpacing: '0.3px' }}>
                Mahesh Prajapati
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '0.8rem 2.2rem 1.2rem', borderTop: '2px solid #a27341', marginTop: '0.8rem' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1b1b1b', margin: '0.5rem 0' }}>Ananya House of Furniture</p>
            <p style={{ fontSize: '1.15rem', color: '#888', margin: 0, fontStyle: 'italic' }}>Thank you for your work with us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
