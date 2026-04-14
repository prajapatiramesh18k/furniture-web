'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CloseButton from '@/components/CloseButton';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const categoryLabels: Record<string, string> = {
  'bedroom': 'Bedroom',
  'living-room': 'Living Room',
  'dining-room': 'Dining Room',
  'office': 'Office',
  'entryway': 'Entryway',
  'kids-room': 'Kids Room',
  'pooja-unit': 'Pooja Unit',
  'kitchen': 'Kitchen',
};

const filterCategories = [
  { id: 'all', name: 'All' },
  { id: 'sofa', name: 'Sofa' },
  { id: 'chair', name: 'Chair' },
  { id: 'table', name: 'Table' },
  { id: 'bed', name: 'Beds' },
  { id: 'storage', name: 'Storage' },
  { id: 'decor', name: 'Decor' },
];

const PRODUCTS_PER_PAGE = 12;

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Reset to page 1 when filter or search changes
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  // Filter products by category
  const baseFiltered = activeFilter === 'all'
    ? currentProducts
    : currentProducts.filter(p => p.category === activeFilter);

  // Apply search filter
  const filteredProducts = searchQuery.trim()
    ? baseFiltered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseFiltered;

  // Calculate total pages based on filtered products
  const filteredTotal = searchQuery.trim()
    ? products.filter(p =>
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (activeFilter === 'all' || p.category === activeFilter)
      ).length
    : (activeFilter === 'all'
        ? products.length
        : products.filter(p => p.category === activeFilter).length);
  const filteredTotalPages = Math.ceil(filteredTotal / PRODUCTS_PER_PAGE);

  return (
    <div className="products-page">
      <CloseButton href="/" />

      <div className="products-page-hero">
        <h1>Our <span>Products</span></h1>
        <p>Discover handcrafted furniture that transforms your space into a home. Every piece is made with care by our skilled artisans.</p>
      </div>

      {searchQuery && (
        <div className="products-search-info">
          Showing results for "<strong>{searchQuery}</strong>"
          <button className="products-search-clear" onClick={() => window.history.back()}>×</button>
        </div>
      )}

      {loading ? (
        <div className="products-page-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-skeleton">
              <div className="product-skeleton-img"></div>
              <div className="product-skeleton-body">
                <div className="product-skeleton-line short"></div>
                <div className="product-skeleton-line"></div>
                <div className="product-skeleton-line medium"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="products-page-grid">
          <p style={{ textAlign: 'center', color: '#999', fontSize: '1.4rem', gridColumn: '1/-1', padding: '4rem' }}>No products found.</p>
        </div>
      ) : (
        <>
          {/* Category Filters */}
          <div className="products-page-filters">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                className={`products-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                onClick={() => handleFilterChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="products-page-grid">
            {filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', fontSize: '1.4rem', gridColumn: '1/-1', padding: '4rem' }}>No products in this category.</p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="products-page-card">
                  <div className="products-page-card-img">
                    <button
                      className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist({ id: product.id, name: product.name, image: product.image, price: product.price, slug: product.slug })}
                    >
                      <i className={`${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                    </button>
                    <Link href={`/products/${product.slug || product.id}`}>
                      <img src={product.image} alt={product.name} />
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
              ))
            )}
          </div>

          {filteredTotalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: filteredTotalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage((p) => Math.min(filteredTotalPages, p + 1))}
                disabled={currentPage === filteredTotalPages}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
