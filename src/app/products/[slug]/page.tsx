import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.name} | Ananya House of Furniture`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const relatedProducts = products.filter((p) => p.category === product.category && p.slug !== slug).slice(0, 3);

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="product-detail-page">
      <Link href="/products" className="sr-back product-detail-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </Link>

      <div className="product-detail-hero">
        <div className="product-detail-gallery">
          <img src={product.image} alt={product.name} className="product-detail-main-img" />
          {discount && (
            <span className="product-detail-discount">-{discount}% OFF</span>
          )}
        </div>
        <div className="product-detail-info">
          <p className="product-detail-category">{product.category.replace(/-/g, ' ')}</p>
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
              {product.rating.toFixed(1)} ({Math.floor(product.rating * 20)} reviews)
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
            <button className="btn">
              <i className="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button className="btn" style={{ background: 'transparent', border: '0.2rem solid #a27341', color: '#a27341' }}>
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
