'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import CloseButton from '@/components/CloseButton';
import { useWishlist } from '@/context/WishlistContext';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';

export type ProductListItem = {
  id: string | number;
  slug?: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  description?: string;
};

const categoryLabels: Record<string, string> = {
  bedroom: 'Bedroom',
  'living-room': 'Living Room',
  'dining-room': 'Dining Room',
  office: 'Office',
  entryway: 'Entryway',
  'kids-room': 'Kids Room',
  'pooja-unit': 'Pooja Unit',
  kitchen: 'Kitchen',
  sofa: 'Sofa',
  chair: 'Chair',
  table: 'Table',
  bed: 'Beds',
  storage: 'Storage',
  decor: 'Decor',
};

const filterCategories = [
  { id: 'all', name: 'All', icon: 'fa-th-large' },
  { id: 'sofa', name: 'Sofa', icon: 'fa-couch' },
  { id: 'chair', name: 'Chair', icon: 'fa-chair' },
  { id: 'table', name: 'Table', icon: 'fa-table' },
  { id: 'bed', name: 'Beds', icon: 'fa-bed' },
  { id: 'storage', name: 'Storage', icon: 'fa-archive' },
  { id: 'decor', name: 'Decor', icon: 'fa-spa' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-hat-chef' },
];

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPageClient({
  initialProducts,
}: {
  initialProducts: ProductListItem[];
}) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [catQuery, setCatQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const filteredAll = useMemo(() => {
    let list = initialProducts;
    if (activeFilter !== 'all') {
      list = list.filter((p) => p.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialProducts, activeFilter, searchQuery]);

  const filteredTotalPages = Math.max(1, Math.ceil(filteredAll.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const filteredProducts = filteredAll.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const activeFilterName = useMemo(
    () => filterCategories.find((c) => c.id === activeFilter)?.name || 'All Products',
    [activeFilter]
  );

  const bookConsultation = () => {
    openWhatsAppChat(`Hi! I browsed your Products and want a free design consultation for my space.`, {
      branch: 'mumbai',
      cta: 'products_consult',
      source: 'products_page',
    });
  };

  const visibleCategories = filterCategories.filter((c) =>
    c.name.toLowerCase().includes(catQuery.trim().toLowerCase())
  );

  return (
    <div className="gallery-redesign products-redesign" suppressHydrationWarning>
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
          <span className="gal-filter-active-label">{activeFilterName}</span>
          <i className={`fas fa-chevron-down gal-toggle-chev ${filtersOpen ? 'open' : ''}`} />
        </button>

        {searchQuery && (
          <div className="products-search-info gal-result-bar">
            Showing results for &quot;<strong>{searchQuery}</strong>&quot;
            <button type="button" className="products-search-clear" onClick={() => window.history.back()}>
              ×
            </button>
          </div>
        )}

        <div className="gal-layout">
          {/* ===== LEFT SIDEBAR FILTER ===== */}
          <aside className={`gal-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="gal-toolbar gal-filter-card">
              <label className="gal-filter-search">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="search"
                  value={catQuery}
                  onChange={(e) => setCatQuery(e.target.value)}
                  placeholder="Search categories…"
                  aria-label="Search categories"
                />
                {catQuery && (
                  <button
                    type="button"
                    className="gal-search-clear"
                    onClick={() => setCatQuery('')}
                    aria-label="Clear category search"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </label>

              <div className="gal-room-grid" role="tablist" aria-label="Product category filter">
                {visibleCategories.map((cat) => {
                  const isActive = activeFilter === cat.id;
                  return (
                    <button
                      role="tab"
                      aria-selected={isActive}
                      key={cat.id}
                      type="button"
                      className={`gal-room-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleFilterChange(cat.id)}
                    >
                      <span className="gal-room-ic">
                        <i className={`fas ${cat.icon}`} />
                      </span>
                      <span className="gal-room-label">{cat.name}</span>
                      {isActive && (
                        <span className="gal-room-check" aria-hidden="true">
                          <i className="fas fa-check" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {catQuery.trim() && visibleCategories.length === 0 && (
                <p className="gal-no-room">
                  No categories match “{catQuery.trim()}”.{' '}
                  <button type="button" onClick={() => setCatQuery('')}>
                    Show all
                  </button>
                </p>
              )}
            </div>
          </aside>

          {/* ===== RIGHT CONTENT ===== */}
          <div className="gal-main">
            {initialProducts.length === 0 || filteredProducts.length === 0 ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">
                  <i className="fas fa-couch" />
                </div>
                <h2>No products here yet</h2>
                <p>
                  {initialProducts.length === 0
                    ? 'No products found.'
                    : `No products in ${activeFilterName} yet — try another category, or ask us on WhatsApp.`}
                </p>
                <div className="gal-empty-actions">
                  <button
                    type="button"
                    className="gal-btn gal-btn-gold"
                    onClick={() => handleFilterChange('all')}
                  >
                    <i className="fas fa-rotate-left" /> View all products
                  </button>
                  <button type="button" className="gal-btn gal-btn-dark" onClick={bookConsultation}>
                    <i className="fab fa-whatsapp" /> Ask on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="gallery-page-grid">
                {filteredProducts.map((product) => {
                  const discount =
                    Number(product.originalPrice) > Number(product.price)
                      ? Math.round(
                          ((Number(product.originalPrice) - Number(product.price)) /
                            Number(product.originalPrice)) *
                            100
                        )
                      : null;
                  const wished = isInWishlist(product.id);
                  return (
                    <article key={product.id} className="gal-card prod-card">
                      <div className="gal-card-media">
                        <Link href={`/products/${product.slug || product.id}`} aria-label={`View ${product.name}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={`${product.name} — custom furniture by Ananya House of Furniture`}
                            loading="lazy"
                            decoding="async"
                            width={600}
                            height={450}
                          />
                        </Link>
                        <span className="gal-badge">
                          {categoryLabels[product.category] || product.category}
                        </span>
                        {discount && (
                          <span className="prod-discount">-{discount}% OFF</span>
                        )}
                        <button
                          type="button"
                          className={`prod-wish ${wished ? 'active' : ''}`}
                          aria-label={
                            wished
                              ? `Remove ${product.name} from wishlist`
                              : `Add ${product.name} to wishlist`
                          }
                          onClick={() =>
                            toggleWishlist({
                              id: product.id,
                              name: product.name,
                              image: product.image,
                              price: product.price,
                              slug: product.slug,
                            })
                          }
                        >
                          <i className={`${wished ? 'fas' : 'far'} fa-heart`} />
                        </button>
                        <div className="gal-card-shade" />
                      </div>
                      <div className="gal-card-foot prod-foot">
                        <div>
                          <Link href={`/products/${product.slug || product.id}`}>
                            <h3>{product.name}</h3>
                          </Link>
                          <p className="prod-price">
                            <span className="prod-price-current">
                              Rs.{Number(product.price).toLocaleString()}
                            </span>
                            {Number(product.originalPrice) > Number(product.price) && (
                              <s className="prod-price-original">
                                Rs.{Number(product.originalPrice).toLocaleString()}
                              </s>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/products/${product.slug || product.id}`}
                          className="gal-enquire prod-enquire"
                          aria-label={`View ${product.name} details`}
                        >
                          <i className="fas fa-arrow-right" />
                        </Link>
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

        {/* ===== FOOTER BAR — CTA + pagination in one line ===== */}
        <div className="gal-footer-bar">
          <button type="button" className="gal-btn gal-btn-gold gal-footer-cta" onClick={bookConsultation}>
            <i className="fab fa-whatsapp" /> Book Free Consultation
          </button>
          {filteredTotalPages > 1 && (
            <div className="pagination gal-pagination gal-pagination-inline">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left" /> Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: filteredTotalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === filteredTotalPages || Math.abs(p - currentPage) <= 2)
                  .map((page, i, arr) => (
                    <span key={page} style={{ display: 'contents' }}>
                      {i > 0 && arr[i - 1] !== page - 1 && <span className="gal-dots">…</span>}
                      <button
                        type="button"
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(filteredTotalPages, p + 1))}
                disabled={currentPage === filteredTotalPages}
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
    </div>
  );
}
