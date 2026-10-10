'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { cachedGetJSON } from '@/lib/api-cache';
import { openWhatsAppChat, getServiceWhatsAppMessage } from '@/lib/quote-whatsapp';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleEnquire = (product: any) => {
    const service = product.category || 'custom-furniture';
    const message = getServiceWhatsAppMessage(service) + ` Interested in: ${product.name}`;
    openWhatsAppChat(message, {
      branch: 'mumbai',
      cta: 'product_enquire',
      cta_position: 'featured_products',
      source: 'featured_products',
      projectType: product.name,
    });
  };

  useEffect(() => {
    let cancelled = false;
    // Fetch only what we render (was limit=50 → slice 6).
    cachedGetJSON<{ products: any[] }>('/api/products?limit=6')
      .then(data => {
        if (!cancelled) {
          setProducts((data.products || []).slice(0, 6));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const renderStars = (rating: number) => {
    const safe = Number.isFinite(Number(rating)) ? Number(rating) : 0;
    const full = Math.floor(safe);
    const half = safe % 1 >= 0.5;
    return (
      <>
        {[...Array(full)].map((_, i) => (
          <i key={`f${i}`} className="fas fa-star" style={{ color: '#ffc107', fontSize: '1rem' }}></i>
        ))}
        {half && <i className="fas fa-star-half-alt" style={{ color: '#ffc107', fontSize: '1rem' }}></i>}
        {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => (
          <i key={`e${i}`} className="far fa-star" style={{ color: '#ccc', fontSize: '1rem' }}></i>
        ))}
      </>
    );
  };

  return (
    <section className="featured-products" id="products">
      <h2 className="heading">our <span>products</span></h2>
      {loading && products.length === 0 ? (
        <div className="featured-products-grid" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="featured-product-card">
              <div className="fp-card-img" style={{ background: '#f0ebe1', minHeight: 220 }} />
              <div className="fp-card-info">
                <p className="fp-category">Loading…</p>
                <h3>Loading products…</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="featured-products-grid">
        {products.map((product) => {
          const discount =
            Number(product.originalPrice) > Number(product.price)
              ? Math.round(
                  ((Number(product.originalPrice) - Number(product.price)) /
                    Number(product.originalPrice)) *
                    100
                )
              : null;
          return (
          <div key={product.id} className="featured-product-card">
            <div className="fp-card-img">
              {discount && (
                <span className="product-discount-badge">-{discount}% OFF</span>
              )}
              <button
                type="button"
                className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={isInWishlist(product.id)}
                onClick={() => toggleWishlist({ id: product.id, name: product.name, image: product.image, price: product.price, slug: product.slug })}
              >
                <i aria-hidden="true" className={`${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart`}></i>
              </button>
              <Link href={`/products/${product.slug || product.id}`}>
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" width={600} height={440} />
              </Link>
            </div>
            <div className="fp-card-info">
              <Link href={`/products/${product.slug || product.id}`}>
                <p className="fp-category">{(product.category || '').replace(/-/g, ' ')}</p>
                <h3>{product.name}</h3>
              </Link>
              <div className="fp-rating">
                {renderStars(Number(product.rating ?? 0))}
                <span className="fp-rating-text">({(Number.isFinite(Number(product.rating)) ? Number(product.rating) : 0).toFixed(1)})</span>
              </div>
              <div className="fp-price">
                <span className="fp-current">Rs.{Number(product.price).toLocaleString()}</span>
                {Number(product.originalPrice) > Number(product.price) && (
                  <span className="fp-original">Rs.{Number(product.originalPrice).toLocaleString()}</span>
                )}
              </div>
              <button
                type="button"
                className="fp-enquire-btn"
                onClick={() => handleEnquire(product)}
                aria-label={`Enquire about ${product.name}`}
              >
                <i className="fab fa-whatsapp" aria-hidden="true" /> Enquire & Customize
              </button>
            </div>
          </div>
          );
        })}
      </div>
      )}
      <div className="fp-view-all">
        <Link href="/products" className="btn">
          View All Products
        </Link>
      </div>
    </section>
  );
}
