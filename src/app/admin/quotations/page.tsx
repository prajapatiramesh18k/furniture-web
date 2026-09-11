'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
                    <button 
                      onClick={() => alert(`Details for Quote: ${q.project.quoteNo}\n\nCustomer: ${q.customer.name}\nEmail: ${q.customer.email}\nAddress: ${q.customer.address}\n\nItems: ${q.items.length}\nSubtotal: ₹${q.totals.subtotal}\nGST: ₹${q.totals.gst}\nGrand Total: ₹${q.totals.total}`)}
                      style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
