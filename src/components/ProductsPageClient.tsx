'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback, useTransition, useEffect, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import CloseButton from '@/components/CloseButton';
import { useWishlist } from '@/context/WishlistContext';

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
  { id: 'all', name: 'All' },
  { id: 'sofa', name: 'Sofa' },
  { id: 'chair', name: 'Chair' },
  { id: 'table', name: 'Table' },
  { id: 'bed', name: 'Beds' },
  { id: 'storage', name: 'Storage' },
  { id: 'decor', name: 'Decor' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'living-room', name: 'Living Room' },
  { id: 'kitchen', name: 'Kitchen' },
];

const PRODUCTS_PER_PAGE = 12;

const ProductCard = memo(function ProductCard({
  product,
  isWished,
  onToggleWishlist,
}: {
  product: ProductListItem;
  isWished: boolean;
  onToggleWishlist: (p: ProductListItem) => void;
}) {
  const discount =
    Number(product.originalPrice) > Number(product.price)
      ? Math.round(
          ((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100
        )
      : null;

  const handleWishlistClick = useCallback(() => {
    onToggleWishlist(product);
  }, [onToggleWishlist, product]);

  return (
    <div className="products-page-card">
      <div className="products-page-card-img">
        {discount && <span className="product-discount-badge">-{discount}% OFF</span>}
        <button
          type="button"
          className={`product-wishlist-btn ${isWished ? 'active' : ''}`}
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleWishlistClick}
        >
          <i className={`${isWished ? 'fas' : 'far'} fa-heart`} />
        </button>
        <Link href={`/products/${product.slug || product.id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={`${product.name} — custom furniture by Ananya House of Furniture`}
            loading="lazy"
            decoding="async"
            width={600}
            height={400}
          />
          <div className="products-page-card-overlay">
            <span>View Details</span>
          </div>
        </Link>
      </div>
      <div className="products-page-card-body">
        <Link href={`/products/${product.slug || product.id}`}>
          <p className="products-page-card-category">{categoryLabels[product.category] || product.category}</p>
          <h2>{product.name}</h2>
        </Link>
        <div className="products-page-card-price">
          <span className="pp-price-current">Rs.{Number(product.price).toLocaleString()}</span>
          {Number(product.originalPrice) > Number(product.price) && (
            <span className="pp-price-original">Rs.{Number(product.originalPrice).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
});

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
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = useCallback((filterId: string) => {
    startTransition(() => {
      setActiveFilter(filterId);
      setCurrentPage(1);
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  const handlePrev = useCallback(() => {
    startTransition(() => {
      setCurrentPage((p) => Math.max(1, p - 1));
    });
  }, []);

  const handleNext = useCallback((totalPages: number) => {
    startTransition(() => {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    });
  }, []);

  const onToggleWishlist = useCallback(
    (p: ProductListItem) => {
      toggleWishlist({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        slug: p.slug,
      });
    },
    [toggleWishlist]
  );

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

  const filteredTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAll.length / PRODUCTS_PER_PAGE)),
    [filteredAll.length]
  );

  // Clamp currentPage if filter/search shrinks the result set — prevents empty page
  useEffect(() => {
    if (currentPage > filteredTotalPages) {
      setCurrentPage(filteredTotalPages);
    }
  }, [filteredTotalPages, currentPage]);

  const filteredProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredAll.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredAll, currentPage]);

  // Prefetch next page images so forward pagination renders instantly (no UI change)
  useEffect(() => {
    if (currentPage >= filteredTotalPages) return;
    const startIndex = currentPage * PRODUCTS_PER_PAGE;
    const next = filteredAll.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    let cancelled = false;
    const idle = (cb: () => void) =>
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(cb)
        : window.setTimeout(cb, 0);
    idle(() => {
      if (cancelled) return;
      for (const p of next.slice(0, 6)) {
        if (p?.image) {
          const pre = new Image();
          pre.src = p.image;
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filteredAll, currentPage, filteredTotalPages]);

  return (
    <div className="products-page">
      <CloseButton href="/" />

      <div className="products-page-hero">
        <h1>
          Our <span>Products</span>
        </h1>
        <p>
          Discover handcrafted furniture for Mumbai, Navi Mumbai &amp; Thane homes. Every piece is
          made with care by our skilled artisans.
        </p>
      </div>

      {searchQuery && (
        <div className="products-search-info">
          Showing results for &quot;<strong>{searchQuery}</strong>&quot;
          <button type="button" className="products-search-clear" onClick={() => window.history.back()}>
            ×
          </button>
        </div>
      )}

      {initialProducts.length === 0 ? (
        <div className="products-page-grid">
          <p
            style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '1.4rem',
              gridColumn: '1/-1',
              padding: '4rem',
            }}
          >
            No products found.
          </p>
        </div>
      ) : (
        <>
          <div className="products-page-filters" role="tablist" aria-label="Product categories">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`products-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                onClick={() => handleFilterChange(cat.id)}
                aria-selected={activeFilter === cat.id}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            {isPending && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
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
            <div
              className="products-page-grid"
              style={
                isPending
                  ? { opacity: 0.6, transition: 'opacity 0.2s ease' }
                  : { transition: 'opacity 0.2s ease' }
              }
            >
              {filteredProducts.length === 0 ? (
                <p
                  style={{
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '1.4rem',
                    gridColumn: '1/-1',
                    padding: '4rem',
                  }}
                >
                  No products in this category.
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWished={isInWishlist(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))
              )}
            </div>
          </div>

          {filteredTotalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={handlePrev}
                disabled={currentPage === 1 || isPending}
                aria-busy={isPending}
              >
                <i className="fas fa-chevron-left" /> Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: filteredTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handleNext(filteredTotalPages)}
                disabled={currentPage === filteredTotalPages || isPending}
                aria-busy={isPending}
              >
                Next <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
