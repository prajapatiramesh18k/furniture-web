'use client';
import { useState, useEffect } from 'react';
import { DEPARTMENTS, DEPARTMENT_ROLES } from '@/lib/constants/employeeRoles';
import FloatingSelect from './FloatingSelect';
import FloatingInput from './FloatingInput';

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
  const [editingAttendance, setEditingAttendance] = useState<any | null>(null);
  const [editAttendanceStatus, setEditAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [quickHours, setQuickHours] = useState<{ [key: string]: number }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    fetchEmployees();
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
      const res = await fetch('/api/admin/employees');
      const data = await res.json();
      setEmployees(data);
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

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
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
      const res = await fetch(editingAttendance ? `/api/admin/employees/attendance/${editingAttendance._id}` : '/api/admin/employees/attendance', {
        method: editingAttendance ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          date: attendanceForm.date,
          workHours: Number(attendanceForm.workHours),
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
    setEditAttendanceStatus(a.workHours > 0 ? 'present' : 'absent');
    setAttendanceForm({
      date: new Date(a.date).toISOString().split('T')[0],
      workHours: a.workHours.toString(),
      notes: a.notes || ''
    });
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
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
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/employees/payments', {
        method: 'POST',
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
        fetchPayments(selectedEmployee._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedEmployee) {
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
          <h2><i className="fas fa-user"></i> {selectedEmployee.name}</h2>
          <button className="btn" onClick={() => setSelectedEmployee(null)}>Back to Employees</button>
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
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-calendar-check" style={{ color: 'var(--primary-color)' }}></i> Attendance History</h3>
            </div>

            {editingAttendance && (
              <form className="product-upload-form" onSubmit={handleAddAttendance} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fdf8f0', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                <div className="form-section-title" style={{ fontSize: '1.4rem' }}>
                  <i className="fas fa-edit" style={{ color: 'var(--primary-color)' }}></i> Edit Attendance — {new Date(editingAttendance.date).toLocaleDateString()}
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

            <div style={{ overflowX: 'auto', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table className="orders-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attendance</th>
                    <th>Hours</th>
                    <th>Earned Days</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No attendance records found</td></tr>}
                  {attendance.map(a => (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: a.workHours > 0 ? '#e6f4ea' : '#fce8e6',
                          color: a.workHours > 0 ? '#137333' : '#c5221f'
                        }}>
                          {a.workHours > 0 ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td>{a.workHours}h</td>
                      <td>{a.earnedDays}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button className="btn-edit" style={{ margin: 0, padding: '0.3rem 0.5rem' }} onClick={() => handleEditAttendance(a)}><i className="fas fa-edit"></i></button>
                          <button className="delete-btn" style={{ margin: 0, padding: '0.3rem 0.5rem' }} onClick={() => handleDeleteAttendance(a._id)}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'payments' && (
          <div>
            <form className="product-upload-form" onSubmit={handleAddPayment} style={{ marginBottom: '2rem' }}>
              <div className="form-section-title"><i className="fas fa-money-bill"></i> Record Payment/Advance</div>
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
              <button type="submit" className="btn" style={{ marginTop: '1rem', padding: '0.8rem 2.2rem', fontSize: '1.4rem', width: 'auto' }}>Save Payment</button>
            </form>

            <div style={{ overflowX: 'auto', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table className="orders-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>₹{p.amount.toLocaleString()}</td>
                      <td>{p.paymentType}</td>
                      <td>{p.notes || '-'}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No payment records found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="products-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><i className="fas fa-users"></i> Employees</h2>
        {!formOpen && (
          <button className="btn" onClick={() => setFormOpen(true)}>
            Add Employee
          </button>
        )}
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
                  label="Name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                />
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
              </div>

              <div className="form-row">
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
        <div style={{ overflowX: 'auto', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table className="orders-table" style={{ margin: 0, minWidth: '950px' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '130px' }}>Name</th>
                <th style={{ minWidth: '160px' }}>Department</th>
                <th style={{ minWidth: '150px' }}>Role</th>
                <th style={{ minWidth: '110px' }}>Phone</th>
                <th style={{ minWidth: '80px' }}>Rate</th>
                <th style={{ minWidth: '90px' }}>Status</th>
                <th style={{ minWidth: '220px' }}>Today's Attendance</th>
                <th style={{ minWidth: '110px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td>
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
                  <td>
                    <span style={{ fontSize: '1.3rem', color: '#444', fontWeight: 500 }}>
                      {emp.role || '-'}
                    </span>
                  </td>
                  <td>
                    {emp.phone ? (
                      <span style={{ fontSize: '1.35rem', color: '#334155', whiteSpace: 'nowrap' }}>
                        +91 {emp.phone.replace(/\D/g, '').slice(-10)}
                      </span>
                    ) : <span style={{ color: '#999' }}>-</span>}
                  </td>
                  <td>₹{emp.dailyRate}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: 600,
                      background: emp.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                      color: emp.status === 'Active' ? '#137333' : '#c5221f'
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select className="box" style={{ width: '60px', padding: '0.2rem', margin: 0, height: '32px' }} 
                        value={quickHours[emp._id] || emp.standardHours}
                        onChange={(e) => setQuickHours({ ...quickHours, [emp._id]: Number(e.target.value) })}>
                        {[4, 6, 8, 9, 10, 12, 14].map(h => (
                          <option key={h} value={h}>{h}h</option>
                        ))}
                      </select>
                      <button className="btn" style={{ margin: 0, width: 'auto', padding: '0.4rem 0.8rem', fontSize: '13px', background: 'var(--primary-color)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => handleQuickAttendance(emp._id, quickHours[emp._id] || emp.standardHours)}>
                        <i className="fas fa-check"></i> Present
                      </button>
                      <button className="btn" style={{ margin: 0, width: 'auto', padding: '0.4rem 0.8rem', fontSize: '13px', background: '#333', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => handleQuickAttendance(emp._id, 0)}>
                        <i className="fas fa-times"></i> Absent
                      </button>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                      <button className="btn-edit" style={{ margin: 0, width: 'auto', padding: '0.4rem 0.6rem', display: 'inline-flex' }} onClick={() => handleEditEmployee(emp)} title="Edit"><i className="fas fa-edit"></i></button>
                      <button className="btn-edit" style={{ margin: 0, width: 'auto', padding: '0.4rem 0.6rem', display: 'inline-flex' }} onClick={() => openEmployee(emp)} title="Manage details"><i className="fas fa-eye"></i></button>
                      <button className="delete-btn" style={{ margin: 0, padding: '0.4rem 0.6rem', display: 'inline-flex' }} onClick={() => handleDeleteEmployee(emp._id)} title="Delete"><i className="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center' }}>No employees found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      
      {/* End of list view */}
      {loading ? null : formOpen ? null : <div style={{ height: '2rem' }}></div>}
    </div>
  );
}
