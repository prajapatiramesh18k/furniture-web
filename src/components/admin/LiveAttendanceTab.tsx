'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import UIDropdown from '@/components/UIDropdown';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminField, AdminModalFooter } from '@/components/admin/AdminUI';
import { toTitleCase } from '@/lib/text';

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

  const fetchLiveData = useCallback(async (signal?: AbortSignal) => {
    // Skip background polls when the tab is hidden to save server + battery
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    setLoading(true);
    try {
      let url = `/api/admin/attendance/live?date=${selectedDate}`;
      if (selectedSiteId) url += `&siteId=${selectedSiteId}`;

      const res = await fetch(url, { signal, cache: 'no-store' });
      const data = await res.json();

      if (res.ok) {
        setRecords(data.records || []);
        setSummary(data.summary || { totalEmployees: 0, currentlyWorking: 0, completedToday: 0, absent: 0 });
        setSites(data.sites || []);
      } else {
        showToast(data.error || 'Failed to fetch live attendance', 'error');
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      console.error(err);
      showToast('Network error while loading live attendance', 'error');
    }
    setLoading(false);
  }, [selectedDate, selectedSiteId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveData(controller.signal);
    // Auto-refresh every 30 seconds for live monitoring (paused when hidden)
    const interval = setInterval(() => fetchLiveData(), 30000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
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

  const manualCount = useMemo(() => records.filter((r) => r.status === 'manual').length, [records]);
  const absentCount = useMemo(() => records.filter((r) => r.status === 'absent').length, [records]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(filteredRecords, 10, [search, selectedSiteId, selectedDate]);

  const statusLabel = (s: LiveRecord['status']) =>
    s === 'punched_in' ? 'Working' : s === 'completed' ? 'Completed' : s === 'absent' ? 'Absent' : 'Manual';

  return (
    <ModuleShell
      title="Live Attendance"
      sub=""
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="ahf-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Attendance date"
          />
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search workers" />
          </div>
        </div>
      )}
    >
      <AdminToast message={toast?.message || ''} tone={toast?.type} />

      {/* Filter and Action Bar */}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Site Filter */}
            <UIDropdown
              label="Filter by job site"
              value={selectedSiteId}
              placeholder="All Job Sites"
              style={{ minWidth: 220 }}
              options={[{ value: '', label: 'All Job Sites' }, ...sites.map((s) => ({ value: String(s._id), label: String(s.name) }))]}
              onChange={setSelectedSiteId}
            />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fffdf8', border: '1px solid var(--ahf-line)', borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <strong>{summary.totalEmployees}</strong> <span style={{ color: '#8a7a66' }}>Staff</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fffdf8', border: '1px solid var(--ahf-line)', borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#2e7d4f' }}>{summary.currentlyWorking}</strong> <span style={{ color: '#8a7a66' }}>Working</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fffdf8', border: '1px solid var(--ahf-line)', borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <strong>{summary.completedToday}</strong> <span style={{ color: '#8a7a66' }}>Done</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fffdf8', border: '1px solid var(--ahf-line)', borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <strong>{manualCount}</strong> <span style={{ color: '#8a7a66' }}>Manual</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fffdf8', border: '1px solid var(--ahf-line)', borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#b3273a' }}>{absentCount}</strong> <span style={{ color: '#8a7a66' }}>Absent</span>
            </span>
            <button
              className="ahf-btn ahf-btn-ghost ahf-btn-sm"
              onClick={() => fetchLiveData()}
              disabled={loading}
              style={{ marginLeft: 'auto' }}
            >
              <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'}></i>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Table */}
      <div className="ahf-panel list-compact">
        {loading && records.length === 0 ? <LoadingList /> : (
          <DataTable
            columns={[
              {
                key: 'id', header: 'Emp ID', render: (rec) => (
                  <strong style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{rec.employee.employeeId || '—'}</strong>
                ),
              },
              {
                key: 'n', header: 'Name', render: (rec) => (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{toTitleCase(rec.employee.name)}</div>
                    <div style={{ fontSize: 11.5, color: rec.employee.deviceId ? '#2e7d4f' : '#8a7a66' }}>
                      <i className={`fas ${rec.employee.deviceId ? 'fa-lock' : 'fa-mobile-alt'}`}></i>{' '}
                      {rec.employee.deviceId ? (rec.employee.deviceName || 'Phone Locked') : 'No device'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'd', header: 'Department', render: (rec) => (
                  <span style={{ fontSize: 12.5 }}>{rec.employee.department || '—'}</span>
                ),
              },
              {
                key: 'r', header: 'Role', render: (rec) => (
                  <span style={{ fontSize: 12.5 }}>{rec.employee.role || '—'}</span>
                ),
              },
              { key: 'site', header: 'Site', render: (rec) => <span style={{ fontSize: 12.5 }}>{rec.siteName}</span> },
              {
                key: 'in', header: 'Punch In', render: (rec) => (
                  <span style={{ fontSize: 12.5 }}>{rec.punchIn ? new Date(rec.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                ),
              },
              {
                key: 'out', header: 'Punch Out', render: (rec) => (
                  <span style={{ fontSize: 12.5 }}>{rec.punchOut ? new Date(rec.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                ),
              },
              {
                key: 'h', header: 'Hours Worked', render: (rec) => (
                  rec.status === 'punched_in'
                    ? <span style={{ fontSize: 13, fontWeight: 800, color: '#2e7d4f' }}>{formatElapsed(rec.elapsedMinutes)} <span style={{ fontSize: 11, fontWeight: 600 }}>(Live)</span></span>
                    : rec.status === 'completed'
                      ? <span style={{ fontSize: 12.5 }}><strong>{rec.workHours} hrs</strong> <span style={{ color: '#2e7d4f' }}>{rec.earnedDays} days</span></span>
                      : <span style={{ fontSize: 12.5, color: '#8a7a66' }}>0 hrs</span>
                ),
              },
              { key: 's', header: 'Status', render: (rec) => <StatusBadge status={statusLabel(rec.status)} /> },
              {
                key: 'a', header: 'Action', render: (rec) => (
                  <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenAdjust(rec); }}>
                    <i className="fas fa-pencil-alt"></i> Adjust
                  </button>
                ),
              },
            ]}
            rows={paged}
            emptyText="No employee records found."
            onRowClick={handleOpenAdjust}
          />
        )}
        {!(loading && records.length === 0) && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={filteredRecords.length} onPage={setPage} />
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {modalOpen && selectedRecord && (
        <AdminModal
          eyebrow="ATTENDANCE"
          title="Adjust Attendance"
          subtitle={`${toTitleCase(selectedRecord.employee.name)} · ${selectedDate}`}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSaveAdjustment}>
            <AdminField label="Total Work Hours *">
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                className="ahf-input"
                value={adjustForm.workHours}
                onChange={(e) => setAdjustForm({ ...adjustForm, workHours: e.target.value })}
                required
              />
            </AdminField>
            <AdminField label="Notes / Reason for Adjustment" style={{ marginBottom: 16 }}>
              <textarea
                className="ahf-input"
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                placeholder="e.g. Employee phone battery died, verified on site"
                rows={3}
              />
            </AdminField>
            <AdminModalFooter>
              <button type="button" className="ahf-btn ahf-btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="ahf-btn ahf-btn-primary">
                <i className="fas fa-check"></i> Save Adjustment
              </button>
            </AdminModalFooter>
          </form>
        </AdminModal>
      )}
    </ModuleShell>
  );
}
