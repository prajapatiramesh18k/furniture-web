'use client';

import { useState, useEffect } from 'react';
import FloatingInput from './FloatingInput';
import ConfirmationModal from './ConfirmationModal';

interface Site {
  _id: string;
  name: string;
  clientName?: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export default function SitesTab() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    address: '',
    latitude: '',
    longitude: '',
    radiusMeters: 200,
    isActive: true,
    notes: '',
  });

  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    boldWord?: string;
    afterBold?: string;
    subtext?: string;
    confirmText?: string;
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

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sites');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSites(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch sites', 'error');
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      clientName: '',
      address: '',
      latitude: '',
      longitude: '',
      radiusMeters: 200,
      isActive: true,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      clientName: site.clientName || '',
      address: site.address,
      latitude: site.location.latitude.toString(),
      longitude: site.location.longitude.toString(),
      radiusMeters: site.radiusMeters || 200,
      isActive: site.isActive,
      notes: site.notes || '',
    });
    setModalOpen(true);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        showToast('Current GPS coordinates captured successfully!');
      },
      (err) => {
        setLocating(false);
        showToast(err.message || 'Could not retrieve GPS location', 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Site name is required', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showToast('Site address is required', 'error');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      showToast('Valid GPS latitude & longitude are required', 'error');
      return;
    }

    try {
      const url = editingSite ? `/api/admin/sites/${editingSite._id}` : '/api/admin/sites';
      const method = editingSite ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          radiusMeters: Number(formData.radiusMeters),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save site', 'error');
      } else {
        showToast(editingSite ? 'Site updated successfully' : 'New site added successfully');
        setModalOpen(false);
        fetchSites();
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving site', 'error');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to',
      boldWord: 'Delete',
      afterBold: `site "${name}"?`,
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/sites/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Site deleted successfully');
            fetchSites();
          } else {
            showToast('Failed to delete site', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error', 'error');
        }
      },
    });
  };

  const filteredSites = sites.filter(s => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      (s.clientName && s.clientName.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  });

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

      {/* Header Toolbar: Title on left, Search keyword & '+' button on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-map-marker-alt"></i> Job Sites
          <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
            {filteredSites.length}
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

          {/* Plus '+' Button to Add Job Site */}
          <button
            type="button"
            onClick={handleOpenAdd}
            title="Add New Job Site"
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

      {/* Sites List Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.3rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Site / Project Name</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Address</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>GPS Location</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Allowed Radius</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem 1.2rem', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading job sites...
                  </td>
                </tr>
              ) : filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <i className="fas fa-search" style={{ fontSize: '2.4rem', marginBottom: '1rem', display: 'block', color: '#cbd5e1' }}></i>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b' }}>
                      No job sites found matching {search ? `"${search}"` : 'records'}
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
                filteredSites.map((site) => (
                  <tr key={site._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{site.name}</div>
                      {site.clientName && (
                        <div style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '2px' }}>
                          Client: {site.clientName}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.2rem', color: '#334155', maxWidth: '240px' }}>
                      {site.address}
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <a
                        href={`https://www.google.com/maps?q=${site.location.latitude},${site.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <i className="fas fa-map-marker-alt"></i>
                        {site.location.latitude.toFixed(4)}, {site.location.longitude.toFixed(4)}
                      </a>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '1.2rem' }}>
                        {site.radiusMeters || 200} meters
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        backgroundColor: site.isActive ? '#dcfce7' : '#f1f5f9',
                        color: site.isActive ? '#15803d' : '#64748b',
                      }}>
                        {site.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(site)}
                          title="Edit Site"
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#0284c7',
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(site._id, site.name)}
                          title="Delete Site"
                          style={{
                            backgroundColor: '#fee2e2',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#dc2626',
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Site Modal */}
      {modalOpen && (
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
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingSite ? 'Edit Job Site' : 'Add New Job Site'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <FloatingInput
                id="site-name"
                label="Site / Project Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Lodha Splendora - Flat 402"
              />

              <FloatingInput
                id="site-client"
                label="Client / Project Reference (Optional)"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Mr. Sharma"
              />

              <FloatingInput
                id="site-address"
                label="Street Address *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="e.g. Diva-Shil Road, Thane, Maharashtra - 400612"
              />

              {/* GPS Coordinates Header & Capture Button */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    <i className="fas fa-crosshairs" style={{ color: '#a27341', marginRight: '6px' }}></i>
                    GPS Geofence Location
                  </span>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    style={{
                      background: '#a27341',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className={locating ? 'fas fa-spinner fa-spin' : 'fas fa-location-arrow'}></i>
                    {locating ? 'Capturing...' : 'Use My Current Location'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <FloatingInput
                    id="site-lat"
                    label="Latitude *"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                    placeholder="e.g. 19.1982"
                  />
                  <FloatingInput
                    id="site-lng"
                    label="Longitude *"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                    placeholder="e.g. 73.0456"
                  />
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Allowed Geofence Radius: <strong>{formData.radiusMeters} meters</strong>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={formData.radiusMeters}
                    onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#a27341' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#64748b' }}>
                    <span>50m (Strict)</span>
                    <span>200m (Standard)</span>
                    <span>1000m (Large Campus)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="site-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#a27341' }}
                />
                <label htmlFor="site-active" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Site is currently active (Workers can punch here)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
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
                  {editingSite ? 'Save Changes' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        boldWord={confirmModal.boldWord}
        afterBold={confirmModal.afterBold}
        subtext={confirmModal.subtext}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
