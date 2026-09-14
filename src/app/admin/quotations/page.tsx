'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

type LineItem = { name: string; material: string; height: number; width: number; quantity: number; rate: number };

type QuotationDoc = {
  _id: string;
  customer: { name: string; phone: string; email: string; address: string; branch: string };
  project: { type: string; quoteNo: string; date: string; validTill: string };
  items: LineItem[];
  totals: { subtotal: number; gst: number; total: number };
  createdAt: string;
};

export default function AdminQuotations() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState<QuotationDoc | null>(null);
  const [viewing, setViewing] = useState<QuotationDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Ananya Furniture | Quotation History';
    
    fetch('/api/quotations')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setQuotations(data.quotations);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotations?id=${pendingDelete._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete quotation');
      setQuotations((list) => list.filter((q) => q._id !== pendingDelete._id));
      flash(`Quotation ${pendingDelete.project.quoteNo} deleted.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete quotation');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i> Loading Quotations...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle"></i> {error}
        <br />
        <button onClick={() => router.push('/login')} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {toast && (
        <div className="admin-toast" style={{ position: 'fixed' }}>
          <i className="fas fa-check-circle"></i> {toast}
        </div>
      )}
      <h1 style={{ fontSize: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className="fas fa-file-invoice-dollar"></i> Quotation History
      </h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        A complete history of all generated quotations across all branches.
      </p>

      {quotations.length === 0 ? (
        <div style={{ padding: '40px', background: '#f9f9f9', textAlign: 'center', borderRadius: '8px' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '40px', color: '#ccc', marginBottom: '10px' }}></i>
          <p>No quotations found yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <thead>
              <tr style={{ background: '#a27341', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>Quote No</th>
                <th style={{ padding: '15px' }}>Customer Name</th>
                <th style={{ padding: '15px' }}>Phone</th>
                <th style={{ padding: '15px' }}>Project Type</th>
                <th style={{ padding: '15px' }}>Grand Total</th>
                <th style={{ padding: '15px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{q.project.quoteNo}</td>
                  <td style={{ padding: '15px' }}>{q.customer.name || 'N/A'}</td>
                  <td style={{ padding: '15px' }}>
                    {q.customer.phone ? (
                      <a href={`tel:${q.customer.phone}`} style={{ color: '#a27341', textDecoration: 'none' }}>
                        {q.customer.phone}
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td style={{ padding: '15px' }}>{q.project.type || 'Custom'}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>
                    ₹{q.totals.total.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setViewing(q)}
                        style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button
                        onClick={() => setPendingDelete(q)}
                        style={{ background: '#fdeaea', border: '1px solid #f3c1c1', color: '#b3273a', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!pendingDelete}
        message={pendingDelete ? `Delete quotation ${pendingDelete.project.quoteNo} for ${pendingDelete.customer.name || 'this customer'}? This cannot be undone.` : ''}
        confirmText={deleting ? 'Deleting…' : 'Yes, Delete'}
        confirmButtonVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setPendingDelete(null)}
      />

      {viewing && (
        <div
          onClick={() => setViewing(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(62,42,18,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 'min(620px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(62,42,18,.35)' }}
          >
            <div style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', padding: '18px 22px', borderRadius: '16px 16px 0 0' }}>
              <div style={{ fontSize: 12, opacity: 0.85 }}>QUOTATION</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{viewing.project.quoteNo}</div>
              <div style={{ fontSize: 12.5, opacity: 0.9 }}>
                {new Date(viewing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                {viewing.project.validTill ? ` · Valid till ${viewing.project.validTill}` : ''}
              </div>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#faf7f1', border: '1px solid #e7dbc4', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8a7a66', marginBottom: 4 }}>CUSTOMER</div>
                  <div style={{ fontWeight: 700 }}>{viewing.customer.name || 'N/A'}</div>
                  <div style={{ fontSize: 13 }}>{viewing.customer.phone || ''}</div>
                  <div style={{ fontSize: 13, color: '#8a7a66' }}>{viewing.customer.email || ''}</div>
                  <div style={{ fontSize: 13, color: '#8a7a66' }}>{viewing.customer.address || ''}</div>
                </div>
                <div style={{ background: '#faf7f1', border: '1px solid #e7dbc4', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8a7a66', marginBottom: 4 }}>PROJECT</div>
                  <div style={{ fontWeight: 700 }}>{viewing.project.type || 'Custom'}</div>
                  <div style={{ fontSize: 13, color: '#8a7a66' }}>{viewing.customer.branch || ''}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    <span style={{ background: '#f1e4cb', color: '#7a5327', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>
                      {viewing.items.length} item{viewing.items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e7dbc4', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#faf5ec', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Item</th>
                      <th style={{ padding: '10px 12px' }}>Material</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.items.map((it, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #f0e7d4' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '10px 12px', color: '#8a7a66' }}>{it.material || '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{it.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{Number(it.rate).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a7a66' }}>
                  <span>Subtotal</span><span>₹{Number(viewing.totals.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a7a66' }}>
                  <span>GST</span><span>₹{Number(viewing.totals.gst).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, borderTop: '1px solid #e7dbc4', paddingTop: 8 }}>
                  <span>Grand Total</span><span>₹{Number(viewing.totals.total).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => { setPendingDelete(viewing); setViewing(null); }}
                  style={{ background: '#fdeaea', border: '1px solid #f3c1c1', color: '#b3273a', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
                <button
                  onClick={() => setViewing(null)}
                  style={{ background: 'linear-gradient(135deg,#a27341 0%,#8a5f32 100%)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
