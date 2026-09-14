'use client';

import Link from 'next/link';
import { ModuleShell, useAdminFetch, LoadingList } from '@/components/admin/ModuleBits';

interface P { category: string; name: string; price: number; image: string }

const ROOMS = [
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-hat-chef' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'pooja-room', name: 'Pooja Room', icon: 'fa-hands-praying' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
  { id: 'outdoor', name: 'Outdoor', icon: 'fa-tree' },
];

export default function AdminCollections() {
  const { data, loading } = useAdminFetch<{ products: P[] }>('/api/admin/products');
  const countFor = (room: string) =>
    (data?.products || []).filter((p) => p.category === room || p.category.startsWith(room)).length;

  return (
    <ModuleShell title="Furniture Collections" sub="Room-wise curated collections from your live catalog">
      <div className="ahf-panel">
        <div className="ahf-panel-head"><div><h3>Collections</h3><p>Counts update automatically as you add products</p></div></div>
        {loading ? <LoadingList rows={4} /> : (
          <div className="ahf-panel-body">
            <div className="ahf-pgrid">
              {ROOMS.map((r) => (
                <Link key={r.id} href={`/admin/products`} className="ahf-pcard" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="ahf-panel-body" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="ahf-stat-ic"><i className={`fas ${r.icon}`}></i></span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>{countFor(r.id)} products</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
