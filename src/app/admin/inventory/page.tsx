'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface P { _id: string; name: string; image: string; category: string; price: number; stock?: number; sku?: string }

export default function AdminInventory() {
  const { data, loading } = useAdminFetch<{ products: P[] }>('/api/admin/products');
  const [f, setF] = useState('all');
  const rows = useMemo(() => {
    const list = (data?.products || []).map((p) => ({ ...p, stock: p.stock ?? 10 }));
    if (f === 'low') return list.filter((p) => p.stock > 0 && p.stock <= 5);
    if (f === 'out') return list.filter((p) => p.stock <= 0);
    return list;
  }, [data, f]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [f]);
  const low = (data?.products || []).filter((p) => (p.stock ?? 10) <= 5).length;

  const label = (s: number) => (s <= 0 ? 'Out of Stock' : s <= 5 ? 'Low Stock' : 'In Stock');

  return (
    <ModuleShell title="Inventory" sub={`${low} item(s) at or below low-stock level`}>
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Stock level filter"
              value={f}
              options={[
                { value: 'all', label: 'All Stock Levels' },
                { value: 'low', label: 'Low Stock (1–5)' },
                { value: 'out', label: 'Out of Stock (0)' },
              ]}
              onChange={setF}
            />
          </div>
        </div>
      </div>
      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head"><div><h3>Stock Levels</h3><p>Edit stock from the Products page</p></div></div>
        <DataTable
            columns={[
              { key: 'p', header: 'Product', render: (p) => (
                <div className="ahf-prod-cell"><img src={p.image} alt={p.name} />
                <div><strong>{p.name}</strong><div style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>SKU: {p.sku || '—'}</div></div></div>) },
              { key: 'c', header: 'Category', render: (p) => <span style={{ textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</span> },
              { key: 's', header: 'Qty', render: (p) => <strong>{p.stock}</strong> },
              { key: 'st', header: 'Status', render: (p) => <StatusBadge status={label(p.stock)} /> },
            ]}
            rows={paged}
            emptyText="No items at this stock level."
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
