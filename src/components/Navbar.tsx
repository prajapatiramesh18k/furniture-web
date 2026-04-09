'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import SubmitReview from '@/components/SubmitReview';

const navigation = [
  { label: 'home', href: '/' },
  { label: 'about', href: '/about' },
  { label: 'services', href: '/services' },
  { label: 'products', href: '/products' },
  { label: 'design gallery', href: '/gallery' },
  { label: 'contact', href: '/contact' },
];

export default function Navbar() {
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') setAdminLoggedIn(true);
    const closed = sessionStorage.getItem('bannerClosed');
    if (closed === 'true') setBannerVisible(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    setAdminLoggedIn(false);
    window.location.href = '/';
  };

  const closeBanner = () => {
    setBannerVisible(false);
    sessionStorage.setItem('bannerClosed', 'true');
  };

  return (
    <>
      {bannerVisible && (
        <div className="delivery-banner">
          <div className="delivery-content">
            <i className="fas fa-truck"></i>
            <span>Free Delivery on Orders Above ₹5,000 | Pan-India Shipping Available</span>
            <a href="tel:+919321812823"><i className="fas fa-phone"></i> Call Now</a>
          </div>
          <button className="banner-close" onClick={closeBanner}>&times;</button>
        </div>
      )}

      <header className="header">
        <a href="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="5" fill="#a27341"/>
            <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M10 21V15.5H18V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M7 11.5H21" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
          <span className="logo-text">
            <span className="logo-main">ANANYA</span>
            <span className="logo-sub">House of Furniture</span>
          </span>
        </a>
        <nav className={`navbar ${menuOpen ? 'active' : ''}`} id="navbar">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              suppressHydrationWarning
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
          {adminLoggedIn ? (
            <>
              <a href="/admin">Admin</a>
              <a href="#" onClick={handleLogout}>Logout</a>
            </>
          ) : (
            <a href="/login" suppressHydrationWarning>Login</a>
          )}
        </nav>
        <div className="icons">
          <div className="header-search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search furniture..."
              id="search-btn"
              onClick={() => setSearchOpen(true)}
              readOnly
            />
          </div>
          <div id="cart-btn" className="fas fa-shopping-cart" onClick={() => setCartOpen(true)}>
            <span id="cart-count">{getCartCount()}</span>
          </div>
          <a id="account-btn" className="fas fa-user" href="/login"></a>
          <div id="menu-btn" className="fas fa-bars" onClick={() => setMenuOpen(!menuOpen)}></div>
        </div>
      </header>

      {reviewOpen && <SubmitReview onClose={() => setReviewOpen(false)} />}

      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container">
            <div className="search-header">
              <h3>Search Products</h3>
              <span className="search-close" onClick={() => setSearchOpen(false)}>&times;</span>
            </div>
            <input type="text" id="search-input" placeholder="Search for furniture..." />
            <div className="search-results">
              <p className="search-hint">Start typing to search...</p>
            </div>
          </div>
        </div>
      )}

      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
    </>
  );
}

function CartSidebar({ onClose }: { onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  return (
    <div className="cart-items-container" id="cart-items-container">
      <div id="close" className="fas fa-times" onClick={onClose}></div>
      <h3 className="title">Cart Items</h3>
      {cart.length === 0 ? (
        <div className="cart-empty">
          <i className="fas fa-shopping-cart" style={{ fontSize: '5rem', color: '#ccc', marginBottom: '1rem' }}></i>
          <p style={{ fontSize: '1.6rem', color: 'var(--light-black)' }}>Your cart is empty</p>
          <p style={{ fontSize: '1.3rem', color: '#999', marginTop: '0.5rem' }}>Add products to get started</p>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="content">
                  <h3>{item.name}</h3>
                  <div className="price-cart-row">
                    <span className="cart-item-price">Rs.{item.price.toLocaleString()}</span>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><i className="fas fa-minus"></i></button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                  <span className="cart-item-total">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <span className="cart-remove fas fa-times" onClick={() => removeFromCart(item.id)}></span>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>Rs.{getCartTotal().toLocaleString()}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>Rs.{getCartTotal().toLocaleString()}</span>
            </div>
          </div>
          <button className="btn checkout-btn" onClick={onClose}>
            <i className="fas fa-lock"></i> Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
