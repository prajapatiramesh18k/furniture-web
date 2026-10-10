'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
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

function prettyLabel(category: string, room: string): string {
  const sub = room !== 'all' ? subCategories[room]?.find((s) => s.id === category)?.name : undefined;
  if (sub) return sub;
  for (const list of Object.values(subCategories)) {
    const hit = list.find((s) => s.id === category);
    if (hit) return hit.name;
  }
  const r = roomCategories.find((x) => x.id === category || x.id === room);
  if (category === 'all' && r) return r.name;
  if (category === 'all') return 'All Designs';
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

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
  const [roomQuery, setRoomQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read category from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const room = params.get('room');
    if (cat) setActiveCategory(cat);
    if (room) setActiveRoom(room);
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

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handleRoomChange = (roomId: string) => {
    setActiveRoom(roomId);
    setActiveCategory('all');
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveRoom('all');
    setActiveCategory('all');
    setCurrentPage(1);
  };

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, prevImage, nextImage, closeLightbox]);

  const sendWhatsApp = (url: string, label?: string) => {
    openWhatsAppChat(`Hi! I'm interested in this ${label || 'design'} from your gallery: ${url}`, {
      branch: 'mumbai',
      cta: 'gallery_enquire',
      source: 'gallery_page',
    });
  };

  const bookConsultation = () => {
    openWhatsAppChat(`Hi! I browsed your Design Gallery and want a free design consultation for my space.`, {
      branch: 'mumbai',
      cta: 'gallery_consult',
      source: 'gallery_page',
    });
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'design';
    link.target = '_blank';
    link.click();
  };

  const activeRoomName = useMemo(
    () => roomCategories.find((r) => r.id === activeRoom)?.name || 'All Rooms',
    [activeRoom]
  );
  const activeCatName = useMemo(
    () => prettyLabel(activeCategory, activeRoom),
    [activeCategory, activeRoom]
  );
  const current = images[currentIndex];

  return (
    <div className="gallery-redesign" suppressHydrationWarning>
      <CloseButton href="/" />
      <div className="gal-body gal-body-top">
        {/* Mobile filter toggle */}
        <button
          type="button"
          className="gal-filter-toggle"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <i className="fas fa-sliders-h" /> Filters
          <span className="gal-filter-active-label">
            {activeRoomName}
            {activeCategory !== 'all' ? ` · ${activeCatName}` : ''}
          </span>
          <i className={`fas fa-chevron-down gal-toggle-chev ${filtersOpen ? 'open' : ''}`} />
        </button>

        <div className="gal-layout">
          {/* ===== LEFT SIDEBAR FILTER ===== */}
          <aside className={`gal-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="gal-toolbar gal-filter-card">
              <label className="gal-filter-search">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="search"
                  value={roomQuery}
                  onChange={(e) => setRoomQuery(e.target.value)}
                  placeholder="Search rooms…"
                  aria-label="Search rooms"
                />
                {roomQuery && (
                  <button
                    type="button"
                    className="gal-search-clear"
                    onClick={() => setRoomQuery('')}
                    aria-label="Clear room search"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </label>

              <div className="gal-room-grid" role="tablist" aria-label="Room filter">
                <button
                  role="tab"
                  aria-selected={activeRoom === 'all'}
                  className={`gal-room-btn ${activeRoom === 'all' ? 'active' : ''}`}
                  onClick={() => handleRoomChange('all')}
                >
                  <span className="gal-room-ic">
                    <i className="fas fa-th-large" />
                  </span>
                  <span className="gal-room-label">All</span>
                  {activeRoom === 'all' && (
                    <span className="gal-room-check" aria-hidden="true">
                      <i className="fas fa-check" />
                    </span>
                  )}
                </button>
                {roomCategories
                  .filter((r) => r.name.toLowerCase().includes(roomQuery.trim().toLowerCase()))
                  .map((room) => {
                    const isActive = activeRoom === room.id;
                    return (
                      <button
                        role="tab"
                        aria-selected={isActive}
                        key={room.id}
                        className={`gal-room-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleRoomChange(room.id)}
                      >
                        <span className="gal-room-ic">
                          <i className={`fas ${room.icon}`} />
                        </span>
                        <span className="gal-room-label">{room.name}</span>
                        {isActive && (
                          <span className="gal-room-check" aria-hidden="true">
                            <i className="fas fa-check" />
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
              {roomQuery.trim() &&
                roomCategories.filter((r) =>
                  r.name.toLowerCase().includes(roomQuery.trim().toLowerCase())
                ).length === 0 && (
                  <p className="gal-no-room">
                    No rooms match “{roomQuery.trim()}”.{' '}
                    <button type="button" onClick={() => setRoomQuery('')}>
                      Show all
                    </button>
                  </p>
                )}

              {activeRoom !== 'all' && (
                <div className="gal-sub-bar" aria-label="Design type filter">
                  <p className="gal-sub-title">
                    <i className="fas fa-layer-group" /> Design type in{' '}
                    {roomCategories.find((r) => r.id === activeRoom)?.name || 'Room'}
                  </p>
                  <div className="gallery-sub-pill-row gal-sub-chips">
                    <button
                      className={`gallery-sub-pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      <i className="fas fa-border-all" /> All
                    </button>
                    {subCategories[activeRoom]?.map((sub) => (
                      <button
                        key={sub.id}
                        className={`gallery-sub-pill-btn ${activeCategory === sub.id ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(sub.id)}
                      >
                        <i className={`fas ${sub.icon}`} /> {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ===== RIGHT CONTENT ===== */}
          <div className="gal-main">
            {/* ===== GRID ===== */}
        {loading ? (
          <div className="gallery-page-grid">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="gallery-skeleton">
                <div className="gallery-skeleton-img">
                  <div className="skeleton-shimmer" />
                </div>
                <div className="gallery-skeleton-content">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line subtitle" />
                </div>
              </div>
            ))}
          </div>
        ) : !mounted || images.length === 0 ? (
          <div className="gal-empty">
            <div className="gal-empty-icon">
              <i className="fas fa-images" />
            </div>
            <h2>No designs here yet</h2>
            <p>
              We haven&apos;t added {activeCatName} in {activeRoomName} yet — try another room,
              or ask us on WhatsApp and we&apos;ll share similar work.
            </p>
            <div className="gal-empty-actions">
              <button type="button" className="gal-btn gal-btn-gold" onClick={resetFilters}>
                <i className="fas fa-rotate-left" /> View all designs
              </button>
              <button type="button" className="gal-btn gal-btn-dark" onClick={bookConsultation}>
                <i className="fab fa-whatsapp" /> Ask on WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="gallery-page-grid">
            {images.map((img, index) => {
              const label = prettyLabel(img.category, activeRoom);
              return (
                <article
                  key={img._id}
                  className="gal-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                  aria-label={`Open ${label} design ${index + 1}`}
                >
                  <div className="gal-card-media">
                    <img
                      src={img.url}
                      alt={`${label} design ${index + 1} by Ananya House of Furniture`}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={450}
                    />
                    <span className="gal-badge">{label}</span>
                    <div className="gal-card-shade" />
                    <div className="gal-card-hover">
                      <span className="gal-hover-btn gal-hover-view">
                        <i className="fas fa-expand" /> View
                      </span>
                      <span className="gal-hover-actions">
                        <button
                          type="button"
                          className="gpo-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(img.url);
                          }}
                          title="Download"
                          aria-label={`Download ${label} design ${index + 1}`}
                        >
                          <i aria-hidden="true" className="fas fa-download" />
                        </button>
                        <button
                          type="button"
                          className="gpo-btn gpo-wa"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsApp(img.url, label);
                          }}
                          title="Enquire on WhatsApp"
                          aria-label={`Enquire about ${label} design ${index + 1} on WhatsApp`}
                        >
                          <i aria-hidden="true" className="fab fa-whatsapp" />
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="gal-card-foot">
                    <div>
                      <h3>{label}</h3>
                      <p>{activeRoomName} · Design {index + 1 + (currentPage - 1) * images.length}</p>
                    </div>
                    <button
                      type="button"
                      className="gal-enquire"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendWhatsApp(img.url, label);
                      }}
                      aria-label={`Enquire about ${label} on WhatsApp`}
                    >
                      <i className="fab fa-whatsapp" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
          </div>
          {/* end gal-main */}
        </div>
        {/* end gal-layout */}

        {/* ===== FOOTER BAR — CTA + pagination in one line, pulled up into view ===== */}
        <div className="gal-footer-bar">
          <button type="button" className="gal-btn gal-btn-gold gal-footer-cta" onClick={bookConsultation}>
            <i className="fab fa-whatsapp" /> Book Free Consultation
          </button>
          {totalPages > 1 && (
            <div className="pagination gal-pagination gal-pagination-inline">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left" /> Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((page, i, arr) => (
                    <span key={page} style={{ display: 'contents' }}>
                      {i > 0 && arr[i - 1] !== page - 1 && <span className="gal-dots">…</span>}
                      <button
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
          <Link href="/visit-us" className="gal-btn gal-btn-dark gal-footer-cta">
            <i className="fas fa-store" /> Visit Showroom
          </Link>
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && current && (
        <div className="gallery-lightbox gal-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={closeLightbox}>
          <div className="gal-lb-top" onClick={(e) => e.stopPropagation()}>
            <span className="gal-badge">{prettyLabel(current.category, activeRoom)}</span>
            <span className="gallery-lightbox-counter">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button type="button" className="gallery-lightbox-close" aria-label="Close viewer" onClick={closeLightbox}>
            &times;
          </button>
          <button type="button" className="gallery-lightbox-nav prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            &#10094;
          </button>
          <img
            src={current.url}
            alt={`${prettyLabel(current.category, activeRoom)} design by Ananya House of Furniture`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '96vw', maxHeight: '76vh', objectFit: 'contain' }}
          />
          <button type="button" className="gallery-lightbox-nav next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            &#10095;
          </button>
          <div className="gallery-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="gallery-lightbox-dl" onClick={() => downloadImage(current.url)}>
              <i className="fas fa-download" /> Download
            </button>
            <button type="button" className="gallery-lightbox-wa" onClick={() => sendWhatsApp(current.url, prettyLabel(current.category, activeRoom))}>
              <i className="fab fa-whatsapp" /> Enquire on WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
