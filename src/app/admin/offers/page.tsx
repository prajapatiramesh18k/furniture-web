'use client';

import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface P { _id: string; name: string; image: string; price: number; originalPrice: number; category: string }

export default function AdminOffers() {
  const { data, loading } = useAdminFetch<{ products: P[] }>('/api/admin/products');
  const deals = (data?.products || [])
    .filter((p) => Number(p.originalPrice) > Number(p.price))
    .map((p) => ({ ...p, off: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) }))
    .sort((a, b) => b.off - a.off);

  return (
    <ModuleShell title="Offers & Discounts" sub={`${deals.length} products currently discounted (set via Original Price)`}>
      <div className="ahf-panel">
        <div className="ahf-panel-head">
          <div><h3>Active Discounts</h3><p>To change an offer, edit the product&apos;s price vs original price</p></div>
        </div>
        {loading ? <LoadingList /> : (
          <DataTable
            columns={[
              { key: 'p', header: 'Product', render: (p) => (
                <div className="ahf-prod-cell"><img src={p.image} alt={p.name} /><strong>{p.name}</strong></div>) },
              { key: 'c', header: 'Category', render: (p) => <span style={{ textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</span> },
              { key: 'mrp', header: 'MRP', render: (p) => <span style={{ textDecoration: 'line-through', color: 'var(--ahf-muted)' }}>₹{Number(p.originalPrice).toLocaleString('en-IN')}</span> },
              { key: 'sp', header: 'Offer Price', render: (p) => <span className="ahf-amt">₹{Number(p.price).toLocaleString('en-IN')}</span> },
              { key: 'off', header: 'Discount', render: (p) => <StatusBadge status={`${p.off}% OFF`} /> },
            ]}
            rows={deals}
            emptyText="No discounted products right now."
          />
        )}
      </div>
    </ModuleShell>
  );
}
