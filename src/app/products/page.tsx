'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CloseButton from '@/components/CloseButton';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  // Filter products by category
  const filteredProducts = activeFilter === 'all'
    ? currentProducts
    : currentProducts.filter(p => p.category === activeFilter);

  // Calculate total pages based on filtered products
  const filteredTotal = activeFilter === 'all'
    ? products.length
    : products.filter(p => p.category === activeFilter).length;
  const filteredTotalPages = Math.ceil(filteredTotal / PRODUCTS_PER_PAGE);

  return (
    <div className="products-page">
      <CloseButton href="/" />

      <div className="products-page-hero">
        <h1>Our <span>Products</span></h1>
        <p>Discover handcrafted furniture that transforms your space into a home. Every piece is made with care by our skilled artisans.</p>
      </div>

      {products.length === 0 ? (
        <div className="products-page-grid">
          <p style={{ textAlign: 'center', color: '#999', fontSize: '1.4rem', gridColumn: '1/-1', padding: '4rem' }}>Loading products...</p>
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
                <Link key={product.id} href={`/products/${product.slug || product.id}`} className="products-page-card">
                  <div className="products-page-card-img">
                    <img src={product.image} alt={product.name} />
                    <div className="products-page-card-overlay">
                      <span>View Details</span>
                    </div>
                  </div>
                  <div className="products-page-card-body">
                    <p className="products-page-card-category">{categoryLabels[product.category] || product.category}</p>
                    <h2>{product.name}</h2>
                    <div className="products-page-card-price">
                      <span className="pp-price-current">Rs.{Number(product.price).toLocaleString()}</span>
                      {Number(product.originalPrice) > Number(product.price) && (
                        <span className="pp-price-original">Rs.{Number(product.originalPrice).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
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
