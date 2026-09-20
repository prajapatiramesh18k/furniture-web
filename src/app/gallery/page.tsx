'use client';
import { useState, useEffect, useRef, useCallback, useTransition, memo } from 'react';
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

type CacheValue = { images: GalleryImage[]; totalPages: number };

const GalleryItem = memo(function GalleryItem({
  img,
  index,
  onOpen,
  onDownload,
  onEnquire,
}: {
  img: GalleryImage;
  index: number;
  onOpen: (index: number) => void;
  onDownload: (url: string) => void;
  onEnquire: (url: string) => void;
}) {
  return (
    <div
      className="gallery-page-item"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(index);
        }
      }}
      aria-label={`Open ${img.category} design ${index + 1}`}
    >
      <img src={img.url} alt={`${img.category} design ${index + 1} by Ananya House of Furniture`} loading="lazy" decoding="async" width={600} height={450} />
      <div className="gallery-page-item-overlay">
        <div className="gpo-actions">
          <button
            type="button"
            className="gpo-btn"
            onClick={(e) => { e.stopPropagation(); onDownload(img.url); }}
            title="Download"
            aria-label={`Download ${img.category} design ${index + 1}`}
          >
            <i aria-hidden="true" className="fas fa-expand"></i>
          </button>
          <button
            type="button"
            className="gpo-btn gpo-wa"
            onClick={(e) => { e.stopPropagation(); onEnquire(img.url); }}
            title="Enquire on WhatsApp"
            aria-label={`Enquire about ${img.category} design ${index + 1} on WhatsApp`}
          >
            <i aria-hidden="true" className="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    </div>
  );
});

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cacheRef = useRef<Map<string, CacheValue>>(new Map());
  const prefetchRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  const prefetchPage = useCallback((page: number, category: string, room: string, totalPages: number) => {
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    const nextKey = `${nextPage}:${category}:${room}`;
    // Skip if already cached or already being prefetched — avoids duplicate requests
    if (cacheRef.current.has(nextKey) || prefetchRef.current.has(nextKey)) return;
    prefetchRef.current.add(nextKey);
    fetch(`/api/gallery?page=${nextPage}&category=${encodeURIComponent(category)}&room=${encodeURIComponent(room)}`, { cache: 'force-cache' as RequestCache })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.images)) {
          cacheRef.current.set(nextKey, { images: d.images, totalPages: d.totalPages || 0 });
          // Warm the browser image cache so the next page renders instantly
          for (const img of d.images.slice(0, 4)) {
            if (img?.url) {
              const pre = new Image();
              pre.src = img.url;
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        prefetchRef.current.delete(nextKey);
      });
  }, []);

  // Read category from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
    setMounted(true);
  }, []);

  const fetchGallery = useCallback(async (page: number, category: string, room: string) => {
    const cacheKey = `${page}:${category}:${room}`;

    // Serve from client cache instantly — no network call
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setImages(cached.images);
      setTotalPages(cached.totalPages);
      setInitialLoading(false);
      setIsFetching(false);
      prefetchPage(page, category, room, cached.totalPages);
      return;
    }

    // Cancel any in-flight request to prevent race / duplicate rendering
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++reqIdRef.current;

    // Lightweight fetching state — keeps existing grid visible
    setIsFetching(true);

    try {
      const res = await fetch(
        `/api/gallery?page=${page}&category=${encodeURIComponent(category)}&room=${encodeURIComponent(room)}`,
        { signal: controller.signal, cache: 'force-cache' as RequestCache }
      );
      const data = await res.json();
      // Ignore stale responses
      if (controller.signal.aborted || reqId !== reqIdRef.current) return;
      if (Array.isArray(data.images)) {
        setImages(data.images);
        setTotalPages(data.totalPages || 0);
        cacheRef.current.set(cacheKey, { images: data.images, totalPages: data.totalPages || 0 });

        // Prefetch next page silently for instant pagination
        prefetchPage(page, category, room, data.totalPages || 0);
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Failed to fetch gallery:', error);
    } finally {
      if (reqId === reqIdRef.current) {
        setIsFetching(false);
        setInitialLoading(false);
      }
    }
  }, [prefetchPage]);

  useEffect(() => {
    if (!mounted) return;
    fetchGallery(currentPage, activeCategory, activeRoom);
    return () => {
      // cleanup abort on unmount / deps change is handled inside fetchGallery via abortRef
    };
  }, [currentPage, activeCategory, activeRoom, mounted, fetchGallery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    startTransition(() => {
      setActiveCategory(catId);
      setCurrentPage(1);
    });
  }, []);

  const handleRoomChange = useCallback((roomId: string) => {
    startTransition(() => {
      setActiveRoom(roomId);
      setActiveCategory('all');
      setCurrentPage(1);
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const sendWhatsApp = useCallback((url: string) => {
    openWhatsAppChat(`I'm interested in this design: ${url}`, {
      branch: 'mumbai',
      cta: 'gallery_enquire',
      source: 'gallery_page',
    });
  }, []);

  const downloadImage = useCallback((url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'design';
    link.click();
  }, []);

  const showSkeleton = initialLoading && images.length === 0;
  const showEmpty = !showSkeleton && !isFetching && images.length === 0 && mounted;
  const isBusy = isFetching || isPending;

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
            onClick={() => handleRoomChange('all')}
          >
            <i className="fas fa-th-large"></i>
            <span>All</span>
          </button>
          {roomCategories.map(room => (
            <button
              key={room.id}
              className={`gallery-pill-btn ${activeRoom === room.id ? 'active' : ''}`}
              onClick={() => handleRoomChange(room.id)}
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

        {/* Images Grid — lightweight non-blocking loading: keep grid visible, dim while fetching */}
        {showSkeleton ? (
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
        ) : showEmpty ? (
          <div className="gallery-page-empty">
            <i className="fas fa-images"></i>
            <p>No designs in this category yet.</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {isBusy && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid #f0e7d4',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 12,
                  color: '#6e4c22',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  pointerEvents: 'none',
                }}
              >
                <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                Loading…
              </div>
            )}
            <div className="gallery-page-grid" style={isBusy ? { opacity: 0.6, pointerEvents: 'none', transition: 'opacity 0.2s ease' } : { transition: 'opacity 0.2s ease' }}>
              {images.map((img, index) => (
                <GalleryItem
                  key={img._id}
                  img={img}
                  index={index}
                  onOpen={openLightbox}
                  onDownload={downloadImage}
                  onEnquire={sendWhatsApp}
                />
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-busy={isBusy}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  disabled={currentPage === page}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-busy={isBusy}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images[currentIndex] && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="gallery-lightbox-close" aria-label="Close viewer" onClick={() => setLightboxOpen(false)}>&times;</button>
          <button type="button" className="gallery-lightbox-nav prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
          <img
            src={images[currentIndex].url}
            alt={`${images[currentIndex].category} design by Ananya House of Furniture`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '96vw', maxHeight: '86vh', objectFit: 'contain' }}
          />
          <button type="button" className="gallery-lightbox-nav next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
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
