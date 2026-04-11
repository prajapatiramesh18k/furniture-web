'use client';
import { useState, useEffect } from 'react';
import CloseButton from '@/components/CloseButton';

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

const allCategories = [
  { id: 'all', name: 'All', icon: 'fa-th-large' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-utensil-spoon' },
  { id: 'tv-unit', name: 'TV Unit', icon: 'fa-tv' },
  { id: 'pooja-unit', name: 'Pooja Unit', icon: 'fa-praying-hands' },
  { id: 'bed-panelling', name: 'Bed Panelling', icon: 'fa-border-all' },
  { id: 'dining-table', name: 'Dining Table', icon: 'fa-utensils' },
  { id: 'bar-unit', name: 'Bar Unit', icon: 'fa-glass-martini-alt' },
  { id: 'almirah', name: 'Almirah', icon: 'fa-door-open' },
  { id: 'crockery-unit', name: 'Crockery Unit', icon: 'fa-box' },
  { id: 'shoe-rack', name: 'Shoe Rack', icon: 'fa-shoe-prints' },
  { id: 'ceiling', name: 'Ceiling', icon: 'fa-home' },
  { id: 'door', name: 'Door', icon: 'fa-door-open' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'entryway', name: 'Entryway', icon: 'fa-door-open' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
];

const IMAGES_PER_PAGE = 12;

export default function GalleryPage() {
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllImages(data);
        } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          setAllImages(data.images);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredImages = activeCategory === 'all'
    ? allImages
    : allImages.filter(img => img.category === activeCategory);

  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + IMAGES_PER_PAGE);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Reset to page 1 when category changes
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const sendWhatsApp = (url: string) => {
    const message = encodeURIComponent(`I'm interested in this design: ${url}`);
    window.open(`https://wa.me/919321812823?text=${message}`, '_blank');
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
        {/* Category Filters */}
        <div className="gallery-page-filters">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              className={`gallery-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <i className={`fas ${cat.icon}`}></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Images Grid */}
        {!mounted ? (
          <div className="gallery-loading">Loading...</div>
        ) : loading ? (
          <div className="gallery-loading">Loading...</div>
        ) : filteredImages.length === 0 ? (
          <div className="gallery-page-empty">
            <i className="fas fa-images"></i>
            <p>No designs in this category yet.</p>
          </div>
        ) : (
          <div className="gallery-page-grid">
            {paginatedImages.map((img, index) => (
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
      {lightboxOpen && filteredImages[currentIndex] && (
        <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <span className="gallery-lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</span>
          <button className="gallery-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
          <img
            src={filteredImages[currentIndex].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
          />
          <button className="gallery-lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
          <div className="gallery-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <a href={filteredImages[currentIndex].url} download className="gallery-lightbox-dl">
              <i className="fas fa-download"></i> Download
            </a>
            <button className="gallery-lightbox-wa" onClick={() => sendWhatsApp(filteredImages[currentIndex].url)}>
              <i className="fab fa-whatsapp"></i> Enquire on WhatsApp
            </button>
          </div>
          <div className="gallery-lightbox-counter">
            {currentIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
