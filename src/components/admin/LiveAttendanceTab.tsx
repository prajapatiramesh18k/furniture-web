'use client';

import { useState, useEffect, useCallback } from 'react';

interface LiveRecord {
  employee: {
    _id: string;
    employeeId?: string | null;
    name: string;
    department?: string;
    role?: string;
    phone?: string;
    dailyRate?: number;
    standardHours?: number;
    deviceId?: string | null;
    deviceName?: string;
  };
  attendance: any;
  status: 'punched_in' | 'completed' | 'absent' | 'manual';
  siteName: string;
  punchIn: string | null;
  punchOut: string | null;
  workHours: number;
  earnedDays: number;
  overtimeHours: number;
  elapsedMinutes: number;
}

export default function LiveAttendanceTab() {
  const [records, setRecords] = useState<LiveRecord[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    currentlyWorking: 0,
    completedToday: 0,
    absent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [search, setSearch] = useState('');

  // Manual adjustment modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LiveRecord | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    workHours: '',
    notes: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/attendance/live?date=${selectedDate}`;
      if (selectedSiteId) url += `&siteId=${selectedSiteId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setRecords(data.records || []);
        setSummary(data.summary || { totalEmployees: 0, currentlyWorking: 0, completedToday: 0, absent: 0 });
        setSites(data.sites || []);
      } else {
        showToast(data.error || 'Failed to fetch live attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while loading live attendance', 'error');
    }
    setLoading(false);
  }, [selectedDate, selectedSiteId]);

  useEffect(() => {
    fetchLiveData();
    // Auto-refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const handleOpenAdjust = (rec: LiveRecord) => {
    setSelectedRecord(rec);
    setAdjustForm({
      workHours: rec.workHours ? rec.workHours.toString() : '8',
      notes: rec.attendance?.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const hours = Number(adjustForm.workHours);
      const standardHours = selectedRecord.employee.standardHours || 8;
      const earnedDays = Number((hours / standardHours).toFixed(2));

      let res;
      if (selectedRecord.attendance?._id) {
        // Update existing attendance record
        res = await fetch(`/api/admin/employees/attendance/${selectedRecord.attendance._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workHours: hours,
            earnedDays,
            notes: adjustForm.notes,
            status: 'completed',
          }),
        });
      } else {
        // Create manual attendance record
        res = await fetch('/api/admin/employees/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: selectedRecord.employee._id,
            date: selectedDate,
            workHours: hours,
            notes: adjustForm.notes || 'Admin manual punch adjustment',
          }),
        });
      }

      if (res.ok) {
        showToast('Attendance record updated successfully');
        setModalOpen(false);
        fetchLiveData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    }
  };

  const formatElapsed = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const filteredRecords = records.filter(r =>
    r.employee.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.employee.employeeId && r.employee.employeeId.toLowerCase().includes(search.toLowerCase())) ||
    (r.employee.department && r.employee.department.toLowerCase().includes(search.toLowerCase())) ||
    (r.employee.role && r.employee.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '1rem 1.6rem',
          borderRadius: '8px',
          color: '#ffffff',
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '1.3rem',
          fontWeight: 600,
        }}>
          {toast.message}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Active Staff</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{summary.totalEmployees}</div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '1.4rem', border: '1.5px solid #86efac', boxShadow: '0 2px 8px rgba(34,197,94,0.1)' }}>
          <div style={{ fontSize: '1.15rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
            Currently Working
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{summary.currentlyWorking}</div>
        </div>

        <div style={{ backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '1.4rem', border: '1.5px solid #bae6fd', boxShadow: '0 2px 8px rgba(2,132,199,0.1)' }}>
          <div style={{ fontSize: '1.15rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>Shift Completed Today</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{summary.completedToday}</div>
        </div>

        <div style={{ backgroundColor: '#fafafa', borderRadius: '12px', padding: '1.4rem', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '1.15rem', color: '#737373', fontWeight: 700, textTransform: 'uppercase' }}>Not Punched In</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#525252', marginTop: '4px' }}>{summary.absent}</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: '1 1 500px' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input
              type="text"
              placeholder="Search by worker name, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.8rem',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                fontSize: '1.25rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              fontSize: '1.25rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />

          {/* Site Filter */}
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              fontSize: '1.25rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">All Job Sites</option>
            {sites.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchLiveData}
          disabled={loading}
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.75rem 1.4rem',
            fontSize: '1.25rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#334155',
          }}
        >
          <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'}></i>
          {loading ? 'Refreshing...' : 'Refresh Live Status'}
        </button>
      </div>

      {/* Live Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Employee</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Current Job Site</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Punch In</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Punch Out</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Hours Worked</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading live attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No employee records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isWorking = rec.status === 'punched_in';
                  const isDone = rec.status === 'completed';

                  return (
                    <tr key={rec.employee._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isWorking ? '#f0fdf455' : undefined }}>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            color: 'var(--primary-color)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            letterSpacing: '0.5px',
                          }}>
                            {rec.employee.employeeId || '—'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{rec.employee.name}</span>
                        </div>
                        <div style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ color: '#a27341', fontWeight: 600 }}>{rec.employee.department || 'N/A'}</span> • {rec.employee.role || 'Worker'}
                        </div>
                        <div style={{ fontSize: '1.05rem', marginTop: '3px' }}>
                          {rec.employee.deviceId ? (
                            <span style={{ color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }} title={`Phone Locked: ${rec.employee.deviceName || 'Device'}`}>
                              <i className="fas fa-lock" style={{ fontSize: '0.95rem' }}></i> {rec.employee.deviceName || 'Phone Locked'}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>
                              <i className="fas fa-mobile-alt" style={{ marginRight: '3px' }}></i> No device bound
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          backgroundColor: isWorking ? '#dcfce7' : isDone ? '#e0f2fe' : '#f1f5f9',
                          color: isWorking ? '#15803d' : isDone ? '#0369a1' : '#64748b',
                        }}>
                          {isWorking && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>}
                          {isWorking ? 'Working On-Site' : isDone ? 'Shift Completed' : 'Not Punched In'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: '#334155' }}>
                        {rec.siteName}
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: '#334155' }}>
                        {rec.punchIn ? new Date(rec.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: '#334155' }}>
                        {rec.punchOut ? new Date(rec.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        {isWorking ? (
                          <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1.35rem' }}>
                            {formatElapsed(rec.elapsedMinutes)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#16a34a' }}>(Live)</span>
                          </div>
                        ) : isDone ? (
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.35rem' }}>
                              {rec.workHours} hrs
                            </div>
                            <div style={{ fontSize: '1.1rem', color: '#16a34a', fontWeight: 600 }}>
                              {rec.earnedDays} days
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>0 hrs</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenAdjust(rec)}
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '1.15rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-pencil-alt" style={{ marginRight: '4px' }}></i> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {modalOpen && selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Adjust Attendance
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '1.4rem' }}>
              Employee: <strong style={{ color: '#0f172a' }}>{selectedRecord.employee.name}</strong> on <strong>{selectedDate}</strong>
            </p>

            <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Total Work Hours *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={adjustForm.workHours}
                  onChange={(e) => setAdjustForm({ ...adjustForm, workHours: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Notes / Reason for Adjustment
                </label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="e.g. Employee phone battery died, verified on site"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '1.25rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.8rem 1.4rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 1.8rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#a27341',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(162, 115, 65, 0.3)',
                  }}
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
