'use client';
import { useState, useEffect } from 'react';

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

const fallbackImages: GalleryImage[] = [
  { _id: '1', category: 'living-room', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', isUploaded: false },
  { _id: '2', category: 'bedroom', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', isUploaded: false },
  { _id: '3', category: 'kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', isUploaded: false },
  { _id: '4', category: 'tv-unit', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', isUploaded: false },
  { _id: '5', category: 'dining-room', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', isUploaded: false },
  { _id: '6', category: 'office', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', isUploaded: false },
  { _id: '7', category: 'pooja-unit', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', isUploaded: false },
  { _id: '8', category: 'bar-unit', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', isUploaded: false },
  { _id: '9', category: 'ceiling', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isUploaded: false },
  { _id: '10', category: 'bed-panelling', url: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800', isUploaded: false },
  { _id: '11', category: 'shoe-rack', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', isUploaded: false },
  { _id: '12', category: 'kids-room', url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', isUploaded: false },
  { _id: '13', category: 'almirah', url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800', isUploaded: false },
  { _id: '14', category: 'dining-table', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', isUploaded: false },
  { _id: '15', category: 'crockery-unit', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', isUploaded: false },
  { _id: '16', category: 'door', url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800', isUploaded: false },
  { _id: '17', category: 'entryway', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', isUploaded: false },
  { _id: '18', category: 'living-room', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', isUploaded: false },
  { _id: '19', category: 'bedroom', url: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800', isUploaded: false },
  { _id: '20', category: 'kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', isUploaded: false },
];

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

export default function GalleryPage() {
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/api/gallery', { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllImages(data);
        } else {
          setAllImages(fallbackImages);
        }
      } catch {
        setAllImages(fallbackImages);
      }
    };
    fetchData();
  }, []);

  const filteredImages = activeCategory === 'all'
    ? allImages
    : allImages.filter(img => img.category === activeCategory);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
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
    <div className="gallery-page">
      <button className="sr-back gallery-page-back" onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <div className="gallery-page-hero">
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
              onClick={() => setActiveCategory(cat.id)}
            >
              <i className={`fas ${cat.icon}`}></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="gallery-page-empty">
            <i className="fas fa-images"></i>
            <p>No designs in this category yet.</p>
          </div>
        ) : (
          <div className="gallery-page-grid">
            {filteredImages.map((img, index) => (
              <div
                key={img._id}
                className="gallery-page-item"
                onClick={() => openLightbox(index)}
              >
                <img src={img.url} alt={img.category} loading="lazy" />
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
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <span className="gallery-lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</span>
          <button className="gallery-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
          <img
            src={filteredImages[currentIndex].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
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
