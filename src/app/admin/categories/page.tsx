'use client';

import Link from 'next/link';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface P { category: string; name: string; price: number; image: string }

const ICONS: Record<string, string> = {
  bedroom: 'fa-bed', 'living-room': 'fa-couch', 'dining-room': 'fa-utensils', kitchen: 'fa-hat-chef',
  office: 'fa-briefcase', entryway: 'fa-door-open', 'kids-room': 'fa-child', 'pooja-room': 'fa-hands-praying',
  outdoor: 'fa-tree', decor: 'fa-spa',
};

export default function AdminCategories() {
  const { data, loading } = useAdminFetch<{ products: P[] }>('/api/admin/products');
  const groups: Record<string, P[]> = {};
  for (const p of data?.products || []) {
    const c = p.category || 'uncategorized';
    (groups[c] = groups[c] || []).push(p);
  }
  const entries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

  return (
    <ModuleShell
      title="Categories"
      sub={`${entries.length} live categories from your catalog`}
      action={<Link href="/admin/products" className="ahf-btn ahf-btn-primary"><i className="fas fa-plus"></i> Add Product</Link>}
    >
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>All Categories</h3><p>Derived from real product data — no manual sync needed</p></div></div>
        {loading ? <LoadingList rows={6} /> : (
          <div className="ahf-panel-body">
            <div className="ahf-pgrid">
              {entries.map(([cat, items]) => (
                <div className="ahf-pcard" key={cat}>
                  <div className="ahf-panel-body" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="ahf-stat-ic"><i className={`fas ${ICONS[cat] || 'fa-tag'}`}></i></span>
                    <div>
                      <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</div>
                      <div style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>{items.length} product{items.length === 1 ? '' : 's'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && <p style={{ color: 'var(--ahf-muted)' }}>No categories yet — add products to create them.</p>}
            </div>
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
