'use client';
import { useState, useEffect, useRef } from 'react';
import ConfirmationModal from './ConfirmationModal';

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
  const [search, setSearch] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    boldWord?: string;
    afterBold?: string;
    subtext?: string;
    confirmText?: string;
    confirmButtonVariant?: 'danger' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

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

  const filteredEmployees = employees.filter(emp => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
      (emp.phone && emp.phone.includes(q)) ||
      (emp.department && emp.department.toLowerCase().includes(q)) ||
      (emp.role && emp.role.toLowerCase().includes(q))
    );
  });

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

  const handleSettle = () => {
    if (!preview || !preview.isPreview || !selectedEmployee) return;
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Settle & Record Payment',
      afterBold: `for ${selectedEmployee.name} (${monthName} ${year}) for ₹${(preview.balanceAmount || 0).toLocaleString()}?`,
      subtext: 'This will finalize this month\'s payroll and record the settlement payment.',
      confirmText: 'Yes, Settle',
      confirmButtonVariant: 'primary',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        executeSettle();
      }
    });
  };

  const executeSettle = async () => {
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

  const handleRecalculateSettlement = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees/settlements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          month,
          year,
          dailyRate: selectedEmployee.dailyRate,
        }),
      });
      if (res.ok) {
        showToast(`Settlement updated to ₹${selectedEmployee.dailyRate}/day successfully`);
        handleSelectEmployee(selectedEmployee);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update settlement', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating settlement', 'error');
    }
    setLoading(false);
  };

  const handleResetSettlement = () => {
    if (!selectedEmployee) return;
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Reset Settlement',
      afterBold: `for ${selectedEmployee.name} (${monthName} ${year})?`,
      subtext: 'This will remove the settlement payment and return the account to an open dynamic preview.',
      confirmText: 'Yes, Reset',
      confirmButtonVariant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/employees/settlements?employeeId=${selectedEmployee._id}&month=${month}&year=${year}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            showToast('Settlement reset to open preview');
            handleSelectEmployee(selectedEmployee);
          } else {
            const err = await res.json();
            showToast(err.error || 'Failed to reset settlement', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Error resetting settlement', 'error');
        }
        setLoading(false);
      }
    });
  };

  const toTitleCase = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const generateReceiptNumber = () => {
    const padMonth = month.toString().padStart(2, '0');
    let empCode = '0001';
    if (selectedEmployee?.employeeId) {
      const numMatch = selectedEmployee.employeeId.match(/\d+/);
      if (numMatch) {
        empCode = numMatch[0].padStart(4, '0');
      } else {
        empCode = selectedEmployee.employeeId.slice(-4).padStart(4, '0');
      }
    } else if (selectedEmployee?._id) {
      empCode = selectedEmployee._id.toString().slice(-4);
    }
    return `AHF-PAY-${year}-${padMonth}-${empCode}`;
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

    // Create a temporary off-screen container with fixed 800px standard A4 width
    // This guarantees that regardless of whether downloaded on mobile (360px) or desktop,
    // the layout is ALWAYS pristine, full-width, perfectly spaced, with zero cut-off.
    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '800px';
    printContainer.style.minWidth = '800px';
    printContainer.style.maxWidth = '800px';
    printContainer.style.zIndex = '-99999';
    printContainer.style.background = '#ffffff';
    printContainer.style.pointerEvents = 'none';

    const clone = receiptRef.current.cloneNode(true) as HTMLElement;
    clone.style.width = '800px';
    clone.style.minWidth = '800px';
    clone.style.maxWidth = '800px';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxSizing = 'border-box';

    clone.style.overflow = 'visible';
    clone.style.overflowX = 'visible';
    clone.style.overflowY = 'visible';
    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Wait one frame so the browser fully lays out the 800px clone before capture
    await new Promise(resolve => setTimeout(resolve, 100));

    let canvas;
    try {
      canvas = await html2canvas(clone, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
      });
    } finally {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    }

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
    const posY = margin + Math.max(0, (maxH - renderH) / 8);

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');

    const safeName = toTitleCase(selectedEmployee.name || 'Employee').replace(/\s+/g, '_');
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
      `Dear *${selectedEmployee.name}* (ID: ${selectedEmployee.employeeId || '—'}),\n` +
      `Your payment receipt for *${monthName} ${year}* has been generated.\n\n` +
      `• *Employee ID:* ${selectedEmployee.employeeId || '—'}\n` +
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
    flexWrap: 'nowrap',
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

      {/* Header Toolbar: Title on left, Month/Year dropdown + Search keyword on right inline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--primary-color)' }}></i> Monthly Settlement
          <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
            {filteredEmployees.length}
          </span>
        </h2>

        {/* Inline Controls: Month Dropdown, Year Input, and Search Keyword */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Month Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={String(month)}
              onChange={(e) => { setMonth(Number(e.target.value)); setSelectedEmployee(null); setCardOpen(false); }}
              style={{
                height: '38px',
                padding: '0 2.4rem 0 1rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color, #ce962e)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(206, 150, 46, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const name = new Date(0, i).toLocaleString('default', { month: 'long' });
                return <option key={i + 1} value={String(i + 1)}>{name}</option>;
              })}
            </select>
            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '10px', fontSize: '1.1rem', color: '#64748b', pointerEvents: 'none' }}></i>
          </div>

          {/* Year Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setSelectedEmployee(null); setCardOpen(false); }}
              style={{
                height: '38px',
                padding: '0 2.4rem 0 1rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color, #ce962e)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(206, 150, 46, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const y = new Date().getFullYear() - 3 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '10px', fontSize: '1.1rem', color: '#64748b', pointerEvents: 'none' }}></i>
          </div>

          {/* Search keyword input matching Job Sites and Employees list */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '11px',
                color: '#94a3b8',
                fontSize: '1.25rem',
                pointerEvents: 'none',
              }}
            ></i>
            <input
              type="text"
              placeholder="Search keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.65rem 2.2rem 0.65rem 2.8rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1.35rem',
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
                minWidth: '220px',
                height: '38px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color, #ce962e)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(206, 150, 46, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '95px' }}>Emp ID</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Employee</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Daily Rate</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <i className="fas fa-search" style={{ fontSize: '2.4rem', marginBottom: '1rem', display: 'block', color: '#cbd5e1' }}></i>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b' }}>
                      No employees found matching {search ? `"${search}"` : 'records'}
                    </div>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        style={{
                          marginTop: '1.2rem',
                          padding: '6px 16px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: 'var(--primary-color, #ce962e)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                        }}
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr
                    key={emp._id}
                    onClick={() => handleSelectEmployee(emp)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#faf8f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        color: 'var(--primary-color)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        letterSpacing: '0.5px',
                      }}>
                        {emp.employeeId || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.name}</div>
                      {(emp.department || emp.role) && (
                        <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '2px' }}>
                          {emp.department}{emp.department && emp.role ? ' • ' : ''}{emp.role}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.2rem', color: '#334155', fontWeight: 600 }}>₹{emp.dailyRate}</td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '1.15rem', fontWeight: 700,
                        background: emp.status === 'Active' ? '#dcfce7' : '#fce8e6',
                        color: emp.status === 'Active' ? '#137333' : '#c5221f'
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-edit"
                        style={{ margin: 0, padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <i className="fas fa-eye"></i> View Payroll
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Card Modal */}
      {cardOpen && selectedEmployee && (
        <div
          onClick={handleCloseCard}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '90px',
            paddingBottom: '10px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.4s ease-out', width: '100%', maxWidth: '850px', margin: '0 20px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', borderRadius: '12px', background: '#fff', boxShadow: '0 .5rem 2rem rgba(0,0,0,.2)' }}
          >
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '2px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span><i className="fas fa-calculator" style={{ color: 'var(--primary-color)' }}></i> Payroll — {selectedEmployee.name}</span>
                <span style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  color: 'var(--primary-color)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                }}>
                  {selectedEmployee.employeeId || '—'}
                </span>
                <span style={{ color: '#64748b', fontSize: '1.3rem', fontWeight: 600 }}>({monthName} {year})</span>
              </h3>
              <button onClick={handleCloseCard} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}>&times;</button>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><p>Loading payroll data...</p></div>
            ) : preview ? (
              <>
                {/* Rate Mismatch Warning Banner */}
                {selectedEmployee && !preview.isPreview && preview.dailyRate !== selectedEmployee.dailyRate && (
                  <div
                    style={{
                      margin: '1.2rem 2rem 0',
                      padding: '1rem 1.4rem',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      border: '1.5px solid #f59e0b',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                    data-html2canvas-ignore="true"
                  >
                    <div style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#d97706', fontSize: '1.4rem' }}></i>
                      <span>
                        <strong>Daily Rate Changed:</strong> Employee rate is now <strong>₹{selectedEmployee.dailyRate}</strong>, but this settlement was saved at <strong>₹{preview.dailyRate}</strong>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRecalculateSettlement}
                      style={{
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="fas fa-sync-alt"></i> Recalculate with ₹{selectedEmployee.dailyRate}
                    </button>
                  </div>
                )}

                {/* === RECEIPT START === */}
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div
                    ref={receiptRef}
                    className="payroll-receipt"
                    style={{
                      background: '#ffffff',
                      padding: '0',
                      width: '100%',
                      minWidth: '720px',
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
                      <div style={{ textAlign: 'left', flex: '1 1 auto', minWidth: 0 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flex: '0 0 auto', alignSelf: 'center', marginTop: '1rem' }}>
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
                          Employee ID
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '0.5px' }}>
                          {selectedEmployee.employeeId || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>
                          Employee Name
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-color)' }}>
                          {toTitleCase(selectedEmployee.name)}
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
                          Pay Period
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                          {monthName} {year}
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
                        <tr>
                          <td style={rcptTd}>Total Work Hours</td>
                          <td style={rcptTdRight}>
                            {preview.totalWorkHours} Hours
                            {preview.hasActiveShift && (
                              <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '1.1rem', color: '#16a34a', fontWeight: 600 }}>
                                (Live)
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={rcptTd}>Earned Days</td>
                          <td style={rcptTdRight}>
                            {preview.totalEarnedDays} Days
                            {preview.hasActiveShift && (
                              <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '1.1rem', color: '#16a34a', fontWeight: 600 }}>
                                (Live)
                              </span>
                            )}
                          </td>
                        </tr>
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
                            <td style={rcptTdBold} colSpan={2}>Total Previous Payments</td>
                            <td style={rcptTdBoldRight}>₹{preview.totalPaid?.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '1.4rem 1.6rem', background: '#faf8f5', borderRadius: '6px', border: '1px dashed #d8cbba', color: '#666', fontSize: '1.25rem', textAlign: 'center', textTransform: 'none' }}>
                        No previous payments recorded for this period.
                      </div>
                    )}
                  </div>

                  {/* 3. Payment Details */}
                  <div style={rcptSection}>
                    <div style={rcptSectionTitle}>Payment Details</div>
                    <table style={rcptTable}>
                      <tbody>
                        <tr><td style={rcptTd}>Total Earnings</td><td style={rcptTdRight}>₹{preview.grossAmount?.toLocaleString()}</td></tr>
                        <tr><td style={{ ...rcptTd, color: '#c5221f' }}>Previous Payments</td><td style={{ ...rcptTdRight, color: '#c5221f' }}>- ₹{preview.totalPaid?.toLocaleString()}</td></tr>
                        <tr style={{ background: '#faf8f5' }}>
                          <td style={rcptTdBold}>Net Amount Paid</td>
                          <td style={{ ...rcptTdBoldRight, color: '#137333' }}>₹{Math.max(0, (preview.grossAmount || 0) - (preview.totalPaid || 0))?.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.6rem 2.2rem 0.6rem', marginTop: '1rem', textTransform: 'none', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center', minWidth: '160px' }}>
                      <div style={{ borderTop: '1.5px solid #333', width: '100%', maxWidth: '200px', margin: '0 auto 0.6rem' }}></div>
                      <p style={{ fontSize: '1.2rem', color: '#555', margin: 0, textTransform: 'none', whiteSpace: 'nowrap' }}>Employee Signature</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '160px' }}>
                      <div style={{ borderTop: '1.5px solid #333', width: '100%', maxWidth: '200px', margin: '0 auto 0.6rem' }}></div>
                      <p style={{ fontSize: '1.2rem', color: '#555', margin: '0 0 0.4rem', textTransform: 'none', whiteSpace: 'nowrap' }}>Authorized By</p>
                      <p style={{ fontSize: '1.45rem', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'none', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
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
              </div>
              {/* === RECEIPT END === */}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderTop: '1px solid #eee', flexWrap: 'wrap', alignItems: 'center' }} data-html2canvas-ignore="true">
                  {preview.isPreview ? (
                    <button className="btn" style={{ margin: 0, padding: '0.7rem 1.5rem', fontSize: '1.3rem', width: 'auto', background: 'var(--primary-color)' }} onClick={handleSettle}>
                      <i className="fas fa-check"></i> Settle Account
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn"
                        style={{
                          margin: 0,
                          padding: '0.7rem 1.4rem',
                          fontSize: '1.3rem',
                          width: 'auto',
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                        onClick={handleRecalculateSettlement}
                        title="Recalculate settlement with current employee daily rate and attendance"
                      >
                        <i className="fas fa-sync-alt"></i> Recalculate
                      </button>
                      <button
                        className="btn"
                        style={{
                          margin: 0,
                          padding: '0.7rem 1.4rem',
                          fontSize: '1.3rem',
                          width: 'auto',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                        onClick={handleResetSettlement}
                        title="Reset settlement back to open preview"
                      >
                        <i className="fas fa-undo"></i> Reset Settlement
                      </button>
                    </>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        boldWord={confirmModal.boldWord}
        afterBold={confirmModal.afterBold}
        subtext={confirmModal.subtext}
        confirmText={confirmModal.confirmText}
        confirmButtonVariant={confirmModal.confirmButtonVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
