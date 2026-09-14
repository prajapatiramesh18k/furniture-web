'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';
import ConfirmationModal from '@/components/ConfirmationModal';

interface R { _id: string; name: string; location: string; rating: number; text: string; date: string; approved: boolean }

export default function AdminReviews() {
  const { data, loading, refresh } = useAdminFetch<{ reviews: R[] } | R[]>('/api/admin/reviews');
  const [filter, setFilter] = useState('pending');
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);
  const [toast, setToast] = useState('');

  const reviews: R[] = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.reviews || [];
    if (filter === 'pending') return list.filter((r) => !r.approved);
    if (filter === 'approved') return list.filter((r) => r.approved);
    return list;
  }, [data, filter]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const approve = async (id: string) => {
    await fetch('/api/admin/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved: true }) });
    refresh(); flash('Review approved!');
  };

  const remove = (id: string) => {
    setConfirm({
      msg: 'Delete this review permanently?',
      action: async () => {
        await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
        refresh(); flash('Review deleted.');
      },
    });
  };

  return (
    <ModuleShell title="Reviews" sub="Moderate customer feedback from your website">
      {toast && <div className="admin-toast" style={{ position: 'fixed' }}><i className="fas fa-check-circle"></i> {toast}</div>}
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div className="ahf-toolbar" style={{ marginBottom: 0 }}>
            {(['pending', 'approved', 'all'] as const).map((f) => (
              <button key={f} className={`ahf-btn ${filter === f ? 'ahf-btn-primary' : 'ahf-btn-ghost'} ahf-btn-sm`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>{filter.charAt(0).toUpperCase() + filter.slice(1)} Reviews ({reviews.length})</h3></div></div>
        {loading ? <LoadingList /> : reviews.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--ahf-muted)' }}>Nothing here — all caught up!</p>
        ) : (
          <div className="ahf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r._id} className="ahf-panel" style={{ boxShadow: 'none' }}>
                <div className="ahf-panel-body">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="ahf-avatar">{(r.name || '?')[0].toUpperCase()}</span>
                    <strong>{r.name}</strong>
                    <span style={{ color: 'var(--ahf-muted)', fontSize: 12 }}>{r.location} · {r.date}</span>
                    <span style={{ color: '#d9930d' }}>{'★'.repeat(Math.round(r.rating || 0))}</span>
                    <span style={{ marginLeft: 'auto' }}><StatusBadge status={r.approved ? 'Approved' : 'Pending'} /></span>
                  </div>
                  <p style={{ fontSize: 13.5, margin: '0 0 12px' }}>“{r.text}”</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!r.approved && <button className="ahf-btn ahf-btn-primary ahf-btn-sm" onClick={() => approve(r._id)}><i className="fas fa-check"></i> Approve</button>}
                    <button className="ahf-btn ahf-btn-ghost ahf-btn-sm" onClick={() => remove(r._id)}><i className="fas fa-trash"></i> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!confirm}
        message={confirm?.msg || ''}
        confirmText="Yes, Delete"
        confirmButtonVariant="danger"
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </ModuleShell>
  );
}
