'use client';

import { useState, useEffect, useCallback } from 'react';
import { matchNearestSite, MatchedSiteResult, SiteLocation } from '@/lib/geo-utils';

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('ahof_device_uuid');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem('ahof_device_uuid', id);
  }
  return id;
}

function getDeviceFriendlyName(): string {
  if (typeof window === 'undefined') return 'Mobile Phone';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android Smartphone';
  if (/iphone/i.test(ua)) return 'Apple iPhone';
  if (/ipad/i.test(ua)) return 'Apple iPad';
  if (/windows/i.test(ua)) return 'Windows PC';
  if (/macintosh|mac os x/i.test(ua)) return 'Mac Computer';
  return 'Mobile Device';
}

export default function PunchClientView() {
  const [empIdentifier, setEmpIdentifier] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [deviceError, setDeviceError] = useState<string>('');
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [activeSites, setActiveSites] = useState<SiteLocation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  // Geolocation state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string>('');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [matchedSite, setMatchedSite] = useState<MatchedSiteResult | null>(null);

  // Punch actions state
  const [loading, setLoading] = useState(false);
  const [punching, setPunching] = useState(false);
  const [confirmPunchOutOpen, setConfirmPunchOutOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Live timer for active punch
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load saved employee ID from localStorage or auto-detect from database by device lock!
  useEffect(() => {
    const saved = localStorage.getItem('ahf_punch_emp_id') || localStorage.getItem('ahf_punch_phone');
    if (saved) {
      setEmpIdentifier(saved);
      setIsSaved(true);
      fetchPunchData(saved);
    } else {
      // Auto-detect directly from database by deviceId!
      fetchPunchData();
    }
  }, []);

  // Request GPS Location
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('GPS is not supported by your mobile browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(userCoords);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('Location permission denied. Please allow location access in your phone settings to punch in.');
        } else if (err.code === 2) {
          setGeoError('Location unavailable. Please make sure GPS / Location is turned ON on your phone.');
        } else {
          setGeoError('Could not retrieve location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, []);

  // Re-match nearest site when coords or activeSites change
  useEffect(() => {
    if (coords && activeSites.length > 0) {
      const match = matchNearestSite(coords.latitude, coords.longitude, activeSites);
      setMatchedSite(match);
      if (match.site?._id && !selectedSiteId) {
        setSelectedSiteId(match.site._id.toString());
      }
    }
  }, [coords, activeSites, selectedSiteId]);

  // Live timer effect when punched in
  useEffect(() => {
    if (!todayAttendance || todayAttendance.status !== 'punched_in' || !todayAttendance.punchIn) {
      return;
    }

    const updateTimer = () => {
      const start = new Date(todayAttendance.punchIn).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));

      const hrs = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsedTime(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Fetch employee info, status, active sites, and history
  const fetchPunchData = async (identifierVal?: string) => {
    setLoading(true);
    setDeviceError('');
    try {
      const devId = getOrCreateDeviceId();
      const devName = getDeviceFriendlyName();
      const queryParam = identifierVal ? `identifier=${encodeURIComponent(identifierVal)}&` : '';
      const res = await fetch(`/api/punch?${queryParam}deviceId=${encodeURIComponent(devId)}&deviceName=${encodeURIComponent(devName)}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.deviceConflict || data.deviceMismatch || res.status === 403) {
          setDeviceError(data.error || 'Device lock security verification failed.');
        } else {
          if (identifierVal) {
            showToast(data.error || 'Failed to verify employee', 'error');
          }
        }
        setEmployee(null);
        setTodayAttendance(null);
        setLoading(false);
        return;
      }

      setEmployee(data.employee);
      setTodayAttendance(data.todayAttendance);
      setActiveSites(data.activeSites || []);
      setHistory(data.history || []);

      const primaryId = data.employee.employeeId || identifierVal || '';
      if (primaryId) {
        setEmpIdentifier(primaryId);
        localStorage.setItem('ahf_punch_emp_id', primaryId);
        setIsSaved(true);
      }

      if (data.todayAttendance?.siteId) {
        setSelectedSiteId(data.todayAttendance.siteId.toString());
      }

      // Automatically request GPS after successful login
      requestLocation();
    } catch (err: any) {
      console.error(err);
      if (identifierVal) {
        showToast('Network error while connecting to server', 'error');
      }
    }
    setLoading(false);
  };

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = empIdentifier.trim();
    if (!clean) {
      showToast('Please enter your Employee ID (e.g. AHF-001)', 'error');
      return;
    }
    fetchPunchData(clean);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem('ahf_punch_emp_id');
    localStorage.removeItem('ahf_punch_phone');
    setIsSaved(false);
    setEmployee(null);
    setDeviceError('');
    setTodayAttendance(null);
    setEmpIdentifier('');
  };

  // Execute Punch In
  const handlePunchIn = async () => {
    if (!coords) {
      showToast('Please enable GPS location first', 'error');
      requestLocation();
      return;
    }
    if (!selectedSiteId) {
      showToast('Please select a job site', 'error');
      return;
    }

    setPunching(true);
    try {
      const devId = getOrCreateDeviceId();
      const devName = getDeviceFriendlyName();
      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'punch-in',
          employeeId: employee._id,
          siteId: selectedSiteId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          deviceId: devId,
          deviceName: devName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to punch in', 'error');
      } else {
        showToast(data.message || 'Punched in successfully!', 'success');
        setTodayAttendance(data.attendance);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Network error while punching in', 'error');
    }
    setPunching(false);
  };

  // Execute Punch Out
  const executePunchOut = async () => {
    setConfirmPunchOutOpen(false);
    setPunching(true);
    try {
      const devId = getOrCreateDeviceId();
      const devName = getDeviceFriendlyName();
      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'punch-out',
          employeeId: employee._id,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          deviceId: devId,
          deviceName: devName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to punch out', 'error');
      } else {
        showToast(data.message || 'Punched out successfully!', 'success');
        setTodayAttendance(data.attendance);
        if (empIdentifier) fetchPunchData(empIdentifier);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Network error while punching out', 'error');
    }
    setPunching(false);
  };

  const isPunchedIn = todayAttendance?.status === 'punched_in';
  const isCompleted = todayAttendance?.status === 'completed';

  return (
    <div
      suppressHydrationWarning
      style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem 1rem 4rem',
      boxSizing: 'border-box',
    }}>
      <style>{`
        /* Mobile Viewport Fix */
        html, body {
          padding-top: 0 !important;
          margin: 0 !important;
          background-color: #f8fafc !important;
        }
        .punch-card {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          margin-bottom: 1.2rem;
          box-sizing: border-box;
        }
        .pulse-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #22c55e;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          padding: '0.8rem 1.4rem',
          borderRadius: '30px',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: toast.type === 'success' ? '#15803d' : toast.type === 'error' ? '#b91c1c' : '#0369a1',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '90%',
          textAlign: 'center',
        }}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : toast.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Company Brand Header */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.4rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <svg width="38" height="38" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#a27341"/>
            <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M10 21V15.5H18V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M7 11.5H21" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#a27341', letterSpacing: '1px', lineHeight: 1.1 }}>ANANYA</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>HOUSE OF FURNITURE</div>
          </div>
        </div>
        <span style={{ fontSize: '1.1rem', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
          Site Punch
        </span>
      </div>

      {/* STEP 1: Employee ID Verification Card (if not logged in) */}
      {!employee && (
        <div className="punch-card" style={{ padding: '2rem 1.6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(162, 115, 65, 0.12)',
              color: '#a27341',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              marginBottom: '0.8rem',
            }}>
              <i className="fas fa-id-badge"></i>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Employee Attendance
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Enter your Employee ID to verify attendance and punch in or out at your job site.
            </p>
          </div>

          <form onSubmit={handleIdentifierSubmit}>
            <label style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>
              Employee ID
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#ffffff',
              marginBottom: '0.6rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.85rem 1.1rem',
                backgroundColor: '#f8fafc',
                borderRight: '1.5px solid #cbd5e1',
                color: '#a27341',
                fontWeight: 800,
                fontSize: '1.3rem',
              }}>
                <i className="fas fa-id-card"></i>
                <span>EMP ID</span>
              </div>
              <input
                type="text"
                autoCapitalize="characters"
                placeholder="e.g. AHF-001 or 001"
                value={empIdentifier}
                onChange={(e) => {
                  setEmpIdentifier(e.target.value.toUpperCase());
                  if (deviceError) setDeviceError('');
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: '#0f172a',
                }}
              />
            </div>
            <div style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Enter your Employee ID (e.g. <strong>AHF-001</strong>) or registered phone number.
            </div>

            {deviceError && (
              <div style={{
                marginBottom: '1.4rem',
                padding: '1.1rem 1.2rem',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #f87171',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#991b1b',
                fontSize: '1.25rem',
                lineHeight: 1.45,
              }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '1.8rem', marginTop: '2px', color: '#dc2626' }}></i>
                <div>
                  <strong style={{ display: 'block', fontWeight: 800, marginBottom: '4px', color: '#b91c1c' }}>
                    Device Lock Protection
                  </strong>
                  {deviceError}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !empIdentifier.trim()}
              style={{
                width: '100%',
                padding: '0.95rem',
                backgroundColor: empIdentifier.trim() ? '#a27341' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.4rem',
                fontWeight: 700,
                cursor: empIdentifier.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: empIdentifier.trim() ? '0 4px 12px rgba(162, 115, 65, 0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'}></i>
              <span>{loading ? 'Verifying with Database...' : 'Continue to Punch'}</span>
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Main Punching Dashboard (When Logged In) */}
      {employee && (
        <>
          {/* Employee Header Profile */}
          <div className="punch-card" style={{ padding: '1.2rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#a27341',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
              }}>
                {employee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{employee.name}</span>
                  {employee.employeeId && (
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#a27341',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}>
                      {employee.employeeId}
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '1.15rem', color: '#64748b', margin: 0 }}>
                  <span style={{ color: '#a27341', fontWeight: 700 }}>{employee.department || 'Staff'}</span> • {employee.role || 'Worker'}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '3px', fontSize: '1.05rem', color: '#15803d', fontWeight: 700 }}>
                  <i className="fas fa-lock" style={{ fontSize: '1rem' }}></i> Phone Locked to {employee.name}
                </div>
              </div>
            </div>
            <button
              onClick={handleSwitchUser}
              title="Change Account"
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Switch <i className="fas fa-sign-out-alt" style={{ marginLeft: '4px' }}></i>
            </button>
          </div>

          {/* GPS Location & Site Matching Card */}
          <div className="punch-card" style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#a27341' }}></i>
                GPS Location Check
              </span>
              <button
                onClick={requestLocation}
                disabled={geoLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a27341',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <i className={geoLoading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'}></i>
                {geoLoading ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>

            {geoError ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.9rem', color: '#991b1b', fontSize: '1.15rem', display: 'flex', gap: '8px' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px' }}></i>
                <div>
                  <div style={{ fontWeight: 700 }}>Location Required</div>
                  <div>{geoError}</div>
                </div>
              </div>
            ) : coords ? (
              <div>
                {matchedSite?.site ? (
                  <div style={{
                    backgroundColor: matchedSite.isWithinRadius ? '#f0fdf4' : '#fffbeb',
                    border: `1.5px solid ${matchedSite.isWithinRadius ? '#86efac' : '#fde68a'}`,
                    borderRadius: '12px',
                    padding: '0.9rem 1.1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: matchedSite.isWithinRadius ? '#22c55e' : '#f59e0b',
                        color: '#ffffff',
                      }}>
                        {matchedSite.isWithinRadius ? '✓ Inside Site Boundary' : '⚠ Outside Allowed Radius'}
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155' }}>
                        {matchedSite.distanceMeters}m away
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                        📍 {matchedSite.site.name}
                      </div>
                      <div style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '2px' }}>
                        {matchedSite.site.address}
                      </div>
                      <div style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '4px' }}>
                        Allowed boundary: {matchedSite.allowedRadius} meters
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.9rem', color: '#991b1b', fontSize: '1.2rem' }}>
                    No active job sites configured nearby. Please contact admin.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '1.2rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Detecting your current location...
              </div>
            )}
          </div>

          {/* MAIN PUNCH ACTION CARD */}
          <div className="punch-card" style={{ padding: '1.6rem 1.4rem', textAlign: 'center' }}>
            {/* STATE A: NOT PUNCHED IN */}
            {!isPunchedIn && !isCompleted && (
              <div>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
                  <i className="fas fa-sign-in-alt"></i>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                  Ready to Punch In
                </h3>
                <p style={{ fontSize: '1.2rem', color: '#64748b', margin: '0 0 1.2rem' }}>
                  Select your site and tap the button below to start your shift.
                </p>

                {/* Site Selection Dropdown */}
                <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                    Confirm Job Site
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="">-- Choose Job Site --</option>
                    {activeSites.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.address})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handlePunchIn}
                  disabled={punching || !matchedSite?.isWithinRadius || !selectedSiteId}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    backgroundColor: (matchedSite?.isWithinRadius && selectedSiteId) ? '#16a34a' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    cursor: (matchedSite?.isWithinRadius && selectedSiteId) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: (matchedSite?.isWithinRadius && selectedSiteId) ? '0 6px 18px rgba(22, 163, 74, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className={punching ? 'fas fa-spinner fa-spin' : 'fas fa-fingerprint'}></i>
                  <span>{punching ? 'Recording Punch In...' : 'PUNCH IN NOW'}</span>
                </button>

                {!matchedSite?.isWithinRadius && coords && (
                  <p style={{ fontSize: '1.15rem', color: '#dc2626', marginTop: '0.8rem', fontWeight: 600 }}>
                    <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>
                    Punching locked: You must be within the site boundary ({matchedSite?.allowedRadius || 200}m) to punch in.
                  </p>
                )}
              </div>
            )}

            {/* STATE B: CURRENTLY PUNCHED IN (SHIFT ACTIVE) */}
            {isPunchedIn && (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '20px', marginBottom: '0.8rem' }}>
                  <span className="pulse-dot"></span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                    Shift Active & Working
                  </span>
                </div>

                <div style={{ fontSize: '1.2rem', color: '#64748b' }}>
                  Working at: <strong style={{ color: '#0f172a' }}>{todayAttendance.siteName || 'Job Site'}</strong>
                </div>
                <div style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '2px' }}>
                  Punched in at: <strong style={{ color: '#a27341' }}>{new Date(todayAttendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>

                {/* Live Digital Timer */}
                <div style={{
                  margin: '1.4rem 0',
                  padding: '1.2rem',
                  background: '#0f172a',
                  color: '#38bdf8',
                  borderRadius: '12px',
                  fontFamily: 'Courier, monospace',
                  fontSize: '3rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
                }}>
                  {elapsedTime}
                  <div style={{ fontSize: '0.95rem', color: '#94a3b8', letterSpacing: '0px', fontFamily: 'sans-serif', marginTop: '4px' }}>
                    HOURS : MINUTES : SECONDS
                  </div>
                </div>

                <button
                  onClick={() => setConfirmPunchOutOpen(true)}
                  disabled={punching}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 18px rgba(220, 38, 38, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className={punching ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'}></i>
                  <span>{punching ? 'Recording Punch Out...' : 'PUNCH OUT (END SHIFT)'}</span>
                </button>
              </div>
            )}

            {/* STATE C: COMPLETED FOR TODAY */}
            {isCompleted && (
              <div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                  Shift Completed
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#64748b', margin: '0 0 1.2rem' }}>
                  Great job today! Your attendance and work hours have been recorded.
                </p>

                <div style={{
                  background: '#faf8f5',
                  border: '1px solid #e8dfd2',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.8rem',
                  textAlign: 'left',
                }}>
                  <div>
                    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Punch In</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {todayAttendance.punchIn ? new Date(todayAttendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Punch Out</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {todayAttendance.punchOut ? new Date(todayAttendance.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Work Hours</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#a27341', marginTop: '2px' }}>
                      {todayAttendance.workHours} Hours
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Earned Days</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                      {todayAttendance.earnedDays} Days
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ATTENDANCE HISTORY (LAST 7 DAYS) */}
          <div className="punch-card" style={{ padding: '1.2rem 1.4rem' }}>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              Recent Work History (Last 7 Days)
            </h4>

            {history.length === 0 ? (
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '1rem' }}>
                No recent attendance records found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {history.map((h) => (
                  <div key={h._id} style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                        {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
                        {h.siteName || 'Site'} • {h.status === 'completed' ? 'Completed' : h.status === 'punched_in' ? 'Working' : 'Manual'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a27341' }}>
                        {h.workHours} hrs
                      </div>
                      <div style={{ fontSize: '1.05rem', color: '#16a34a', fontWeight: 600 }}>
                        {h.earnedDays} day
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal for Punch Out */}
      {confirmPunchOutOpen && (
        <div
          onClick={() => setConfirmPunchOutOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 99999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2.4rem 2.2rem 2rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.22)',
              animation: 'fadeInScale 0.2s ease-out',
            }}
          >
            <p
              style={{
                fontSize: '1.5rem',
                color: '#0f172a',
                lineHeight: 1.55,
                margin: '0 0 2rem 0',
                fontWeight: 500,
              }}
            >
              Are you sure you want to <strong style={{ fontWeight: 800, color: '#0f172a' }}>Punch Out</strong> and finish your shift for today?
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={executePunchOut}
                disabled={punching}
                style={{
                  flex: 1,
                  padding: '0.8rem 1.4rem',
                  border: '2px solid #ef4444',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  borderRadius: '10px',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {punching ? 'Processing...' : 'Yes, Punch Out'}
              </button>

              <button
                type="button"
                onClick={() => setConfirmPunchOutOpen(false)}
                disabled={punching}
                style={{
                  flex: 1,
                  padding: '0.8rem 1.4rem',
                  border: '2px solid #1e40af',
                  backgroundColor: '#ffffff',
                  color: '#1e40af',
                  borderRadius: '10px',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
