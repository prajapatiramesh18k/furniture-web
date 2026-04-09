'use client';
import Link from 'next/link';

const featuredImages = [
  { id: '1', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', category: 'Living Room', alt: 'Luxurious living room interior' },
  { id: '2', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', category: 'Bedroom', alt: 'Elegant bedroom design' },
  { id: '3', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', category: 'Kitchen', alt: 'Modern kitchen interior' },
  { id: '4', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', category: 'TV Unit', alt: 'Designer TV unit' },
  { id: '5', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', category: 'Dining Room', alt: 'Beautiful dining room' },
  { id: '6', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', category: 'Pooja Unit', alt: 'Traditional pooja unit' },
];

export default function FeaturedGallery() {
  return (
    <section className="featured-gallery">
      <h1 className="heading">our <span>design gallery</span></h1>
      <div className="featured-gallery-grid">
        {featuredImages.map((img) => (
          <div key={img.id} className="fg-card">
            <div className="fg-card-img">
              <img src={img.url} alt={img.alt} />
              <div className="fg-card-overlay">
                <span className="fg-category">{img.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fg-view-all">
        <Link href="/gallery" className="btn">
          <i className="fas fa-images"></i> View All Designs
        </Link>
      </div>
    </section>
  );
}
