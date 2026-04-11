'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CloseButton from '@/components/CloseButton';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const products: Product[] = data.products || [];
        const found = products.find(p => p.slug === slug);
        setProduct(found || null);

        if (found) {
          const related = products
            .filter(p => p.category === found.category && p.slug !== slug)
            .slice(0, 3);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <CloseButton href="/products" />
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <p style={{ color: '#999', fontSize: '1.6rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <CloseButton href="/products" />
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <p style={{ color: '#999', fontSize: '1.6rem' }}>Product not found</p>
          <button className="btn" style={{ marginTop: '2rem' }} onClick={() => router.push('/products')}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const categoryName = product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="product-detail-page">
      <CloseButton href="/products" />

      <div className="product-detail-hero">
        <div className="product-detail-gallery">
          <img src={product.image} alt={product.name} className="product-detail-main-img" />
          {discount && (
            <span className="product-detail-discount">-{discount}% OFF</span>
          )}
        </div>

        <div className="product-detail-info">
          <p className="product-detail-category">{categoryName}</p>
          <h1>{product.name}</h1>

          <div className="product-detail-rating">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={
                  i < fullStars
                    ? 'fas fa-star'
                    : i === fullStars && hasHalf
                    ? 'fas fa-star-half-alt'
                    : 'far fa-star'
                }
                style={{ color: '#ffc107', fontSize: '1.4rem' }}
              />
            ))}
            <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '1.2rem' }}>
              {product.rating.toFixed(1)}
            </span>
          </div>

          <div className="product-detail-price">
            <span className="pd-price-current">Rs.{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="pd-price-original">Rs.{product.originalPrice.toLocaleString()}</span>
            )}
            {discount && (
              <span className="pd-price-save">Save {discount}%</span>
            )}
          </div>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-actions">
            <button
              className="btn"
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <i className="fas fa-check"></i> Added to Cart
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </>
              )}
            </button>
            <button
              className="btn"
              style={{ background: 'transparent', border: '0.2rem solid #a27341', color: '#a27341' }}
              onClick={() => window.open('https://wa.me/919321812823', '_blank')}
            >
              <i className="fas fa-phone"></i> Enquire Now
            </button>
          </div>

          <div className="product-detail-features">
            <div className="pd-feature">
              <i className="fas fa-truck"></i>
              <div>
                <strong>Free Delivery</strong>
                <span>On orders above Rs.5,000</span>
              </div>
            </div>
            <div className="pd-feature">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>5 Year Warranty</strong>
                <span>On all furniture</span>
              </div>
            </div>
            <div className="pd-feature">
              <i className="fas fa-tools"></i>
              <div>
                <strong>Easy Assembly</strong>
                <span>DIY with manual</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="product-detail-related">
          <h2>Related Products</h2>
          <div className="product-detail-related-grid">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="pd-related-card">
                <img src={p.image} alt={p.name} />
                <h4>{p.name}</h4>
                <span>Rs.{p.price.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
