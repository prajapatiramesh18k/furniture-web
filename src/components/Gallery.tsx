'use client';
import { useState, useEffect } from 'react';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

const fallbackImages: GalleryImage[] = [
  { _id: '1', category: 'living-room', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600', isUploaded: false },
  { _id: '2', category: 'bedroom', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600', isUploaded: false },
  { _id: '3', category: 'kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', isUploaded: false },
  { _id: '4', category: 'tv-unit', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600', isUploaded: false },
  { _id: '6', category: 'office', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', isUploaded: false },
  { _id: '7', category: 'pooja-unit', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600', isUploaded: false },
  { _id: '8', category: 'bar-unit', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', isUploaded: false },
  { _id: '9', category: 'ceiling', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600', isUploaded: false },
  { _id: '10', category: 'bed-panelling', url: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600', isUploaded: false },
  { _id: '11', category: 'shoe-rack', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600', isUploaded: false },
  { _id: '12', category: 'kids-room', url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600', isUploaded: false },
  { _id: '13', category: 'almirah', url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600', isUploaded: false },
  { _id: '14', category: 'dining-table', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600', isUploaded: false },
  { _id: '15', category: 'crockery-unit', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', isUploaded: false },
  { _id: '16', category: 'door', url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600', isUploaded: false },
  { _id: '17', category: 'entryway', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', isUploaded: false },
];

const allCategories = [
  { id: 'all', name: 'All', icon: 'fa-th-large' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
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

const mainCategories = [
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
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

export default function Gallery() {
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupCategory, setPopupCategory] = useState('all');
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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

  useEffect(() => {
    if (popupCategory === 'all') {
      setFilteredImages(allImages);
    } else {
      setFilteredImages(allImages.filter(img => img.category === popupCategory));
    }
  }, [popupCategory, allImages]);

  const openModal = (categoryId: string) => {
    setPopupCategory(categoryId);
    setPopupOpen(true);
  };

  const closeModal = () => {
    setPopupOpen(false);
    setPopupCategory('all');
    setFilteredImages([]);
  };

  const openLightbox = (url: string) => {
    setCurrentImage(url);
    setCurrentIndex(filteredImages.findIndex(img => img.url === url));
    setLightboxOpen(true);
  };

  const uploadImage = async (file: File, category: string) => {
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, url: reader.result }),
        });
        // Refresh images
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllImages(data);
        } else {
          setAllImages([...allImages, { _id: Date.now().toString(), category, url: reader.result as string, isUploaded: true }]);
        }
        setUploadProgress('Upload complete!');
        setTimeout(() => setUploadProgress(''), 2000);
      } catch {
        setUploadProgress('Upload failed');
        setTimeout(() => setUploadProgress(''), 2000);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      uploadImage(files[i], popupCategory);
    }
    e.target.value = '';
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'image';
    link.click();
  };

  const sendWhatsApp = (url: string) => {
    openWhatsAppChat(`I'm interested in this design: ${url}`, {
      branch: 'mumbai',
      cta: 'gallery_enquire',
      source: 'gallery',
    });
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setCurrentImage(filteredImages[newIndex].url);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(newIndex);
    setCurrentImage(filteredImages[newIndex].url);
  };

  const getCategoryName = (id: string) => allCategories.find(c => c.id === id)?.name || id;
  const getCategoryIcon = (id: string) => allCategories.find(c => c.id === id)?.icon || 'fa-folder';
  const getCategoryCount = (id: string) =>
    id === 'all' ? allImages.length : allImages.filter(img => img.category === id).length;

  return (
    <section className="gallery" id="gallery">
      <h1 className="heading"><span>Design</span> Gallery</h1>

      {/* Category Grid - main page */}
      <div className="gallery-category-grid">
        {mainCategories.map(cat => (
          <div
            key={cat.id}
            className="gallery-cat-card"
            onClick={() => openModal(cat.id)}
          >
            <i className={`fas ${cat.icon}`}></i>
            <h3>{cat.name}</h3>
            <span className="gallery-cat-count">
              {getCategoryCount(cat.id)} designs
            </span>
            <span className="btn" style={{ fontSize: '1.2rem', padding: '0.6rem 1.4rem', marginTop: '0.5rem' }}>
              View Designs
            </span>
          </div>
        ))}
      </div>

      {/* Full Gallery Popup */}
      {popupOpen && (
        <div className="gallery-popup" onClick={closeModal}>
          <div className="gallery-popup-content" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="gallery-popup-header">
              <h2>
                <i className={`fas ${getCategoryIcon(popupCategory)}`}></i>
                {getCategoryName(popupCategory)} Designs
                <span style={{ fontSize: '1.4rem', fontWeight: 'normal', marginLeft: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                  ({filteredImages.length})
                </span>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label className="btn" style={{ background: 'var(--primary-color)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontSize: '1.3rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
                  <i className="fas fa-upload"></i> {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploadProgress && (
                  <span style={{ color: '#fff', fontSize: '1.2rem' }}>{uploadProgress}</span>
                )}
                <button className="gallery-popup-close" onClick={closeModal}>&times;</button>
              </div>
            </div>

            {/* Body: Sidebar + Images */}
            <div className="gallery-popup-body">
              {/* Sidebar */}
              <div className="gallery-popup-sidebar">
                {allCategories.map(cat => (
                  <div
                    key={cat.id}
                    className={`gallery-popup-sidebar-item ${popupCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setPopupCategory(cat.id)}
                  >
                    <i className={`fas ${cat.icon}`}></i>
                    <span>{cat.name}</span>
                    <span className="gallery-popup-sidebar-count">{getCategoryCount(cat.id)}</span>
                  </div>
                ))}
              </div>

              {/* Images Grid */}
              {filteredImages.length === 0 ? (
                <div className="gallery-popup-empty">
                  <i className="fas fa-images" style={{ fontSize: '5rem' }}></i>
                  <p>No images in this category yet.</p>
                  <label className="btn" style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', fontSize: '1.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
                    <i className="fas fa-upload"></i> Upload First Image
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              ) : (
                <div className="gallery-popup-images">
                  {filteredImages.map((img) => (
                    <div key={img._id} className="gallery-popup-item" onClick={() => openLightbox(img.url)}>
                      <img src={img.url} alt={img.category} />
                      <div className="gallery-popup-img-badge">{getCategoryName(img.category)}</div>
                      <div className="gallery-popup-overlay">
                        <button
                          className="gallery-popup-btn"
                          onClick={(e) => { e.stopPropagation(); downloadImage(img.url); }}
                          title="Download"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button
                          className="gallery-popup-btn whatsapp"
                          onClick={(e) => { e.stopPropagation(); sendWhatsApp(img.url); }}
                          title="Enquire on WhatsApp"
                        >
                          <i className="fab fa-whatsapp"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <span className="gallery-lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</span>
          <button className="gallery-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
          <img src={currentImage} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="gallery-lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
          <div className="gallery-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <a href={currentImage} download className="gallery-lightbox-dl" onClick={(e) => e.stopPropagation()}>
              <i className="fas fa-download"></i> Download
            </a>
            <button className="gallery-lightbox-wa" onClick={() => sendWhatsApp(currentImage)}>
              <i className="fab fa-whatsapp"></i> Enquire on WhatsApp
            </button>
          </div>
          <div className="gallery-lightbox-counter">
            {currentIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </section>
  );
}
