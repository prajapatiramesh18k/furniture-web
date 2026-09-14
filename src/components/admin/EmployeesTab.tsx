'use client';
import { useState, useEffect } from 'react';
import { DEPARTMENTS, DEPARTMENT_ROLES } from '@/lib/constants/employeeRoles';
import FloatingSelect from './FloatingSelect';
import FloatingInput from './FloatingInput';
import ConfirmationModal from './ConfirmationModal';
import DeleteButton from './DeleteButton';

const formatCustomDateTime = (dateVal: string | Date | undefined, timeSource?: string | Date | undefined) => {
  if (!dateVal) return '—';
  let d = new Date(dateVal);
  if (isNaN(d.getTime())) return '—';

  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    const [y, m, dayNum] = dateVal.split('-').map(Number);
    d = new Date(y, m - 1, dayNum);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let t = d;
  if (timeSource) {
    const ft = new Date(timeSource);
    if (!isNaN(ft.getTime())) t = ft;
  }

  let hours = t.getHours();
  const minutes = String(t.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
};

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    role: '',
    dailyRate: '',
    standardHours: '8',
    status: 'Active',
    notes: '',
  });

  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendanceForm, setAttendanceForm] = useState({ date: '', workHours: '', notes: '' });
  const [paymentForm, setPaymentForm] = useState({ date: '', amount: '', paymentType: 'Advance', notes: '' });
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any | null>(null);
  const [editAttendanceStatus, setEditAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [quickHours, setQuickHours] = useState<{ [key: string]: number }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
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

  const [search, setSearch] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
    setPhoneError('');
    setFormData({ name: '', phone: '', department: '', role: '', dailyRate: '', standardHours: '8', status: 'Active', notes: '' });
  };

  const computeNextEmployeeId = () => {
    let maxNum = 0;
    for (const emp of employees) {
      if (emp.employeeId) {
        const match = emp.employeeId.match(/^AHF-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }
    return `AHF-${String(maxNum + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/employees?limit=500', { signal: controller.signal, cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') console.error(err);
      }
      setLoading(false);
    };
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && formOpen) {
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees?limit=500', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    try {
      const res = await fetch(editingEmployee ? `/api/admin/employees/${editingEmployee._id}` : '/api/admin/employees', {
        method: editingEmployee ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dailyRate: Number(formData.dailyRate), standardHours: Number(formData.standardHours) }),
      });
      if (res.ok) {
        const updatedData = { ...formData, dailyRate: Number(formData.dailyRate), standardHours: Number(formData.standardHours) };
        if (selectedEmployee && editingEmployee && selectedEmployee._id === editingEmployee._id) {
          setSelectedEmployee((prev: any) => ({ ...prev, ...updatedData }));
        }
        resetForm();
        fetchEmployees();
        showToast(editingEmployee ? 'Employee Updated Successfully' : 'Employee Added Successfully');
      } else {
        showToast('Failed to save employee', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    }
  };

  const handleEditEmployee = (emp: any) => {
    let cleanPhone = (emp.phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length > 10 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1);
    }
    cleanPhone = cleanPhone.slice(-10);

    setEditingEmployee(emp);
    setPhoneError('');
    setFormData({
      name: emp.name,
      phone: cleanPhone,
      department: emp.department || '',
      role: emp.role || '',
      dailyRate: emp.dailyRate.toString(),
      standardHours: emp.standardHours.toString(),
      status: emp.status,
      notes: emp.notes || ''
    });
    setFormOpen(true);
  };

  const handleDeleteEmployee = (id: string, name?: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Delete',
      afterBold: name ? `employee "${name}"?` : 'this employee?',
      subtext: 'This will permanently remove the employee and their records.',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchEmployees();
            showToast('Employee Deleted Successfully');
          } else {
            showToast('Failed to delete employee', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('An error occurred', 'error');
        }
      },
    });
  };

  const handleQuickAttendance = async (empId: string, hours: number) => {
    try {
      const res = await fetch('/api/admin/employees/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          date: new Date().toISOString().split('T')[0], // Today
          workHours: hours,
          notes: hours === 0 ? 'Absent' : 'Present'
        }),
      });
      if (res.ok) {
        showToast('Attendance marked successfully for today!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to mark attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    }
  };

  const openEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    setActiveSubTab('overview');
    setErrorMsg('');
  };

  useEffect(() => {
    if (selectedEmployee) {
      if (activeSubTab === 'attendance') fetchAttendance(selectedEmployee._id);
      if (activeSubTab === 'payments') fetchPayments(selectedEmployee._id);
    }
  }, [activeSubTab, selectedEmployee]);

  const fetchAttendance = async (id: string) => {
    const res = await fetch(`/api/admin/employees/attendance?employeeId=${id}`);
    const data = await res.json();
    setAttendance(data);
  };

  const fetchPayments = async (id: string) => {
    const res = await fetch(`/api/admin/employees/payments?employeeId=${id}`);
    const data = await res.json();
    setPayments(data);
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const hoursToSubmit = editAttendanceStatus === 'absent' ? 0 : Number(attendanceForm.workHours);
      const res = await fetch(editingAttendance ? `/api/admin/employees/attendance/${editingAttendance._id}` : '/api/admin/employees/attendance', {
        method: editingAttendance ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          date: attendanceForm.date,
          workHours: hoursToSubmit,
          notes: attendanceForm.notes
        }),
      });
      if (res.ok) {
        setAttendanceForm({ date: '', workHours: '', notes: '' });
        setEditingAttendance(null);
        fetchAttendance(selectedEmployee._id);
        showToast(editingAttendance ? 'Attendance Updated Successfully' : 'Attendance Saved Successfully');
      } else {
        const err = await res.json();
        setErrorMsg(err.error);
        showToast(err.error || 'Failed to save attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    }
  };

  const handleEditAttendance = (a: any) => {
    setEditingAttendance(a);
    const isWorking = a.status === 'punched_in';
    setEditAttendanceStatus(isWorking || a.workHours > 0 ? 'present' : 'absent');
    let defaultHours = a.workHours > 0 ? a.workHours.toString() : '';
    if (isWorking) {
      if (a.punchIn) {
        const elapsedHrs = (Date.now() - new Date(a.punchIn).getTime()) / 3600000;
        defaultHours = elapsedHrs > 0 ? (Math.round(elapsedHrs * 2) / 2).toString() : (selectedEmployee?.standardHours?.toString() || '8');
      } else {
        defaultHours = selectedEmployee?.standardHours?.toString() || '8';
      }
    } else if (a.workHours === 0) {
      defaultHours = '0';
    }
    setAttendanceForm({
      date: new Date(a.date).toISOString().split('T')[0],
      workHours: defaultHours || (selectedEmployee?.standardHours?.toString() || '8'),
      notes: a.notes || ''
    });
  };

  const handleDeleteAttendance = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Delete',
      afterBold: 'this attendance record?',
      subtext: 'This will remove the selected work hours record.',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/employees/attendance/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchAttendance(selectedEmployee._id);
            showToast('Attendance Deleted Successfully');
          } else {
            showToast('Failed to delete attendance', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('An error occurred', 'error');
        }
      },
    });
  };

  const handleStopShift = async (a: any) => {
    // Calculate live elapsed hours from punchIn to now
    let hours = selectedEmployee?.standardHours || 8;
    if (a.punchIn) {
      const elapsed = (Date.now() - new Date(a.punchIn).getTime()) / 3600000;
      hours = Math.max(0, Math.round(elapsed * 2) / 2); // round to nearest 0.5
    }
    try {
      const res = await fetch(`/api/admin/employees/attendance/${a._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          workHours: hours,
          notes: a.notes || 'Shift stopped by admin',
        }),
      });
      if (res.ok) {
        fetchAttendance(selectedEmployee._id);
        showToast(`Shift stopped. ${hours}h recorded.`);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to stop shift', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    }
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paymentType: 'Advance',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPayment
        ? `/api/admin/employees/payments/${editingPayment._id}`
        : '/api/admin/employees/payments';
      const method = editingPayment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          date: paymentForm.date,
          amount: Number(paymentForm.amount),
          paymentType: paymentForm.paymentType,
          notes: paymentForm.notes
        }),
      });
      if (res.ok) {
        setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
        setEditingPayment(null);
        setIsPaymentModalOpen(false);
        fetchPayments(selectedEmployee._id);
        showToast(editingPayment ? 'Payment updated successfully!' : 'Payment recorded successfully!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save payment', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving payment', 'error');
    }
  };

  const handleEditPayment = (p: any) => {
    setEditingPayment(p);
    setPaymentForm({
      date: new Date(p.date).toISOString().split('T')[0],
      amount: p.amount?.toString() || '',
      paymentType: p.paymentType || 'Advance',
      notes: p.notes || '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleDeletePayment = (id: string, amount: number) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Delete',
      afterBold: `this payment record of ₹${amount.toLocaleString()}?`,
      subtext: 'This will remove the recorded payment/advance.',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/employees/payments/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchPayments(selectedEmployee._id);
            showToast('Payment Deleted Successfully');
          } else {
            showToast('Failed to delete payment', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('An error occurred while deleting payment', 'error');
        }
      },
    });
  };

  const handleResetDevice = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Reset',
      afterBold: `the phone lock for "${name}"?`,
      subtext: 'This will allow them to link and register a new smartphone on their next punch in.',
      confirmText: 'Yes, Reset',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/employees/${id}/reset-device`, {
            method: 'POST',
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || `Phone lock reset for ${name}`);
            fetchEmployees();
            if (selectedEmployee && selectedEmployee._id === id) {
              setSelectedEmployee((prev: any) => ({
                ...prev,
                deviceId: null,
                deviceName: '',
                deviceRegisteredAt: null,
              }));
            }
          } else {
            showToast(data.error || 'Failed to reset device lock', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while resetting device', 'error');
        }
      },
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
      (emp.phone && emp.phone.includes(q)) ||
      (emp.department && emp.department.toLowerCase().includes(q)) ||
      (emp.role && emp.role.toLowerCase().includes(q))
    );
  });

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

      {selectedEmployee ? (
        <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span><i className="fas fa-user"></i> {selectedEmployee.name}</span>
            <span style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              color: 'var(--primary-color)',
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '0.5px',
            }}>
              {selectedEmployee.employeeId || '—'}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setEditingPayment(null);
              setEditingAttendance(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2.5rem',
              lineHeight: 1,
              cursor: 'pointer',
              color: '#888',
              padding: '0 4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-color)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            title="Close"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="admin-tabs" style={{ marginBottom: '2rem' }}>
          {['overview', 'attendance', 'payments'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeSubTab === tab ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeSubTab === 'overview' && (
          <div className="form-section">
            <div className="form-section-title"><i className="fas fa-info-circle"></i> Employee Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', fontSize: '1.4rem' }}>
              <div>
                <strong>Employee ID:</strong>{' '}
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  background: '#fcf8f2',
                  border: '1px solid #e8dfd2',
                  color: 'var(--primary-color)',
                  display: 'inline-block',
                  letterSpacing: '0.5px',
                }}>
                  {selectedEmployee.employeeId || '—'}
                </span>
              </div>
              <div>
                <strong>Department:</strong>{' '}
                {selectedEmployee.department ? (
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    background: '#f4ece1',
                    color: 'var(--primary-color)',
                    display: 'inline-block'
                  }}>
                    {selectedEmployee.department}
                  </span>
                ) : <span style={{ color: '#777' }}>Not specified</span>}
              </div>
              <div>
                <strong>Role:</strong>{' '}
                <span style={{ fontWeight: 600, color: '#333' }}>{selectedEmployee.role || 'Not specified'}</span>
              </div>
              <div>
                <strong>Phone:</strong>{' '}
                {selectedEmployee.phone ? (
                  <span style={{ fontWeight: 600, color: '#333' }}>
                    +91 {selectedEmployee.phone.replace(/\D/g, '').slice(-10)}
                  </span>
                ) : 'N/A'}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: selectedEmployee.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                  color: selectedEmployee.status === 'Active' ? '#137333' : '#c5221f'
                }}>
                  {selectedEmployee.status}
                </span>
              </div>
              <div><strong>Daily Rate:</strong> ₹{selectedEmployee.dailyRate} / day</div>
              <div><strong>Standard Hours:</strong> {selectedEmployee.standardHours}h</div>
            </div>

            {/* Smartphone Device Lock Security Card */}
            <div style={{ marginTop: '1.8rem', padding: '1.2rem 1.4rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-shield-alt" style={{ color: selectedEmployee.deviceId ? '#16a34a' : '#94a3b8', fontSize: '1.5rem' }}></i>
                    <span>Smartphone Device Lock (Fraud Prevention)</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '4px' }}>
                    {selectedEmployee.deviceId ? (
                      <span>
                        Bound to: <strong style={{ color: '#0f172a' }}>{selectedEmployee.deviceName || 'Mobile Phone'}</strong>
                        {selectedEmployee.deviceRegisteredAt && ` (Linked on ${formatCustomDateTime(selectedEmployee.deviceRegisteredAt)})`}
                      </span>
                    ) : (
                      <span>No phone bound yet. It will automatically lock to this worker's personal phone on their first punch in.</span>
                    )}
                  </div>
                </div>

                {selectedEmployee.deviceId && (
                  <button
                    type="button"
                    onClick={() => handleResetDevice(selectedEmployee._id, selectedEmployee.name)}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#fff',
                      border: '1.5px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: '6px',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fas fa-unlock-alt"></i> Reset Device Lock
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-calendar-check" style={{ color: 'var(--primary-color)' }}></i> Attendance History — {selectedEmployee.name} ({selectedEmployee.employeeId || '—'})</h3>
              <button
                type="button"
                className="btn"
                style={{ margin: 0, padding: '0.6rem 1.4rem', fontSize: '1.25rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => fetchAttendance(selectedEmployee._id)}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>

            {editingAttendance && (
              <form className="product-upload-form" onSubmit={handleAddAttendance} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fdf8f0', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                <div className="form-section-title" style={{ fontSize: '1.4rem' }}>
                  <i className="fas fa-edit" style={{ color: 'var(--primary-color)' }}></i> Edit Attendance — {formatCustomDateTime(editingAttendance.date, editingAttendance.punchIn || editingAttendance.createdAt)}
                </div>
                {errorMsg && <p style={{ color: 'red', marginBottom: '1rem' }}>{errorMsg}</p>}
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <FloatingInput
                    label="Date"
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  />
                  <FloatingSelect
                    label="Attendance"
                    required
                    value={editAttendanceStatus}
                    options={[
                      { label: 'Present', value: 'present' },
                      { label: 'Absent', value: 'absent' },
                    ]}
                    onChange={(val) => {
                      const status = val as 'present' | 'absent';
                      setEditAttendanceStatus(status);
                      if (status === 'absent') {
                        setAttendanceForm({ ...attendanceForm, workHours: '0' });
                      } else {
                        setAttendanceForm({ ...attendanceForm, workHours: selectedEmployee?.standardHours?.toString() || '8' });
                      }
                    }}
                  />
                  {editAttendanceStatus === 'present' && (
                    <FloatingInput
                      label="Work Hours"
                      type="number"
                      step="0.5"
                      required
                      value={attendanceForm.workHours}
                      onChange={e => setAttendanceForm({ ...attendanceForm, workHours: e.target.value })}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn" style={{ margin: 0, padding: '0.8rem 2.2rem', fontSize: '1.3rem', width: 'auto' }}>Update</button>
                  <button type="button" className="btn-cancel" style={{ margin: 0, padding: '0.8rem 2.2rem', fontSize: '1.3rem', width: 'auto' }} onClick={() => { setEditingAttendance(null); setAttendanceForm({ date: '', workHours: '', notes: '' }); }}>Cancel</button>
                </div>
              </form>
            )}

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Date & Time</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Attendance</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Hours</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Earned Days</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No attendance records found</td></tr>}
                    {attendance.map(a => {
                      const isWorking = a.status === 'punched_in';
                      const isCompleted = a.status === 'completed';
                      const isPresent = a.workHours > 0 || isWorking || isCompleted;

                      // Calculate live elapsed hours if currently working on site
                      let liveElapsedMinutes = 0;
                      if (isWorking && a.punchIn) {
                        liveElapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(a.punchIn).getTime()) / 60000));
                      }
                      const liveHrs = Math.floor(liveElapsedMinutes / 60);
                      const liveMins = liveElapsedMinutes % 60;

                      return (
                        <tr
                          key={a._id}
                          onClick={() => handleEditAttendance(a)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isWorking ? '#f0fdf455' : undefined,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isWorking) e.currentTarget.style.backgroundColor = '#faf8f5';
                          }}
                          onMouseLeave={(e) => {
                            if (!isWorking) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '1rem 1.2rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{formatCustomDateTime(a.date, a.punchIn || a.createdAt)}</div>
                            {a.siteName && (
                              <div style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                                <span>{a.siteName}</span>
                              </div>
                            )}
                            {a.punchIn && (
                              <div style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '2px' }}>
                                In: {new Date(a.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {a.punchOut ? ` • Out: ${new Date(a.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' • Ongoing'}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            {isWorking ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: '#dcfce7',
                                color: '#15803d',
                              }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}></span>
                                Working On-Site
                              </span>
                            ) : isPresent ? (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: '#e6f4ea',
                                color: '#137333',
                              }}>
                                {isCompleted ? 'Shift Completed' : 'Present'}
                              </span>
                            ) : (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: '#fce8e6',
                                color: '#c5221f',
                              }}>
                                Absent
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            {isWorking ? (
                              <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1.35rem' }}>
                                {liveHrs}h {liveMins}m <span style={{ fontSize: '1rem', fontWeight: 600, color: '#16a34a' }}>(Live)</span>
                              </div>
                            ) : (
                              <span style={{ fontWeight: 600, color: a.workHours > 0 ? '#0f172a' : '#94a3b8' }}>
                                {a.workHours}h
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            {isWorking ? (
                              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fas fa-clock" style={{ fontSize: '1.1rem' }}></i> In Progress
                              </span>
                            ) : (
                              <span style={{ fontWeight: 600, color: a.earnedDays > 0 ? '#16a34a' : '#94a3b8' }}>
                                {a.earnedDays}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  border: 'none',
                                  borderRadius: '8px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#0284c7',
                                  padding: 0,
                                }}
                                onClick={() => handleEditAttendance(a)}
                                title="Edit Attendance"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <DeleteButton
                                size={32}
                                iconSize={16}
                                onClick={() => handleDeleteAttendance(a._id)}
                                title="Delete Record"
                              />
                              {(isWorking || (a.punchIn && !a.punchOut)) && (
                                <button
                                  type="button"
                                  style={{
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '8px',
                                    padding: '4px 10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: 'pointer',
                                    color: '#dc2626',
                                    fontSize: '1.15rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => handleStopShift(a)}
                                  title="Stop ongoing shift and save hours"
                                >
                                  <i className="fas fa-stop-circle"></i> Stop
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                <i className="fas fa-money-bill-wave" style={{ color: 'var(--primary-color)' }}></i> Payment History — {selectedEmployee.name} ({selectedEmployee.employeeId || '—'})
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ margin: 0, padding: '0.6rem 1.4rem', fontSize: '1.25rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => fetchPayments(selectedEmployee._id)}
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                {/* Plus '+' Button to Record Payment in Pop-up Modal */}
                <button
                  type="button"
                  onClick={handleOpenAddPayment}
                  title="Record Payment / Advance"
                  style={{
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--primary-color, #ce962e)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    transition: 'filter 0.15s, transform 0.1s',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  <i className="fas fa-plus" style={{ fontSize: '1.35rem' }}></i>
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Date & Time</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Notes</th>
                      <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No payment records found
                        </td>
                      </tr>
                    )}
                    {payments.map(p => (
                      <tr
                        key={p._id}
                        onClick={() => handleEditPayment(p)}
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
                        <td style={{ padding: '1rem 1.2rem' }}>{formatCustomDateTime(p.date, p.createdAt)}</td>
                        <td style={{ padding: '1rem 1.2rem', fontWeight: 700, color: '#0f172a' }}>₹{p.amount.toLocaleString()}</td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '1.15rem',
                            fontWeight: 600,
                            background: p.paymentType === 'Advance' ? '#fef3c7' : p.paymentType === 'Settlement' ? '#e0f2fe' : '#f1f5f9',
                            color: p.paymentType === 'Advance' ? '#92400e' : p.paymentType === 'Settlement' ? '#0369a1' : '#475569'
                          }}>
                            {p.paymentType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{p.notes || '-'}</td>
                        <td style={{ padding: '0.9rem 1.2rem', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: 'none',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#0284c7',
                                padding: 0,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPayment(p);
                              }}
                              title="Edit Payment"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <DeleteButton
                              size={32}
                              iconSize={16}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePayment(p._id, p.amount);
                              }}
                              title="Delete Payment"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-users"></i> Employees
          <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
            {filteredEmployees.length}
          </span>
        </h2>

        {/* Toolbar matching reference screenshot: Search keyword & '+' Add Button ONLY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search keyword input */}
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

          {/* Plus '+' Button to Add Employee */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            title="Add New Employee"
            style={{
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-color, #ce962e)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'filter 0.15s, transform 0.1s',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: '1.35rem' }}></i>
          </button>
        </div>
      </div>

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

      {formOpen && (
        <div 
          onClick={resetForm}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.4s ease-out', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '14px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <form className="product-upload-form" onSubmit={handleCreateEmployee} style={{ padding: '2.5rem', background: '#fff', borderRadius: '14px', margin: 0, maxWidth: '100%' }}>
              <div className="form-section-title" style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '2.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--main-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <i className={`fas fa-user-${editingEmployee ? 'edit' : 'plus'}`} style={{ color: 'var(--primary-color)' }}></i>
                  {editingEmployee ? 'Edit Employee' : 'New Employee'}
                </span>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  style={{ background: 'none', border: 'none', fontSize: '2.4rem', lineHeight: '1', cursor: 'pointer', color: '#64748b' }}
                >
                  &times;
                </button>
              </div>

              <div className="form-row">
                <FloatingInput
                  label={editingEmployee ? "Employee ID (Permanent)" : "Employee ID (Auto-Generated)"}
                  value={editingEmployee ? (editingEmployee.employeeId || 'AHF-???') : computeNextEmployeeId()}
                  disabled
                  readOnly
                  style={{
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed',
                    color: editingEmployee ? '#0f172a' : '#a27341',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                />
                <FloatingInput
                  label="Name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                />
              </div>

              <div className="form-row">
                <FloatingInput
                  label="Contact Number"
                  prefixText="+91"
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  error={phoneError}
                  value={formData.phone}
                  onChange={e => {
                    let raw = e.target.value.replace(/\D/g, '');
                    if (raw.length === 12 && raw.startsWith('91')) {
                      raw = raw.slice(2);
                    } else if (raw.length > 10 && raw.startsWith('0')) {
                      raw = raw.slice(1);
                    }
                    const clean = raw.slice(0, 10);
                    setFormData(prev => ({ ...prev, phone: clean }));
                    if (clean.length > 0 && clean.length < 10) {
                      setPhoneError('Must be exactly 10 digits');
                    } else {
                      setPhoneError('');
                    }
                  }}
                  placeholder="Contact Number"
                />
                <FloatingSelect
                  label="Department"
                  required
                  value={formData.department}
                  options={DEPARTMENTS.map((dept) => ({ label: dept, value: dept }))}
                  placeholder="-- Select Department --"
                  onChange={(newDept) => {
                    const validRoles = DEPARTMENT_ROLES[newDept] || [];
                    setFormData(prev => ({
                      ...prev,
                      department: newDept,
                      role: validRoles.includes(prev.role) ? prev.role : '',
                    }));
                  }}
                />
              </div>

              <div className="form-row">
                <FloatingSelect
                  label="Role"
                  required
                  disabled={!formData.department}
                  value={formData.role}
                  options={(DEPARTMENT_ROLES[formData.department] || []).map((r) => ({ label: r, value: r }))}
                  placeholder={formData.department ? '-- Select Role --' : '-- Select Department First --'}
                  onChange={(newRole) => setFormData(prev => ({ ...prev, role: newRole }))}
                />
              </div>

              <div className="form-row">
                <FloatingInput
                  label="Daily Rate (₹)"
                  type="number"
                  required
                  value={formData.dailyRate}
                  onChange={e => setFormData({ ...formData, dailyRate: e.target.value })}
                  placeholder="e.g. 800"
                />
                <FloatingInput
                  label="Standard Hours"
                  type="number"
                  required
                  value={formData.standardHours}
                  onChange={e => setFormData({ ...formData, standardHours: e.target.value })}
                  placeholder="8"
                />
                <FloatingSelect
                  label="Status"
                  value={formData.status}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' },
                  ]}
                  onChange={(newStatus) => setFormData(prev => ({ ...prev, status: newStatus }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn" style={{ margin: 0, padding: '0.9rem 2.8rem', fontSize: '1.4rem', width: 'auto', display: 'inline-block' }}>
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
                <button type="button" className="btn-cancel" style={{ margin: 0, padding: '0.9rem 2.8rem', fontSize: '1.4rem', width: 'auto', display: 'inline-block' }} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem', minWidth: '950px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '95px' }}>Emp ID</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '130px' }}>Name</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '160px' }}>Department</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '150px' }}>Role</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '110px' }}>Phone</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '80px' }}>Rate</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '90px' }}>Status</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '180px' }}>Today's Attendance</th>
                  <th style={{ padding: '1rem 1.2rem', fontWeight: 700, minWidth: '110px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <i className="fas fa-search" style={{ fontSize: '2.4rem', marginBottom: '1rem', display: 'block', color: '#cbd5e1' }}></i>
                      <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b' }}>
                        No employees found matching {search ? `"${search}"` : 'selected filters'}
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
                    onClick={() => openEmployee(emp)}
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
                    <td style={{ padding: '1rem 1.2rem', fontWeight: 600, color: '#0f172a' }}>{emp.name}</td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      {emp.department ? (
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          background: '#f4ece1',
                          color: 'var(--primary-color)',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {emp.department}
                        </span>
                      ) : <span style={{ color: '#999' }}>-</span>}
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ fontSize: '1.3rem', color: '#444', fontWeight: 500 }}>
                        {emp.role || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      {emp.phone ? (
                        <div>
                          <span style={{ fontSize: '1.35rem', color: '#334155', whiteSpace: 'nowrap' }}>
                            +91 {emp.phone.replace(/\D/g, '').slice(-10)}
                          </span>
                          <div style={{ marginTop: '4px' }}>
                            {emp.deviceId ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '1.05rem',
                                  color: '#15803d',
                                  background: '#dcfce7',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                }}
                              >
                                <i className="fas fa-lock" style={{ fontSize: '0.95rem' }}></i>
                                <span>{emp.deviceName || 'Phone'}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetDevice(emp._id, emp.name);
                                  }}
                                  title="Reset device lock so employee can use a new phone"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '1.1rem',
                                    marginLeft: '2px',
                                    lineHeight: 1,
                                  }}
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              </span>
                            ) : (
                              <span style={{ fontSize: '1.05rem', color: '#94a3b8' }}>
                                <i className="fas fa-mobile-alt" style={{ marginRight: '3px' }}></i>No device
                              </span>
                            )}
                          </div>
                        </div>
                      ) : <span style={{ color: '#999' }}>-</span>}
                    </td>
                    <td style={{ padding: '1rem 1.2rem', color: '#334155', fontWeight: 600 }}>₹{emp.dailyRate}</td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '1.15rem', 
                        fontWeight: 700,
                        background: emp.status === 'Active' ? '#dcfce7' : '#fce8e6',
                        color: emp.status === 'Active' ? '#137333' : '#c5221f',
                        display: 'inline-block',
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAttendance(emp._id, emp.standardHours || 8);
                          }}
                          title={`Mark Present (${emp.standardHours || 8}h)`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            lineHeight: '1.2',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#bbf7d0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dcfce7';
                          }}
                        >
                          <i className="fas fa-check" style={{ fontSize: '1.05rem' }}></i> Present
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAttendance(emp._id, 0);
                          }}
                          title="Mark Absent"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            lineHeight: '1.2',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fecaca';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                          }}
                        >
                          <i className="fas fa-times" style={{ fontSize: '1.05rem' }}></i> Absent
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          type="button"
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: 'none',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#0284c7',
                            padding: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(emp);
                          }}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: 'none',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#475569',
                            padding: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEmployee(emp);
                          }}
                          title="Manage details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <DeleteButton
                          size={32}
                          iconSize={16}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(emp._id);
                          }}
                          title="Delete Employee"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}
      
      {/* Payment / Advance Modal */}
      {isPaymentModalOpen && selectedEmployee && (
        <div
          onClick={() => {
            setIsPaymentModalOpen(false);
            setEditingPayment(null);
            setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInUp 0.4s ease-out',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '14px',
              background: '#fff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <form
              className="product-upload-form"
              onSubmit={handleAddPayment}
              style={{ padding: '2.5rem', background: '#fff', borderRadius: '14px', margin: 0, maxWidth: '100%' }}
            >
              <div
                className="form-section-title"
                style={{
                  borderBottom: '1.5px solid #e2e8f0',
                  paddingBottom: '1.2rem',
                  marginBottom: '2.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--main-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <i className={editingPayment ? 'fas fa-edit' : 'fas fa-money-bill-wave'} style={{ color: 'var(--primary-color)' }}></i>
                    {editingPayment ? 'Edit Payment / Advance' : 'Record Payment / Advance'}
                  </span>
                  <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                    Employee: <strong style={{ color: '#0f172a' }}>{selectedEmployee.name}</strong> ({selectedEmployee.employeeId || '—'})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPayment(null);
                    setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '2.4rem', lineHeight: '1', cursor: 'pointer', color: '#64748b' }}
                >
                  &times;
                </button>
              </div>

              <div className="form-row" style={{ alignItems: 'center' }}>
                <FloatingInput
                  label="Date"
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                />
                <FloatingInput
                  label="Amount (₹)"
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ alignItems: 'center' }}>
                <FloatingSelect
                  label="Payment Type"
                  value={paymentForm.paymentType}
                  options={[
                    { label: 'Advance', value: 'Advance' },
                    { label: 'Partial Payment', value: 'Partial Payment' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  onChange={(val) => setPaymentForm({ ...paymentForm, paymentType: val })}
                />
                <FloatingInput
                  label="Notes"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.8rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  style={{ margin: 0, padding: '0.8rem 2.2rem', fontSize: '1.3rem', width: 'auto' }}
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPayment(null);
                    setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ margin: 0, padding: '0.8rem 2.4rem', fontSize: '1.3rem', width: 'auto' }}
                >
                  {editingPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
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
