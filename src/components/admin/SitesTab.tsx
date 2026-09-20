'use client';

import { useState, useEffect } from 'react';
import FloatingInput from './FloatingInput';
import ConfirmationModal from './ConfirmationModal';
import DeleteButton from './DeleteButton';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';
import { AdminToast, AdminModal, AdminModalFooter } from '@/components/admin/AdminUI';

interface Site {
  _id: string;
  name: string;
  clientName?: string;
  address: string;
  location?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
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
      latitude: site.location?.latitude != null ? String(site.location.latitude) : '',
      longitude: site.location?.longitude != null ? String(site.location.longitude) : '',
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

  const { page, totalPages, paged, setPage, pageSize } = usePagination(filteredSites, 10, [search]);

  return (
    <ModuleShell
      title="Job Sites"
      sub=""
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search sites" />
          </div>
        </div>
      )}
    >
      <AdminToast message={toast?.message || ''} tone={toast?.type} />

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#8a7a66' }}>
              {filteredSites.length} site{filteredSites.length === 1 ? '' : 's'}
            </span>
            <button
              className="ahf-btn ahf-btn-primary ahf-btn-sm"
              onClick={handleOpenAdd}
              title="Add New Job Site"
              style={{ marginLeft: 'auto' }}
            >
              <i className="fas fa-plus"></i> Create
            </button>
          </div>
        </div>
      </div>

      {/* Sites List Table */}
      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div><h3>Sites ({filteredSites.length})</h3></div>
        </div>
        {loading && sites.length === 0 ? <LoadingList /> : (
          <DataTable
            columns={[
              {
                key: 'n', header: 'Site / Project Name', render: (site) => (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{site.name}</div>
                    {site.clientName && (
                      <div style={{ fontSize: 11.5, color: '#8a7a66' }}>Client: {site.clientName}</div>
                    )}
                  </div>
                ),
              },
              { key: 'a', header: 'Address', render: (site) => <span style={{ fontSize: 12.5 }}>{site.address}</span> },
              {
                key: 'g', header: 'GPS Location', render: (site) => (
                  site.location?.latitude != null && site.location?.longitude != null ? (
                    <a
                      href={`https://www.google.com/maps?q=${site.location.latitude},${site.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#8a5f32', fontWeight: 600, fontSize: 12.5 }}
                    >
                      <i className="fas fa-map-marker-alt"></i>{' '}
                      {Number(site.location.latitude).toFixed(4)}, {Number(site.location.longitude).toFixed(4)}
                    </a>
                  ) : (
                    <span style={{ fontSize: 12.5, color: '#8a7a66' }}><i className="fas fa-map-marker-alt"></i> No GPS set</span>
                  )
                ),
              },
              { key: 'r', header: 'Allowed Radius', render: (site) => <span style={{ fontSize: 12.5 }}>{site.radiusMeters || 200} meters</span> },
              { key: 's', header: 'Status', render: (site) => <StatusBadge status={site.isActive ? 'Active' : 'Inactive'} /> },
              {
                key: 'act', header: 'Action', render: (site) => (
                  <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button className="ahf-mini-btn" title="Edit Site" onClick={() => handleOpenEdit(site)}>
                      <i className="fas fa-pen"></i>
                    </button>
                    <DeleteButton
                      size={32}
                      iconSize={16}
                      onClick={() => handleDelete(site._id, site.name)}
                      title="Delete Site"
                    />
                  </div>
                ),
              },
            ]}
            rows={paged}
            emptyText={search ? `No job sites found matching "${search}"` : 'No job sites yet.'}
            onRowClick={handleOpenEdit}
          />
        )}
        {!(loading && sites.length === 0) && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={filteredSites.length} onPage={setPage} />
        )}
      </div>

      {/* Add / Edit Site Modal */}
      {modalOpen && (
        <AdminModal
          eyebrow={editingSite ? 'EDIT SITE' : 'NEW SITE'}
          title={editingSite ? 'Edit Job Site' : 'Add New Job Site'}
          subtitle="GPS geofence controls where workers can punch in"
          onClose={() => setModalOpen(false)}
          width={560}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
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
              <div style={{ background: '#faf7ef', border: '1px solid #eee3cd', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    <i className="fas fa-crosshairs" style={{ color: '#a27341', marginRight: 6 }}></i>
                    GPS Geofence Location
                  </span>
                  <button
                    type="button"
                    className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                  >
                    <i className={locating ? 'fas fa-spinner fa-spin' : 'fas fa-location-arrow'}></i>
                    {locating ? 'Capturing…' : 'Use My Current Location'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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

                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#8a7a66' }}>
                    <span>50m (Strict)</span>
                    <span>200m (Standard)</span>
                    <span>1000m (Large Campus)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="site-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#a27341' }}
                />
                <label htmlFor="site-active" style={{ fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                  Site is currently active (Workers can punch here)
                </label>
              </div>
            </div>
            <AdminModalFooter>
              <button type="button" className="ahf-btn ahf-btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="ahf-btn ahf-btn-primary">
                <i className="fas fa-check"></i> {editingSite ? 'Save Changes' : 'Create Site'}
              </button>
            </AdminModalFooter>
          </form>
        </AdminModal>
      )}

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
    </ModuleShell>
  );
}
