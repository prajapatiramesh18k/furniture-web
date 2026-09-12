'use client';
import { useState, useEffect, useRef } from 'react';
import FloatingSelect from './FloatingSelect';
import FloatingInput from './FloatingInput';

export default function PayrollTab() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [settlementError, setSettlementError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'long' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEmployee = async (emp: any) => {
    setSelectedEmployee(emp);
    setPreview(null);
    setSettlementError('');
    setCardOpen(true);
    setLoading(true);
    try {
      const [settleRes, payRes] = await Promise.all([
        fetch(`/api/admin/employees/settlements?employeeId=${emp._id}&month=${month}&year=${year}`),
        fetch(`/api/admin/employees/payments?employeeId=${emp._id}`)
      ]);
      const settleData = await settleRes.json();
      const payData = await payRes.json();
      setPreview(settleData);
      // Filter payments for the selected month/year (exclude Settlement records from advance payment history)
      const filtered = payData.filter((p: any) => {
        const d = new Date(p.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year && p.paymentType?.toLowerCase() !== 'settlement';
      });
      setPayments(filtered);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCloseCard = () => {
    setCardOpen(false);
    setSelectedEmployee(null);
    setPreview(null);
  };

  const handleSettle = async () => {
    if (!preview || !preview.isPreview) return;
    try {
      const res = await fetch('/api/admin/employees/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          month,
          year,
          totalWorkHours: preview.totalWorkHours,
          totalEarnedDays: preview.totalEarnedDays,
          dailyRate: preview.dailyRate,
          grossAmount: preview.grossAmount,
          totalPaid: preview.totalPaid,
          balanceAmount: preview.balanceAmount,
          settlementAmount: preview.balanceAmount
        }),
      });

      if (res.ok) {
        showToast('Account Settled Successfully');
        handleSelectEmployee(selectedEmployee);
      } else {
        const err = await res.json();
        setSettlementError(err.error);
        showToast(err.error || 'Settlement Failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    }
  };

  const generateReceiptNumber = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `AHF-${year}-${pad(month)}-${selectedEmployee?.name?.substring(0, 3).toUpperCase() || '000'}`;
  };

  const generateReceiptPdf = async () => {
    if (!receiptRef.current || !selectedEmployee) return null;
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

    // Fit strictly on a single A4 page
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const renderW = canvas.width * ratio;
    const renderH = canvas.height * ratio;
    const posX = margin + (maxW - renderW) / 2;
    const posY = margin + Math.max(0, (maxH - renderH) / 6);

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH);

    const safeName = (selectedEmployee.name || 'Employee').replace(/\s+/g, '_');
    const fileName = `Payment_Receipt_${safeName}_${monthName}_${year}.pdf`;

    return { pdf, fileName };
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || preview?.isPreview) return;
    setDownloading(true);
    try {
      const result = await generateReceiptPdf();
      if (result) {
        result.pdf.save(result.fileName);
        showToast('PDF Downloaded Successfully');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF', 'error');
    }
    setDownloading(false);
  };

  const handleWhatsAppReceipt = () => {
    if (!preview || !selectedEmployee || preview.isPreview) return;

    const phone = selectedEmployee.phone ? selectedEmployee.phone.replace(/\D/g, '').slice(-10) : '';
    const receiptNo = generateReceiptNumber();
    const isSettled = !preview.isPreview;
    const netPaid = isSettled
      ? (preview.settlementAmount !== undefined && preview.settlementAmount !== null ? preview.settlementAmount : preview.balanceAmount)
      : preview.balanceAmount;

    let origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = 'https://furniture-next-pi.vercel.app';
    }
    const onlineReceiptUrl = `${origin}/receipt?employeeId=${selectedEmployee._id}&month=${month}&year=${year}`;

    const messageText = `*ANANYA HOUSE OF FURNITURE*\n` +
      `*Employee Payment Receipt — ${monthName} ${year}*\n\n` +
      `Dear *${selectedEmployee.name}*,\n` +
      `Your payment receipt for *${monthName} ${year}* has been generated.\n\n` +
      `• *Receipt No:* ${receiptNo}\n` +
      `• *Period:* ${monthName} ${year}\n` +
      `• *Net Paid / Settled:* ₹${netPaid?.toLocaleString()}\n\n` +
      `📄 *Please click the link below to view and download your official payment receipt PDF:*\n` +
      `${onlineReceiptUrl}\n\n` +
      `Thank you,\n` +
      `*Ananya House of Furniture*`;

    const waUrl = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(messageText)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    window.open(waUrl, '_blank');
  };

  // Receipt styles
  const rcptHeader: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.8rem 2.2rem 1.4rem',
    borderBottom: '3px solid var(--primary-color)',
    gap: '1.5rem',
    flexWrap: 'wrap',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
    textTransform: 'none',
    letterSpacing: '0.2px',
  };
  const rcptTitle: React.CSSProperties = { fontSize: '2.1rem', fontWeight: 800, color: 'var(--main-color)', margin: 0, textTransform: 'none', letterSpacing: '0.2px' };
  const rcptSubtitle: React.CSSProperties = { fontSize: '1.2rem', color: '#666', margin: '0.3rem 0 0', fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptSection: React.CSSProperties = { padding: '0.9rem 2.2rem', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif", textTransform: 'none', letterSpacing: '0.2px' };
  const rcptSectionTitle: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 700, color: 'var(--main-color)', borderBottom: '2px solid #e8dfd2', paddingBottom: '0.4rem', marginBottom: '0.7rem', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '1.25rem', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif", textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTd: React.CSSProperties = { padding: '0.5rem 0.8rem', borderBottom: '1px solid #f0f0f0', textTransform: 'none', letterSpacing: '0.2px' };
  const rcptTdRight: React.CSSProperties = { ...rcptTd, textAlign: 'right', fontWeight: 500 };
  const rcptTdBold: React.CSSProperties = { ...rcptTd, fontWeight: 700, color: 'var(--main-color)' };
  const rcptTdBoldRight: React.CSSProperties = { ...rcptTdRight, fontWeight: 700, color: 'var(--main-color)', fontSize: '1.35rem' };

  return (
    <div className="products-section">
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px',
          background: toast.type === 'success' ? '#25D366' : '#dc3545',
          color: '#fff', padding: '15px 30px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
          fontWeight: 600, fontSize: '16px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><i className="fas fa-file-invoice-dollar" style={{ color: 'var(--primary-color)' }}></i> Monthly Settlement</h2>
      </div>

      <div className="product-upload-form" style={{ marginBottom: '2rem', padding: '1.5rem 2rem', background: '#fff', borderRadius: '12px' }}>
        <div className="form-row" style={{ margin: 0, alignItems: 'center' }}>
          <FloatingSelect
            label="Month"
            value={String(month)}
            options={Array.from({ length: 12 }, (_, i) => ({
              label: new Date(0, i).toLocaleString('default', { month: 'long' }),
              value: String(i + 1),
            }))}
            onChange={(val) => { setMonth(Number(val)); setSelectedEmployee(null); setCardOpen(false); }}
          />
          <FloatingInput
            label="Year"
            type="number"
            value={year}
            onChange={(e) => { setYear(Number(e.target.value)); setSelectedEmployee(null); setCardOpen(false); }}
          />
        </div>
      </div>

      {/* Employee List */}
      <div style={{ overflowX: 'auto', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <table className="orders-table" style={{ margin: 0, minWidth: '650px' }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Daily Rate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  {(emp.department || emp.role) && (
                    <div style={{ fontSize: '1.2rem', color: '#666', marginTop: '2px' }}>
                      {emp.department}{emp.department && emp.role ? ' • ' : ''}{emp.role}
                    </div>
                  )}
                </td>
                <td>₹{emp.dailyRate}</td>
                <td>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                    background: emp.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                    color: emp.status === 'Active' ? '#137333' : '#c5221f'
                  }}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" style={{ margin: 0, padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => handleSelectEmployee(emp)}>
                    <i className="fas fa-eye"></i> View Payroll
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No employees found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Payroll Card Modal */}
      {cardOpen && selectedEmployee && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '90px',
          paddingBottom: '10px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ animation: 'fadeInUp 0.4s ease-out', width: '100%', maxWidth: '850px', margin: '0 20px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', borderRadius: '12px', background: '#fff', boxShadow: '0 .5rem 2rem rgba(0,0,0,.2)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '2px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem' }}>
                <i className="fas fa-calculator" style={{ color: 'var(--primary-color)' }}></i> Payroll — {selectedEmployee.name} ({monthName} {year})
              </h3>
              <button onClick={handleCloseCard} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}>&times;</button>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><p>Loading payroll data...</p></div>
            ) : preview ? (
              <>
                {/* === RECEIPT START === */}
                <div
                  ref={receiptRef}
                  className="payroll-receipt"
                  style={{
                    background: '#ffffff',
                    padding: '0',
                    width: '100%',
                    maxWidth: '820px',
                    margin: '0 auto',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
                    textTransform: 'none',
                    letterSpacing: '0.2px',
                    wordSpacing: 'normal',
                    color: '#222'
                  }}
                >
                  
                  {/* Receipt Header (Left details + right logo) */}
                  <div style={rcptHeader}>
                    {/* Left: PAYMENT RECEIPT MONTH, YEAR, Company Name & Full Address */}
                    <div style={{ textAlign: 'left', flex: '1 1 340px' }}>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--main-color)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        PAYMENT RECEIPT {monthName.toUpperCase()}
                      </h2>
                      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.2rem 0 1rem', letterSpacing: '1px' }}>
                        {year}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-color)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                        ANANYA HOUSE OF FURNITURE
                      </div>
                      <div style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.7, textTransform: 'none', width: '100%' }}>
                        Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612<br />
                        <span style={{ fontWeight: 600, color: '#333' }}>Tel :</span> +91 93218 12823, +91 83187 27813<br />
                        <span style={{ fontWeight: 600, color: '#333' }}>Email :</span> ananyahouseoffurniture@gmail.com
                      </div>
                    </div>

                    {/* Right: Simple Logo with Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flex: '0 0 auto', alignSelf: 'center', marginTop: '2.5rem' }}>
                      <svg width="54" height="54" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="28" height="28" rx="5" fill="#a27341"/>
                        <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                        <path d="M10 21V15.5H18V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                        <path d="M7 11.5H21" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '4px', lineHeight: 1 }}>
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
                    textTransform: 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#555', fontWeight: 700 }}>Receipt No :</span>
                      <span style={{ color: 'var(--main-color)', fontWeight: 800, letterSpacing: '0.5px' }}>{generateReceiptNumber()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#555', fontWeight: 700 }}>Period :</span>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{monthName} {year}</span>
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
                      textTransform: 'none'
                    }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Employee Name
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-color)' }}>
                          {selectedEmployee.name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Department
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                          {selectedEmployee.department || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Role
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#333' }}>
                          {selectedEmployee.role || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Phone Number
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#333' }}>
                          {selectedEmployee.phone ? `+91 ${selectedEmployee.phone.replace(/\D/g, '').slice(-10)}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Daily Rate
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                          ₹{selectedEmployee.dailyRate}&nbsp;<span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#777' }}>/ day</span>
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
                          <tr style={{ background: '#f5efe8', color: 'var(--main-color)' }}>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Payment Date</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Payment Type</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'right', fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #e0d0bf' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p: any) => (
                            <tr key={p._id}>
                              <td style={rcptTd}>{new Date(p.date).toLocaleDateString()}</td>
                              <td style={rcptTd}>{p.paymentType}</td>
                              <td style={rcptTdRight}>₹{p.amount?.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr style={{ background: '#faf8f5' }}>
                            <td style={rcptTdBold} colSpan={2}>Total Previous Advances</td>
                            <td style={rcptTdBoldRight}>₹{preview.totalPaid?.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '1.4rem 1.6rem', background: '#faf8f5', borderRadius: '6px', border: '1px dashed #d8cbba', color: '#666', fontSize: '1.25rem', textAlign: 'center', textTransform: 'none' }}>
                        No previous advance payments recorded for this period.
                      </div>
                    )}
                  </div>

                  {/* 3. Payment Details */}
                  <div style={rcptSection}>
                    <div style={rcptSectionTitle}>Payment Details</div>
                    <table style={rcptTable}>
                      <tbody>
                        <tr><td style={rcptTd}>Total Earnings</td><td style={rcptTdRight}>₹{preview.grossAmount?.toLocaleString()}</td></tr>
                        <tr><td style={{ ...rcptTd, color: '#c5221f' }}>Previous Advances / Deductions</td><td style={{ ...rcptTdRight, color: '#c5221f' }}>- ₹{preview.totalPaid?.toLocaleString()}</td></tr>
                        {preview.isPreview ? (
                          <tr style={{ background: '#faf8f5' }}>
                            <td style={rcptTdBold}>Final Amount {preview.balanceAmount >= 0 ? 'Due' : 'Overpaid'}</td>
                            <td style={{ ...rcptTdBoldRight, color: preview.balanceAmount >= 0 ? '#137333' : '#c5221f' }}>₹{Math.abs(preview.balanceAmount)?.toLocaleString()}</td>
                          </tr>
                        ) : (
                          <tr style={{ background: '#faf8f5' }}>
                            <td style={rcptTdBold}>Total Paid</td>
                            <td style={{ ...rcptTdBoldRight, color: '#137333' }}>₹{(preview.settlementAmount !== undefined && preview.settlementAmount !== null ? preview.settlementAmount : preview.balanceAmount)?.toLocaleString()}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.6rem 2.2rem 0.6rem', marginTop: '1rem', textTransform: 'none' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #333', width: '200px', marginBottom: '0.6rem' }}></div>
                      <p style={{ fontSize: '1.2rem', color: '#555', margin: 0, textTransform: 'none' }}>Employee Signature</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #333', width: '200px', marginBottom: '0.6rem' }}></div>
                      <p style={{ fontSize: '1.2rem', color: '#555', margin: '0 0 0.4rem', textTransform: 'none' }}>Authorized By</p>
                      <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'none', letterSpacing: '0.3px' }}>
                        Mahesh Prajapati
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center', padding: '0.8rem 2.2rem 1.2rem', borderTop: '2px solid var(--primary-color)', marginTop: '0.8rem', textTransform: 'none' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-color)', margin: '0.5rem 0', textTransform: 'none' }}>Ananya House of Furniture</p>
                    <p style={{ fontSize: '1.15rem', color: '#888', margin: 0, fontStyle: 'italic', textTransform: 'none' }}>Thank you for your work with us.</p>
                  </div>
                </div>
                {/* === RECEIPT END === */}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderTop: '1px solid #eee', flexWrap: 'wrap' }} data-html2canvas-ignore="true">
                  {preview.isPreview && (
                    <button className="btn" style={{ margin: 0, padding: '0.7rem 1.5rem', fontSize: '1.3rem', width: 'auto', background: 'var(--primary-color)' }} onClick={handleSettle}>
                      <i className="fas fa-check"></i> Settle Account
                    </button>
                  )}
                  <button
                    className="btn"
                    style={{
                      margin: 0,
                      padding: '0.7rem 1.5rem',
                      fontSize: '1.3rem',
                      width: 'auto',
                      opacity: (preview.isPreview || downloading) ? 0.5 : 1,
                      cursor: (preview.isPreview || downloading) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleDownloadReceipt}
                    disabled={preview.isPreview || downloading}
                    title={preview.isPreview ? 'Please settle account first to download receipt' : 'Download PDF'}
                  >
                    {downloading ? 'Generating...' : <><i className="fas fa-download"></i> Download PDF</>}
                  </button>
                  <button
                    className="btn"
                    style={{
                      margin: 0,
                      padding: '0.7rem 1.5rem',
                      fontSize: '1.3rem',
                      width: 'auto',
                      background: '#25D366',
                      opacity: preview.isPreview ? 0.5 : 1,
                      cursor: preview.isPreview ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onClick={handleWhatsAppReceipt}
                    disabled={preview.isPreview}
                    title={preview.isPreview ? 'Please settle account first to send receipt' : 'Share Receipt via WhatsApp'}
                  >
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </button>
                  <button className="btn" style={{ margin: 0, padding: '0.7rem 1.5rem', fontSize: '1.3rem', width: 'auto', background: '#6c757d' }} onClick={handleCloseCard}>
                    <i className="fas fa-times"></i> Close
                  </button>
                </div>

                {settlementError && <p style={{ color: 'red', padding: '0 2rem 1rem' }}>{settlementError}</p>}
              </>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center' }}><p>No data available</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
