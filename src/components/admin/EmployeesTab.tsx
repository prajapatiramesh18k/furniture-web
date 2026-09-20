'use client';
import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { DEPARTMENTS, DEPARTMENT_ROLES } from '@/lib/constants/employeeRoles';
import FloatingSelect from './FloatingSelect';
import FloatingInput from './FloatingInput';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminModalFooter } from '@/components/admin/AdminUI';
import ConfirmationModal from './ConfirmationModal';
import DeleteButton from './DeleteButton';
import { toTitleCase } from '@/lib/text';

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
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastToast = useRef<{ msg: string; type: string; at: number } | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const markingRef = useRef<string | null>(null);
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

  // Today's attendance per employee: 'present' | 'absent' — locks the buttons once marked.
  const [todayMap, setTodayMap] = useState<Record<string, 'present' | 'absent'>>({});

  const fetchTodayMap = async () => {
    try {
      const now = new Date();
      const res = await fetch(
        `/api/admin/employees/attendance?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const ty = now.getFullYear();
      const tm = now.getMonth();
      const td = now.getDate();
      const map: Record<string, 'present' | 'absent'> = {};
      for (const r of data) {
        const d = new Date(r.date);
        // Compare in UTC — manual records are stored as UTC-midnight day stamps.
        if (d.getUTCFullYear() === ty && d.getUTCMonth() === tm && d.getUTCDate() === td && r.employeeId) {
          map[String(r.employeeId)] = Number(r.workHours) > 0 ? 'present' : 'absent';
        }
      }
      setTodayMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const [search, setSearch] = useState('');
  const [nextIdPreview, setNextIdPreview] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Suppress an identical toast fired twice in a row (double-clicks,
    // double-mounts) so only one message ever appears.
    const now = Date.now();
    if (
      lastToast.current &&
      lastToast.current.msg === message &&
      lastToast.current.type === type &&
      now - lastToast.current.at < 4000
    ) {
      return;
    }
    lastToast.current = { msg: message, type, at: now };
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
    setPhoneError('');
    setFormData({ name: '', phone: '', department: '', role: '', dailyRate: '', standardHours: '8', status: 'Active', notes: '' });
  };

  const fetchNextIdPreview = async () => {
    try {
      const res = await fetch('/api/admin/employees/next-id', { cache: 'no-store' });
      const d = await res.json().catch(() => ({}));
      if (d?.employeeId) setNextIdPreview(String(d.employeeId));
    } catch {}
  };

  const computeNextEmployeeId = () => {
    if (nextIdPreview) return nextIdPreview;
    // Local fallback (any company prefix): max numeric suffix + 1.
    let maxNum = 0;
    let prefix = '';
    for (const emp of employees) {
      if (emp.employeeId) {
        const match = String(emp.employeeId).match(/^([A-Z0-9]{2,5})-(\d+)$/i);
        if (match) {
          if (!prefix) prefix = match[1].toUpperCase();
          const num = parseInt(match[2], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }
    return `${prefix || 'EMP'}-${String(maxNum + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/employees?limit=500', { signal: controller.signal, cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
        fetchTodayMap();
        fetchNextIdPreview();
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
      fetchTodayMap();
      fetchNextIdPreview();
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
    if (markingRef.current) return;
    markingRef.current = empId;
    setMarkingId(empId);
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
        setTodayMap((m) => ({ ...m, [empId]: hours === 0 ? 'absent' : 'present' }));
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to mark attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred', 'error');
    } finally {
      markingRef.current = null;
      setMarkingId(null);
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
      showToast('An error occurred', 'error');
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

  const { page, totalPages, paged, setPage, pageSize } = usePagination(filteredEmployees, 10, [search]);

  return (
    <div className="products-section">
      <AdminToast message={toast?.message || ''} tone={toast?.type} />

      {selectedEmployee ? (
        <div
          onClick={() => {
            setSelectedEmployee(null);
            setEditingPayment(null);
            setEditingAttendance(null);
          }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(62,42,18,.55)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 16, width: 'min(880px, 100%)', maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 30px 80px rgba(62,42,18,.35)',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
        <div style={{
          background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff',
          padding: '16px 22px', borderRadius: '16px 16px 0 0', display: 'flex',
          alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 5,
        }}>
          <span style={{
            width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.25)',
            border: '1px solid rgba(255,255,255,.55)', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>
            {toTitleCase(selectedEmployee.name || '?')[0].toUpperCase()}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: '0.08em' }}>EMPLOYEE</div>
            <div style={{ fontSize: 19, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {toTitleCase(selectedEmployee.name)}{' '}
              <span style={{
                background: 'rgba(255,255,255,.22)', border: '1px solid rgba(255,255,255,.4)',
                padding: '2px 10px', borderRadius: 6, fontSize: 12, letterSpacing: '0.05em', verticalAlign: 'middle',
              }}>
                {selectedEmployee.employeeId || '—'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setEditingPayment(null);
              setEditingAttendance(null);
            }}
            style={{
              background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.4)', color: '#fff',
              fontSize: '2rem', lineHeight: 1, cursor: 'pointer', width: 36, height: 36,
              borderRadius: '50%', flexShrink: 0,
            }}
            title="Close"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div style={{ padding: 22 }}>

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
                    onClick={() => handleResetDevice(selectedEmployee._id, toTitleCase(selectedEmployee.name))}
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
              <h3 style={{ margin: 0 }}><i className="fas fa-calendar-check" style={{ color: 'var(--primary-color)' }}></i> Attendance History — {toTitleCase(selectedEmployee.name)} ({selectedEmployee.employeeId || '—'})</h3>
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
                <i className="fas fa-money-bill-wave" style={{ color: 'var(--primary-color)' }}></i> Payment History — {toTitleCase(selectedEmployee.name)} ({selectedEmployee.employeeId || '—'})
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
        </div>
        </div>
    ) : (
      <ModuleShell
        title="Employee List"
        sub=""
        action={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="ahf-search-inline">
              <i className="fas fa-search"></i>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search employees" />
            </div>
          </div>
        )}
      >
      <AdminToast message={toast?.message || ''} tone={toast?.type} />

      {formOpen && (
        <AdminModal
          eyebrow={editingEmployee ? 'EDIT EMPLOYEE' : 'NEW EMPLOYEE'}
          title={editingEmployee ? 'Edit Employee' : 'New Employee'}
          subtitle="Appears in the list and attendance on save"
          onClose={resetForm}
          width={780}
        >
          <form onSubmit={handleCreateEmployee}>

              <div className="form-row">
                <FloatingInput
                  label={editingEmployee ? "Employee ID (Permanent)" : "Employee ID (Auto-Generated)"}
                  value={editingEmployee ? (editingEmployee.employeeId || 'EMP-???') : computeNextEmployeeId()}
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

              <AdminModalFooter>
                <button type="button" className="ahf-btn ahf-btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="ahf-btn ahf-btn-primary">
                  <i className="fas fa-check"></i> {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </AdminModalFooter>
            </form>
        </AdminModal>
      )}

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Employees ({filteredEmployees.length})</h3></div>
          <button
            className="ahf-btn ahf-btn-primary ahf-btn-sm"
            onClick={() => {
              resetForm();
              fetchNextIdPreview();
              setFormOpen(true);
            }}
            title="Add New Employee"
          >
            <i className="fas fa-plus"></i> Create
          </button>
        </div>
        {loading && employees.length === 0 ? <LoadingList /> : (
          <DataTable
            columns={[
              {
                key: 'e', header: 'Emp ID', render: (emp) => (
                  <strong style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{emp.employeeId || '—'}</strong>
                ),
              },
              {
                key: 'n', header: 'Name', render: (emp) => (
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{toTitleCase(emp.name)}</span>
                ),
              },
              {
                key: 'd', header: 'Department', render: (emp) => (
                  <span style={{ fontSize: 12.5 }}>{emp.department || '—'}</span>
                ),
              },
              {
                key: 'r', header: 'Role', render: (emp) => (
                  <span style={{ fontSize: 12.5 }}>{emp.role || '—'}</span>
                ),
              },
              {
                key: 'c', header: 'Phone', render: (emp) => (
                  emp.phone ? (
                    <div>
                      <div style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
                        +91 {String(emp.phone).replace(/\D/g, '').slice(-10)}
                      </div>
                      <div style={{ fontSize: 11.5, marginTop: 2 }}>
                        {emp.deviceId ? (
                          <span style={{ color: '#2e7d4f', fontWeight: 600 }}>
                            <i className="fas fa-lock"></i> {emp.deviceName || 'Phone'}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleResetDevice(emp._id, toTitleCase(emp.name)); }}
                              title="Reset device lock so employee can use a new phone"
                              style={{ border: 'none', background: 'transparent', color: '#b3273a', cursor: 'pointer', padding: '0 2px', marginLeft: 2, lineHeight: 1 }}
                            >
                              <i className="fas fa-times-circle"></i>
                            </button>
                          </span>
                        ) : (
                          <span style={{ color: '#8a7a66' }}><i className="fas fa-mobile-alt"></i> No device</span>
                        )}
                      </div>
                    </div>
                  ) : <span>—</span>
                ),
              },
              { key: 'rate', header: 'Rate', render: (emp) => <span className="ahf-amt">₹{emp.dailyRate}</span> },
              { key: 's', header: 'Status', render: (emp) => <StatusBadge status={emp.status === 'Active' ? 'Active' : 'Inactive'} /> },
              {
                key: 't', header: "Today's Attendance", render: (emp) => {
                  const st = todayMap[emp._id];
                  if (st === 'present') {
                    return (
                      <span title="Present marked for today — locked" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, backgroundColor: '#2e7d4f', color: '#fff' }}>
                        <i className="fas fa-lock"></i><i className="fas fa-check"></i> Present
                      </span>
                    );
                  }
                  if (st === 'absent') {
                    return (
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button type="button" disabled title="Today is already marked Absent — locked" className="ahf-btn ahf-btn-ghost ahf-btn-sm" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                          <i className="fas fa-ban"></i> Present
                        </button>
                        <StatusBadge status="Absent" />
                      </span>
                    );
                  }
                  return (
                    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="ahf-btn ahf-btn-sm"
                        disabled={markingId === emp._id}
                        onClick={(e) => { e.stopPropagation(); handleQuickAttendance(emp._id, emp.standardHours || 8); }}
                        title={`Mark Present (${emp.standardHours || 8}h)`}
                        style={markingId === emp._id
                          ? { background: '#e6f2e9', border: '1px solid #bfe0c9', color: '#2e7d4f', opacity: 0.6, cursor: 'wait' }
                          : { background: '#e6f2e9', border: '1px solid #bfe0c9', color: '#2e7d4f' }}
                      >
                        <i className="fas fa-check"></i> Present
                      </button>
                      <button
                        type="button"
                        className="ahf-btn ahf-btn-sm"
                        disabled={markingId === emp._id}
                        onClick={(e) => { e.stopPropagation(); handleQuickAttendance(emp._id, 0); }}
                        title="Mark Absent"
                        style={markingId === emp._id
                          ? { background: '#fbe7e3', border: '1px solid #f0c4bc', color: '#b3273a', opacity: 0.6, cursor: 'wait' }
                          : { background: '#fbe7e3', border: '1px solid #f0c4bc', color: '#b3273a' }}
                      >
                        <i className="fas fa-times"></i> Absent
                      </button>
                    </span>
                  );
                },
              },
              {
                key: 'a', header: 'Action', render: (emp) => (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                    <button className="ahf-mini-btn" title="Edit" onClick={() => handleEditEmployee(emp)}>
                      <i className="fas fa-pen"></i>
                    </button>
                    <button className="ahf-mini-btn" title="Manage details" onClick={() => openEmployee(emp)}>
                      <i className="fas fa-eye"></i>
                    </button>
                    <DeleteButton
                      size={32}
                      iconSize={16}
                      onClick={() => handleDeleteEmployee(emp._id)}
                      title="Delete Employee"
                    />
                  </div>
                ),
              },
            ]}
            rows={paged}
            emptyText={search ? `No employees found matching "${search}"` : 'No employees yet.'}
            onRowClick={openEmployee}
          />
        )}
        {!(loading && employees.length === 0) && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={filteredEmployees.length} onPage={setPage} />
        )}
      </div>
      
    </ModuleShell>
      )}
      
      {/* Payment / Advance Modal */}
      {isPaymentModalOpen && selectedEmployee && (
        <AdminModal
          eyebrow={editingPayment ? 'EDIT PAYMENT' : 'NEW PAYMENT'}
          title={editingPayment ? 'Edit Payment / Advance' : 'Record Payment / Advance'}
          subtitle={`${toTitleCase(selectedEmployee.name)} (${selectedEmployee.employeeId || '—'})`}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setEditingPayment(null);
            setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
          }}
          width={650}
        >
          <form onSubmit={handleAddPayment}>

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

              <AdminModalFooter>
                <button
                  type="button"
                  className="ahf-btn ahf-btn-ghost"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPayment(null);
                    setPaymentForm({ date: '', amount: '', paymentType: 'Advance', notes: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="ahf-btn ahf-btn-primary">
                  <i className="fas fa-check"></i> {editingPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </AdminModalFooter>
            </form>
        </AdminModal>
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
