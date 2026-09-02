'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
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
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="products-page-grid">
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
                <div key={product.id} className="products-page-card">
                  <div className="products-page-card-img">
                    <button
                      type="button"
                      className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                      aria-label={
                        isInWishlist(product.id)
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
                      <i className={`${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart`} />
                    </button>
                    <Link href={`/products/${product.slug || product.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={`${product.name} — custom furniture by Ananya House of Furniture`}
                      />
                      <div className="products-page-card-overlay">
                        <span>View Details</span>
                      </div>
                    </Link>
                  </div>
                  <div className="products-page-card-body">
                    <Link href={`/products/${product.slug || product.id}`}>
                      <p className="products-page-card-category">
                        {categoryLabels[product.category] || product.category}
                      </p>
                      <h2>{product.name}</h2>
                    </Link>
                    <div className="products-page-card-price">
                      <span className="pp-price-current">
                        Rs.{Number(product.price).toLocaleString()}
                      </span>
                      {Number(product.originalPrice) > Number(product.price) && (
                        <span className="pp-price-original">
                          Rs.{Number(product.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTotalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left" /> Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: filteredTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
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
        </>
      )}
    </div>
  );
}
