'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import SubmitReview from '@/components/SubmitReview';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Design Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

interface SearchProduct {
  id: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

export default function Navbar() {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wait for client mount before rendering cart/wishlist count
  useEffect(() => {
    setMounted(true);
    setCartCount(getCartCount());
    setWishlistCount(getWishlistCount());
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') setAdminLoggedIn(true);
    if (sessionStorage.getItem('bannerClosed') === 'true') {
      setBannerVisible(false);
    }
  }, [getCartCount, getWishlistCount]);

  useEffect(() => {
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current !== null) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults((data.products || []).slice(0, 6));
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 300);
    return () => {
      if (searchTimeoutRef.current !== null) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowResults(false);
    }
  };

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
      {mounted && bannerVisible && (
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
        <Link href="/" className="logo">
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
        </Link>
        <nav className={`navbar ${menuOpen ? 'active' : ''}`} id="navbar">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              suppressHydrationWarning
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {adminLoggedIn ? (
            <>
              <Link href="/admin">Admin</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link href="/login" suppressHydrationWarning>Login</Link>
          )}
        </nav>
        <div className="icons">
          {/* Inline Search Box */}
          <div className="nav-search-wrapper" ref={searchRef}>
            <form onSubmit={handleSearch} className="nav-search-form">
              <i className="fas fa-search nav-search-icon"></i>
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
            </form>
            {showResults && searchQuery.trim() && (
              <div className="nav-search-results">
                {searchLoading ? (
                  <div className="nav-search-hint">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="nav-search-item"
                        onClick={() => {
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                      >
                        <img src={product.image} alt={product.name} />
                        <div className="nav-search-item-info">
                          <span className="nav-search-item-name">{product.name}</span>
                          <span className="nav-search-item-price">Rs.{product.price.toLocaleString()}</span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?q=${encodeURIComponent(searchQuery)}`}
                      className="nav-search-viewall"
                      onClick={() => {
                        setSearchQuery('');
                        setShowResults(false);
                      }}
                    >
                      View all results for "{searchQuery}"
                    </Link>
                  </>
                ) : (
                  <div className="nav-search-hint">No products found</div>
                )}
              </div>
            )}
          </div>

          <div id="cart-btn" className="fas fa-shopping-cart" onClick={() => setCartOpen(!cartOpen)}>
            <span id="cart-count" suppressHydrationWarning style={{ display: mounted && cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
          </div>
          <Link id="wishlist-btn" className="fas fa-heart" href="/wishlist">
            <span style={{ display: mounted && wishlistCount > 0 ? 'flex' : 'none' }}>{wishlistCount}</span>
          </Link>
          <Link id="account-btn" className="fas fa-user" href="/login"></Link>
          <div id="menu-btn" className="fas fa-bars" onClick={() => setMenuOpen(!menuOpen)}></div>
        </div>
      </header>

      {reviewOpen && <SubmitReview onClose={() => setReviewOpen(false)} />}
      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
    </>
  );
}

function CartSidebar({ onClose }: { onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <div className="cart-items-container active" id="cart-items-container">
      <button className="cart-sidebar-close fas fa-times" onClick={onClose} aria-label="Close cart"></button>
      {cart.length === 0 ? (
        <div className="cart-empty">
          <i className="fas fa-shopping-cart" style={{ fontSize: '5rem', color: '#ccc', marginBottom: '1rem' }}></i>
          <p style={{ fontSize: '1.6rem', color: 'var(--light-black)' }}>Your cart is empty</p>
          <p style={{ fontSize: '1.3rem', color: '#999', marginTop: '0.5rem' }}>Add products to get started</p>
          <Link href="/products" className="btn" style={{ marginTop: '1.5rem' }}>Shop Now</Link>
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
          <button className="btn checkout-btn" onClick={handleCheckout}>
            <i className="fas fa-lock"></i> Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
