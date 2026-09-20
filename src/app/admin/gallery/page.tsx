import Link from 'next/link';

export const metadata = {
  title: 'Design Gallery',
  robots: { index: false, follow: false },
};

const CATEGORIES: { slug: string; name: string }[] = [
  { slug: 'pooja-unit', name: 'Pooja Unit' },
  { slug: 'tv-unit', name: 'TV Unit' },
  { slug: 'bed-panelling', name: 'Bed Panelling' },
  { slug: 'dining-table', name: 'Dining Table' },
  { slug: 'bar-unit', name: 'Bar Unit' },
  { slug: 'almirah', name: 'Almirah' },
  { slug: 'crockery-unit', name: 'Crockery Unit' },
  { slug: 'shoe-rack', name: 'Shoe Rack' },
  { slug: 'ceiling', name: 'Ceiling' },
  { slug: 'door', name: 'Door' },
  { slug: 'office', name: 'Office' },
  { slug: 'living-room', name: 'Living Room' },
  { slug: 'bedroom', name: 'Bedroom' },
  { slug: 'dining-room', name: 'Dining Room' },
  { slug: 'kitchen', name: 'Kitchen' },
  { slug: 'entryway', name: 'Entryway' },
  { slug: 'kids-room', name: 'Kids Room' },
];

export default function AdminGalleryIndex() {
  return (
    <div>
      <div className="ahf-pagehead">
        <div>
          <p>{CATEGORIES.length} categories</p>
          <h2>Design Gallery</h2>
        </div>
      </div>
      <div className="ahf-panel">
        <div className="ahf-panel-head">
          <div>
            <h3>Categories</h3>
            <p>Pick a category to upload and manage images</p>
          </div>
        </div>
        <div className="ahf-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/admin/gallery/${c.slug}`}
                className="ahf-btn ahf-btn-ghost"
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fas fa-images"></i> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
