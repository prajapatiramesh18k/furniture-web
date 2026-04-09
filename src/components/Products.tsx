'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
}

const categories = [
  { id: 'all', name: 'All', icon: 'fa-th-large' },
  { id: 'pooja-unit', name: 'Pooja Unit', icon: 'fa-praying-hands' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-utensil-spoon' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'entryway', name: 'Entryway', icon: 'fa-door-open' },
  { id: 'outdoor', name: 'Outdoor', icon: 'fa-tree' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickviewProduct, setQuickviewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.products || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(new Set(JSON.parse(saved)));
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const filterProducts = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === category));
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <i key={`f${i}`} className="fas fa-star" style={{ color: '#ffc107' }}></i>
        ))}
        {half && <i className="fas fa-star-half-alt" style={{ color: '#ffc107' }}></i>}
        {Array.from({ length: empty }).map((_, i) => (
          <i key={`e${i}`} className="fas fa-star" style={{ color: '#ccc' }}></i>
        ))}
      </>
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
    setAddedToCart(String(product.id));
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const getDiscountPercent = (price: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="products-modal-wrapper">
      {/* Sidebar */}
      <div className="products-sidebar">
        <h3 className="sidebar-title">Categories</h3>
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`products-cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => filterProducts(cat.id)}
          >
            <i className={`fas ${cat.icon}`}></i>
            <span>{cat.name}</span>
            <span className="products-count">
              {cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length}
            </span>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="products-content">
        <div className="products-header">
          <p className="products-result-count">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <i className="fas fa-box-open"></i>
            <p>No products found in this category</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const discount = getDiscountPercent(product.price, product.originalPrice);
              const productId = String(product.id);
              const isWishlisted = wishlist.has(productId);
              const isAdded = addedToCart === productId;

              return (
                <div key={productId} className="product-card">
                  {/* Image */}
                  <div className="product-card-image">
                    {discount && (
                      <span className="product-discount-badge">-{discount}%</span>
                    )}
                    <button
                      className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => toggleWishlist(productId)}
                    >
                      <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
                    </button>
                    <img src={product.image} alt={product.name} />
                    <div className="product-card-overlay">
                      <button
                        className="product-quickview-btn"
                        onClick={() => setQuickviewProduct(product)}
                      >
                        <i className="fas fa-eye"></i> Quick View
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category.replace(/-/g, ' ')}</p>
                    <h3 className="product-card-name">{product.name}</h3>

                    <div className="product-card-rating">
                      {renderStars(product.rating)}
                      <span className="rating-text">({product.rating.toFixed(1)})</span>
                    </div>

                    <div className="product-card-price">
                      <span className="price-current">Rs.{product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="price-original">Rs.{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <button
                      className={`product-add-cart-btn ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {isAdded ? (
                        <>
                          <i className="fas fa-check"></i> Added
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart"></i> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickviewProduct && (
        <div
          className="quickview-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setQuickviewProduct(null); }}
        >
          <div className="quickview-modal">
            <button className="quickview-close" onClick={() => setQuickviewProduct(null)}>
              &times;
            </button>
            <div className="quickview-body">
              <div className="quickview-image">
                <img src={quickviewProduct.image} alt={quickviewProduct.name} />
              </div>
              <div className="quickview-details">
                <p className="quickview-category">{quickviewProduct.category.replace(/-/g, ' ')}</p>
                <h2 className="quickview-name">{quickviewProduct.name}</h2>
                <div className="quickview-rating">
                  {renderStars(quickviewProduct.rating)}
                  <span className="rating-text">({quickviewProduct.rating.toFixed(1)})</span>
                </div>
                <div className="quickview-price">
                  <span className="price-current">Rs.{quickviewProduct.price.toLocaleString()}</span>
                  {quickviewProduct.originalPrice > quickviewProduct.price && (
                    <span className="price-original">Rs.{quickviewProduct.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="quickview-description">
                  {quickviewProduct.description || 'Premium quality furniture crafted with care. Perfect for your home.'}
                </p>
                <div className="quickview-actions">
                  <button
                    className="btn"
                    onClick={() => { handleAddToCart(quickviewProduct); setQuickviewProduct(null); }}
                  >
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                  <button className="btn" style={{ background: 'transparent', border: '0.2rem solid var(--main-color)', color: 'var(--main-color)' }}>
                    <i className="fas fa-phone"></i> Enquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
