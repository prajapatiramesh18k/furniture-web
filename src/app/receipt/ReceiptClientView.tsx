'use client';

import { useRef, useState } from 'react';

interface ReceiptClientViewProps {
  employee: any;
  preview: any;
  payments: any[];
  month: number;
  year: number;
}

function ReceiptDocumentContent({
  employee,
  preview,
  payments,
  monthName,
  year,
  receiptNo,
  netPaid,
  isSettled,
  isPdf = false,
}: {
  employee: any;
  preview: any;
  payments: any[];
  monthName: string;
  year: number;
  receiptNo: string;
  netPaid: number;
  isSettled: boolean;
  isPdf?: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div className="rcpt-header-grid" style={isPdf ? { display: 'flex', justifyContent: 'space-between', padding: '1.8rem 2.2rem 1.4rem', borderBottom: '3px solid #a27341', gap: '1.5rem' } : undefined}>
        <div className="rcpt-header-left">
          <h2 className="rcpt-header-title" style={{ fontSize: isPdf ? '2.1rem' : '1.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Payment Receipt
          </h2>
          <div style={{ fontSize: isPdf ? '1.2rem' : '1.15rem', color: '#64748b', margin: '0.2rem 0 0.5rem', fontStyle: 'italic' }}>
            Employee Salary & Settlement Statement
          </div>
          <div className="rcpt-company-title" style={{ fontSize: isPdf ? '1.25rem' : '1.2rem', fontWeight: 800, color: '#a27341', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ANANYA HOUSE OF FURNITURE
          </div>
          <div className="rcpt-company-desc" style={{ fontSize: isPdf ? '1.15rem' : '1.1rem', color: '#475569', lineHeight: 1.55 }}>
            Diva-Shil Road, Khardipada, Thane, Maharashtra - 400612<br />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Tel:</span> +91 93218 12823, +91 83187 27813<br />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Email:</span> ananyahouseoffurniture@gmail.com
          </div>
        </div>

        {/* Logo badge */}
        <div className="rcpt-logo-wrap" style={isPdf ? { display: 'flex', alignItems: 'center', gap: '1.2rem', alignSelf: 'center', marginTop: '1rem' } : undefined}>
          <svg className="rcpt-logo-svg" width={isPdf ? '52' : '44'} height={isPdf ? '52' : '44'} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#a27341"/>
            <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M10 21V15.5H18V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M7 11.5H21" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="rcpt-logo-text" style={{ fontSize: isPdf ? '2.3rem' : '1.9rem', fontWeight: 800, color: '#a27341', letterSpacing: '2.5px', lineHeight: 1 }}>
              ANANYA
            </span>
            <span className="rcpt-logo-sub" style={{ fontSize: isPdf ? '1.05rem' : '0.95rem', fontWeight: 700, color: '#64748b', letterSpacing: '1.5px', marginTop: '3px', textTransform: 'uppercase' }}>
              HOUSE OF FURNITURE
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isPdf ? '0.8rem 2.2rem' : '0.65rem 1.6rem',
        background: '#faf8f5',
        borderBottom: '1px solid #e8dfd2',
        fontSize: isPdf ? '1.25rem' : '1.2rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Receipt No : </span>
          <span style={{ color: '#0f172a', fontWeight: 800 }}>{receiptNo}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Period : </span>
          <span style={{ color: '#a27341', fontWeight: 800 }}>{monthName} {year}</span>
        </div>
      </div>

      {/* Employee Details */}
      <div className="rcpt-section-pad" style={{ padding: isPdf ? '0.9rem 2.2rem' : '0.9rem 1.6rem' }}>
        <div style={{ fontSize: isPdf ? '1.35rem' : '1.3rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.35rem', marginBottom: '0.7rem' }}>
          Employee Details
        </div>
        <div className="rcpt-details-grid" style={isPdf ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#faf8f5', border: '1px solid #e8dfd2', borderRadius: '8px', padding: '0.8rem 1.4rem', gap: '0.8rem 1.5rem' } : undefined}>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Employee ID
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a27341', marginTop: '2px', letterSpacing: '0.5px' }}>
              {employee.employeeId || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Employee Name
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {employee.name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Department
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#a27341', marginTop: '2px' }}>
              {employee.department || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Role
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
              {employee.role || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Phone Number
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
              {employee.phone ? `+91 ${employee.phone.replace(/\D/g, '').slice(-10)}` : 'N/A'}
            </div>
          </div>
          <div className="rcpt-daily-rate-item">
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Daily Rate
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#a27341', marginTop: '2px' }}>
              ₹{employee.dailyRate}&nbsp;<span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#64748b' }}>/ day</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Work History */}
      <div className="rcpt-section-pad" style={{ padding: isPdf ? '0.9rem 2.2rem' : '0.75rem 1.6rem' }}>
        <div style={{ fontSize: isPdf ? '1.35rem' : '1.3rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
          1. Work History
        </div>
        <div className="rcpt-table-wrap">
          <table className="rcpt-table">
            <tbody>
              <tr>
                <td style={{ color: '#475569' }}>Total Work Hours</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{preview.totalWorkHours} Hours</td>
              </tr>
              <tr>
                <td style={{ color: '#475569' }}>Earned Days</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{preview.totalEarnedDays} Days</td>
              </tr>
              <tr>
                <td style={{ color: '#475569' }}>Daily Rate</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{preview.dailyRate}</td>
              </tr>
              <tr style={{ background: '#faf8f5' }}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>Total Earnings</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '1.3rem' }}>₹{preview.grossAmount?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Payment History */}
      <div className="rcpt-section-pad" style={{ padding: isPdf ? '0.9rem 2.2rem' : '0.75rem 1.6rem' }}>
        <div style={{ fontSize: isPdf ? '1.35rem' : '1.3rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
          2. Payment History
        </div>
        <div className="rcpt-table-wrap">
          {payments && payments.length > 0 ? (
            <table className="rcpt-table">
              <thead>
                <tr style={{ background: '#f5efe8', color: '#0f172a' }}>
                  <th style={{ textAlign: 'left', fontWeight: 700, fontSize: isPdf ? '1.2rem' : '1.15rem' }}>Date</th>
                  <th style={{ textAlign: 'left', fontWeight: 700, fontSize: isPdf ? '1.2rem' : '1.15rem' }}>Type</th>
                  <th style={{ textAlign: 'right', fontWeight: 700, fontSize: isPdf ? '1.2rem' : '1.15rem' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p._id}>
                    <td style={{ color: '#475569' }}>{new Date(p.date).toLocaleDateString()}</td>
                    <td style={{ color: '#475569' }}>{p.paymentType}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{p.amount?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: '#faf8f5' }}>
                  <td colSpan={2} style={{ fontWeight: 700, color: '#0f172a' }}>Total Previous Advances</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{preview.totalPaid?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="rcpt-table">
              <tbody>
                <tr>
                  <td style={{ color: '#475569' }}>Total Previous Advances</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹0</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Payment Details */}
      <div className="rcpt-section-pad" style={{ padding: isPdf ? '0.9rem 2.2rem' : '0.75rem 1.6rem' }}>
        <div style={{ fontSize: isPdf ? '1.35rem' : '1.3rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
          3. Payment Details
        </div>
        <div className="rcpt-table-wrap">
          <table className="rcpt-table">
            <tbody>
              <tr>
                <td style={{ color: '#475569' }}>Total Earnings</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{preview.grossAmount?.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ color: '#475569' }}>Previous Advances / Deductions</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>- ₹{preview.totalPaid?.toLocaleString()}</td>
              </tr>
              <tr style={{ background: '#faf8f5' }}>
                <td style={{ fontWeight: 800, fontSize: isPdf ? '1.45rem' : '1.35rem', color: '#a27341' }}>
                  {isSettled ? 'Total Paid / Settled' : 'Final Amount Due'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 900, fontSize: isPdf ? '1.65rem' : '1.6rem', color: '#a27341' }}>
                  ₹{netPaid?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="rcpt-sig-row" style={isPdf ? { display: 'flex', justifyContent: 'space-between', padding: '1.2rem 3rem 0.6rem', marginTop: '0.6rem' } : undefined}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '32px' }}></div>
          <div className="rcpt-sig-line" style={{ borderTop: '1.5px solid #334155', width: isPdf ? '180px' : '150px', margin: '0 auto 0.35rem' }}></div>
          <p style={{ fontSize: '1.15rem', color: '#64748b', margin: 0 }}>Employee Signature</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '32px' }}></div>
          <div className="rcpt-sig-line" style={{ borderTop: '1.5px solid #334155', width: isPdf ? '200px' : '170px', margin: '0 auto 0.35rem' }}></div>
          <p style={{ fontSize: '1.15rem', color: '#64748b', margin: '0 0 0.15rem', whiteSpace: 'nowrap' }}>Authorized By</p>
          <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#000000', margin: 0, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
            Mahesh Prajapati
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: isPdf ? '0.8rem 2.2rem 1.2rem' : '0.75rem 1.4rem 1.1rem', borderTop: '2px solid #a27341', marginTop: '0.6rem' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>Ananya House of Furniture</p>
        <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>Thank you for your work with us.</p>
      </div>
    </>
  );
}

export default function ReceiptClientView({
  employee,
  preview,
  payments,
  month,
  year,
}: ReceiptClientViewProps) {
  const pdfReceiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'long' });

  const generateReceiptNumber = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `AHF-${year}-${pad(month)}-${employee?.name?.substring(0, 3).toUpperCase() || '000'}`;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(200, prev + 15));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(60, prev - 15));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleDownload = async () => {
    if (!pdfReceiptRef.current) return;
    setDownloading(true);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(pdfReceiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
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
      const posY = margin + Math.max(0, (maxH - renderH) / 8);

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');

      const safeName = (employee?.name || 'Employee').replace(/\s+/g, '_');
      pdf.save(`Payment_Receipt_${safeName}_${monthName}_${year}.pdf`);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Failed to generate PDF. Please try again.');
    }
    setDownloading(false);
  };

  const isSettled = !preview.isPreview;
  const netPaid = isSettled
    ? (preview.settlementAmount !== undefined && preview.settlementAmount !== null ? preview.settlementAmount : preview.balanceAmount)
    : preview.balanceAmount;

  const receiptNo = generateReceiptNumber();

  return (
    <div className="receipt-page-wrapper">
      <style>{`
        /* Crucial: Override global styling so mobile viewports fit 100% and pinch-to-zoom is unrestricted */
        html, body {
          padding-top: 0 !important;
          margin: 0 !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          background-color: #f1f5f9 !important;
          touch-action: pan-x pan-y pinch-zoom !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .receipt-page-wrapper {
          background-color: #f1f5f9;
          min-height: 100vh;
          padding: 1rem 0.6rem 6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
        }

        .receipt-card {
          width: 100%;
          max-width: 800px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          box-sizing: border-box;
          transition: transform 0.15s ease;
        }

        .rcpt-header-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.4rem 1.6rem 1.1rem;
          border-bottom: 3px solid #a27341;
          gap: 0.8rem;
        }

        .rcpt-header-left {
          flex: 1 1 200px;
          min-width: 0;
        }

        .rcpt-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          flex-shrink: 0;
        }

        .rcpt-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          background: #faf8f5;
          border: 1px solid #e8dfd2;
          border-radius: 8px;
          padding: 0.9rem 1.2rem;
          gap: 0.8rem 1.2rem;
        }

        .rcpt-table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .rcpt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 1.25rem;
        }

        .rcpt-table td, .rcpt-table th {
          padding: 0.65rem 0.8rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .rcpt-sig-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 1.4rem 2rem 0.8rem;
          margin-top: 0.4rem;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .receipt-page-wrapper {
            padding: 0.6rem 0.4rem 5.5rem;
          }

          .rcpt-header-grid {
            padding: 1rem 1rem 0.8rem;
          }

          .rcpt-header-title {
            font-size: 1.6rem !important;
          }

          .rcpt-company-title {
            font-size: 1.15rem !important;
          }

          .rcpt-company-desc {
            font-size: 1.05rem !important;
            line-height: 1.45 !important;
          }

          .rcpt-logo-svg {
            width: 38px !important;
            height: 38px !important;
          }

          .rcpt-logo-text {
            font-size: 1.6rem !important;
          }

          .rcpt-logo-sub {
            font-size: 0.85rem !important;
            letter-spacing: 1px !important;
          }

          .rcpt-details-grid {
            grid-template-columns: 1fr 1fr;
            padding: 0.7rem 0.8rem;
            gap: 0.6rem;
          }

          .rcpt-daily-rate-item {
            grid-column: span 2;
          }

          .rcpt-section-pad {
            padding: 0.7rem 0.9rem !important;
          }

          .rcpt-table {
            font-size: 1.15rem;
          }

          .rcpt-table td, .rcpt-table th {
            padding: 0.55rem 0.6rem;
          }

          .rcpt-sig-row {
            padding: 1.2rem 1rem 0.8rem;
          }

          .rcpt-sig-line {
            width: 120px !important;
          }
        }
      `}</style>

      {/* Top Action Bar */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '0.8rem 1.2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '0.9rem',
        flexWrap: 'wrap',
        gap: '0.6rem',
        boxSizing: 'border-box',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payment Receipt</h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', margin: '2px 0 0' }}>{employee.name} • {monthName} {year}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            backgroundColor: '#a27341',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.7rem 1.3rem',
            fontSize: '1.25rem',
            fontWeight: 700,
            cursor: downloading ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(162, 115, 65, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <i className={downloading ? 'fas fa-spinner fa-spin' : 'fas fa-download'}></i>
          {downloading ? 'Generating...' : 'Download PDF Receipt'}
        </button>
      </div>

      {/* On-Screen Scalable Receipt Card (Fits 100% on mobile, zoomable) */}
      <div
        className="receipt-card"
        style={{
          zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
        }}
      >
        <ReceiptDocumentContent
          employee={employee}
          preview={preview}
          payments={payments}
          monthName={monthName}
          year={year}
          receiptNo={receiptNo}
          netPaid={netPaid}
          isSettled={isSettled}
          isPdf={false}
        />
      </div>

      {/* Floating Bottom Zoom & Quick PDF Toolbar */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(8px)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="fas fa-search-minus"></i>
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset to Full Fit"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.15rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '3px 9px',
            borderRadius: '12px',
          }}
        >
          {zoomLevel}% Fit
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="fas fa-search-plus"></i>
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Download PDF Receipt"
          style={{
            background: '#a27341',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.15rem',
            fontWeight: 700,
            cursor: downloading ? 'wait' : 'pointer',
            padding: '5px 12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <i className={downloading ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'}></i>
          <span>{downloading ? '...' : 'PDF'}</span>
        </button>
      </div>

      {/* Offscreen Fixed 800px A4 Printable Container (Solely for html2canvas -> jsPDF) */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '800px', pointerEvents: 'none', background: '#ffffff', opacity: 1 }}>
        <div
          ref={pdfReceiptRef}
          style={{
            width: '800px',
            minWidth: '800px',
            maxWidth: '800px',
            backgroundColor: '#ffffff',
            padding: 0,
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
            color: '#1b1b1b',
            boxSizing: 'border-box',
            overflow: 'visible',
          }}
        >
          <ReceiptDocumentContent
            employee={employee}
            preview={preview}
            payments={payments}
            monthName={monthName}
            year={year}
            receiptNo={receiptNo}
            netPaid={netPaid}
            isSettled={isSettled}
            isPdf={true}
          />
        </div>
      </div>
    </div>
  );
}
