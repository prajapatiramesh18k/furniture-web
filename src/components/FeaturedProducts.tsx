'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { cachedGetJSON } from '@/lib/api-cache';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    let cancelled = false;
    cachedGetJSON<{ products: any[] }>('/api/products?limit=50')
      .then(data => {
        if (!cancelled) setProducts((data.products || []).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
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
                {renderStars(Number(product.rating))}
                <span className="fp-rating-text">({Number(product.rating).toFixed(1)})</span>
              </div>
              <div className="fp-price">
                <span className="fp-current">Rs.{Number(product.price).toLocaleString()}</span>
                {Number(product.originalPrice) > Number(product.price) && (
                  <span className="fp-original">Rs.{Number(product.originalPrice).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <div className="fp-view-all">
        <Link href="/products" className="btn">
          View All Products
        </Link>
      </div>
    </section>
  );
}
