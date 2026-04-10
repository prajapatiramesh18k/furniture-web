'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="products-page">
      <button className="sr-back products-page-back" onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <div className="products-page-hero">
        <h1>Our <span>Products</span></h1>
        <p>Discover handcrafted furniture that transforms your space into a home. Every piece is made with care by our skilled artisans.</p>
      </div>

      {products.length === 0 ? (
        <div className="products-page-grid">
          <p style={{ textAlign: 'center', color: '#999', fontSize: '1.4rem', gridColumn: '1/-1', padding: '4rem' }}>Loading products...</p>
        </div>
      ) : (
        <div className="products-page-grid">
          {products.map((product) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
