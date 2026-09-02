'use client';
import { useState, useEffect } from 'react';
import CloseButton from '@/components/CloseButton';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

const roomCategories = [
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-hat-chef' },
  { id: 'pooja-room', name: 'Pooja Room', icon: 'fa-praying-hands' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'entryway', name: 'Entryway', icon: 'fa-door-open' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
  { id: 'outdoor', name: 'Outdoor', icon: 'fa-tree' },
  { id: 'decor', name: 'Decor', icon: 'fa-spa' },
];

const subCategories: Record<string, { id: string; name: string; icon: string }[]> = {
  'living-room': [
    { id: 'sofas', name: 'Sofas', icon: 'fa-couch' },
    { id: 'sofa-cum-beds', name: 'Sofa Cum Beds', icon: 'fa-bed' },
    { id: 'coffee-tables', name: 'Coffee Tables', icon: 'fa-mug-hot' },
    { id: 'tv-cabinets', name: 'TV Cabinets', icon: 'fa-tv' },
    { id: 'tv-unit', name: 'TV Unit', icon: 'fa-tv' },
    { id: 'recliners', name: 'Recliners', icon: 'fa-chair' },
    { id: 'bookshelves', name: 'Bookshelves', icon: 'fa-book' },
    { id: 'almirah', name: 'Almirah', icon: 'fa-door-open' },
    { id: 'mirrors', name: 'Mirrors', icon: 'fa-mirror' },
  ],
  bedroom: [
    { id: 'beds', name: 'Beds', icon: 'fa-bed' },
    { id: 'wardrobes', name: 'Wardrobes', icon: 'fa-door-open' },
    { id: 'mattresses', name: 'Mattresses', icon: 'fa-bed' },
    { id: 'bedside-tables', name: 'Bedside Tables', icon: 'fa-table' },
    { id: 'dressers', name: 'Dressers & Mirrors', icon: 'fa-mirror' },
    { id: 'bed-panelling', name: 'Bed Panelling', icon: 'fa-border-all' },
    { id: 'almirah', name: 'Almirah', icon: 'fa-door-open' },
    { id: 'mirrors', name: 'Mirrors', icon: 'fa-mirror' },
  ],
  'dining-room': [
    { id: 'dining-tables', name: 'Dining Tables', icon: 'fa-utensils' },
    { id: 'dining-table', name: 'Dining Table', icon: 'fa-utensils' },
    { id: 'dining-chairs', name: 'Dining Chairs', icon: 'fa-chair' },
    { id: 'bar-units', name: 'Bar Units', icon: 'fa-glass-martini-alt' },
    { id: 'bar-unit', name: 'Bar Unit', icon: 'fa-glass-martini-alt' },
    { id: 'crockery-units', name: 'Crockery Units', icon: 'fa-box' },
    { id: 'crockery-unit', name: 'Crockery Unit', icon: 'fa-box' },
  ],
  kitchen: [
    { id: 'kitchen-cabinets', name: 'Kitchen Cabinets', icon: 'fa-cabinet-filing' },
    { id: 'storage-units', name: 'Storage Units', icon: 'fa-archive' },
    { id: 'storage-solution', name: 'Storage Solution', icon: 'fa-archive' },
  ],
  'pooja-room': [
    { id: 'pooja-units', name: 'Pooja Units', icon: 'fa-praying-hands' },
    { id: 'pooja-unit', name: 'Pooja Unit', icon: 'fa-praying-hands' },
  ],
  office: [
    { id: 'office-tables', name: 'Office Tables', icon: 'fa-laptop' },
    { id: 'office-chairs', name: 'Office Chairs', icon: 'fa-chair' },
    { id: 'filing-cabinets', name: 'Filing Cabinets', icon: 'fa-folder' },
    { id: 'study-tables', name: 'Study Tables', icon: 'fa-book' },
    { id: 'bookshelves', name: 'Bookshelves', icon: 'fa-book' },
  ],
  entryway: [
    { id: 'shoe-racks', name: 'Shoe Racks', icon: 'fa-shoe-prints' },
    { id: 'shoe-rack', name: 'Shoe Rack', icon: 'fa-shoe-prints' },
    { id: 'console-tables', name: 'Console Tables', icon: 'fa-table' },
    { id: 'coat-racks', name: 'Coat Racks', icon: 'fa-tshirt' },
  ],
  'kids-room': [
    { id: 'kids-beds', name: 'Kids Beds', icon: 'fa-bed' },
    { id: 'study-desks', name: 'Study Desks', icon: 'fa-book' },
    { id: 'toy-storage', name: 'Toy Storage', icon: 'fa-box' },
    { id: 'kids-chairs', name: 'Kids Chairs', icon: 'fa-chair' },
  ],
  outdoor: [
    { id: 'garden-chairs', name: 'Garden Chairs', icon: 'fa-chair' },
    { id: 'balcony-sets', name: 'Balcony Sets', icon: 'fa-leaf' },
    { id: 'outdoor-tables', name: 'Outdoor Tables', icon: 'fa-table' },
    { id: 'swing-chairs', name: 'Swing Chairs', icon: 'fa-chair' },
  ],
  decor: [
    { id: 'mirrors', name: 'Mirrors', icon: 'fa-mirror' },
    { id: 'wall-shelves', name: 'Wall Shelves', icon: 'fa-border-all' },
    { id: 'home-decor', name: 'Home Decor', icon: 'fa-spa' },
    { id: 'plant-stands', name: 'Plant Stands', icon: 'fa-leaf' },
    { id: 'ceiling', name: 'Ceiling', icon: 'fa-home' },
    { id: 'door', name: 'Door', icon: 'fa-door-open' },
  ],
};

export default function GalleryPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | Design Gallery';
  }, []);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRoom, setActiveRoom] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Read category from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery?page=${currentPage}&category=${activeCategory}&room=${activeRoom}&_=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data.images)) {
          setImages(data.images);
          setTotalPages(data.totalPages || 0);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, activeCategory, activeRoom, mounted]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };


  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const sendWhatsApp = (url: string) => {
    openWhatsAppChat(`I'm interested in this design: ${url}`, {
      branch: 'mumbai',
      cta: 'gallery_enquire',
      source: 'gallery_page',
    });
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'design';
    link.click();
  };

  return (
    <div className="gallery-page" suppressHydrationWarning>
      <div className="gallery-page-hero">
        <CloseButton href="/" />
        <h1>Design <span>Gallery</span></h1>
        <p>Browse our collection of handcrafted furniture and interior design ideas for every room.</p>
      </div>

      <div className="gallery-page-body">
        {/* Room Pill Tabs */}
        <div className="gallery-pill-row">
          <button
            className={`gallery-pill-btn ${activeRoom === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveRoom('all'); handleCategoryChange('all'); }}
          >
            <i className="fas fa-th-large"></i>
            <span>All</span>
          </button>
          {roomCategories.map(room => (
            <button
              key={room.id}
              className={`gallery-pill-btn ${activeRoom === room.id ? 'active' : ''}`}
              onClick={() => { setActiveRoom(room.id); handleCategoryChange('all'); }}
            >
              <i className={`fas ${room.icon}`}></i>
              <span>{room.name}</span>
            </button>
          ))}
        </div>

        {/* Subcategory Pill Tabs */}
        {activeRoom && activeRoom !== 'all' && (
          <div className="gallery-sub-pill-row">
            <button
              className={`gallery-sub-pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All in {roomCategories.find(r => r.id === activeRoom)?.name || 'Room'}
            </button>
            {subCategories[activeRoom]?.map(sub => (
              <button
                key={sub.id}
                className={`gallery-sub-pill-btn ${activeCategory === sub.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(sub.id)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Images Grid */}
        {loading ? (
          <div className="gallery-page-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gallery-skeleton">
                <div className="gallery-skeleton-img">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="gallery-skeleton-content">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line subtitle"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !mounted || images.length === 0 ? (
          <div className="gallery-page-empty">
            <i className="fas fa-images"></i>
            <p>No designs in this category yet.</p>
          </div>
        ) : (
          <div className="gallery-page-grid">
            {images.map((img, index) => (
              <div
                key={img._id}
                className="gallery-page-item"
                onClick={() => openLightbox(index)}
              >
                <img src={img.url} alt={img.category} loading="lazy" decoding="async" />
                <div className="gallery-page-item-overlay">
                  <div className="gpo-actions">
                    <button
                      className="gpo-btn"
                      onClick={(e) => { e.stopPropagation(); downloadImage(img.url); }}
                      title="Download"
                    >
                      <i className="fas fa-expand"></i>
                    </button>
                    <button
                      className="gpo-btn gpo-wa"
                      onClick={(e) => { e.stopPropagation(); sendWhatsApp(img.url); }}
                      title="Enquire on WhatsApp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images[currentIndex] && (
        <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <span className="gallery-lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</span>
          <button className="gallery-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
          <img
            src={images[currentIndex].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
          />
          <button className="gallery-lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
          <div className="gallery-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <a href={images[currentIndex].url} download className="gallery-lightbox-dl">
              <i className="fas fa-download"></i> Download
            </a>
            <button className="gallery-lightbox-wa" onClick={() => sendWhatsApp(images[currentIndex].url)}>
              <i className="fab fa-whatsapp"></i> Enquire on WhatsApp
            </button>
          </div>
          <div className="gallery-lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
