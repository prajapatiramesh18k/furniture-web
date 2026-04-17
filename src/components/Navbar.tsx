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
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
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
    if (sessionStorage.getItem('bannerClosed') === 'true') {
      setBannerVisible(false);
    }
  }, [getCartCount, getWishlistCount]);

  // Check auth status on mount and listen for auth changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUserLoggedIn(true);
          setUserName(data.user.name || '');
        } else {
          setUserLoggedIn(false);
          setUserName('');
        }
      } catch (err) {
        setUserLoggedIn(false);
        setUserName('');
      }
    };
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.log('Logout failed');
    }
    setUserLoggedIn(false);
    setUserName('');
    window.dispatchEvent(new Event('auth-change'));
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

          <div id="cart-btn" className="fas fa-shopping-cart" onClick={() => { setCartOpen(!cartOpen); setAccountOpen(false); setWishlistOpen(false); }}>
            <span id="cart-count" suppressHydrationWarning style={{ display: mounted && cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
          </div>
          <button
            id="account-btn"
            className="fas fa-user"
            onClick={() => { setAccountOpen(!accountOpen); setCartOpen(false); setWishlistOpen(false); }}
            aria-label="Account"
          />
          <div id="menu-btn" className="fas fa-bars" onClick={() => setMenuOpen(!menuOpen)}></div>
        </div>
      </header>

      {reviewOpen && <SubmitReview onClose={() => setReviewOpen(false)} />}
      {cartOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setCartOpen(false)} />
          <CartSidebar onClose={() => setCartOpen(false)} />
        </>
      )}
      {wishlistOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setWishlistOpen(false)} />
          <WishlistSidebar onClose={() => setWishlistOpen(false)} />
        </>
      )}
      {accountOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setAccountOpen(false)} />
          <AccountSidebar onClose={() => setAccountOpen(false)} onOpenCart={() => { setAccountOpen(false); setCartOpen(true); }} onOpenWishlist={() => { setAccountOpen(false); setWishlistOpen(true); }} />
        </>
      )}
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
    <div className="cart-items-container active sidebar-panel" id="cart-items-container">
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

function AccountSidebar({ onClose, onOpenCart, onOpenWishlist }: {
  onClose: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUserLoggedIn(true);
          setUserName(data.user.name || '');
          setUserEmail(data.user.email || '');
          setIsAdmin(data.user.isAdmin || false);
        } else {
          setUserLoggedIn(false);
          setUserName('');
          setUserEmail('');
          setIsAdmin(false);
        }
      } catch (err) {
        setUserLoggedIn(false);
        setIsAdmin(false);
      }
    };
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.log('Logout failed');
    }
    setUserLoggedIn(false);
    setUserName('');
    setUserEmail('');
    setIsAdmin(false);
    window.dispatchEvent(new Event('auth-change'));
    onClose();
    router.push('/');
  };

  const handleWishlist = () => {
    onClose();
    onOpenWishlist();
  };

  const handleCart = () => {
    onClose();
    onOpenCart();
  };

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="account-sidebar sidebar-panel active">
      <div className="account-sidebar-header">
        <h3>My Account</h3>
        <button className="account-sidebar-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {!mounted ? null : userLoggedIn ? (
        <>
          <div className="account-user-info">
            <div className="account-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="account-user-details">
              <h4>{userName || 'User'}</h4>
              <p>{userEmail}</p>
            </div>
          </div>

          <div className="account-menu">
            {isAdmin && (
              <button className="account-menu-item" onClick={() => navigateTo('/admin')}>
                <div className="account-menu-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span>Admin Panel</span>
                <i className="fas fa-chevron-right account-menu-arrow"></i>
              </button>
            )}
            <button className="account-menu-item" onClick={() => navigateTo('/orders')}>
              <div className="account-menu-icon">
                <i className="fas fa-box"></i>
              </div>
              <span>My Orders</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
            <button className="account-menu-item" onClick={handleWishlist}>
              <div className="account-menu-icon">
                <i className="fas fa-heart"></i>
              </div>
              <span>Wishlist</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
            <button className="account-menu-item" onClick={handleCart}>
              <div className="account-menu-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <span>Cart</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
            <button className="account-menu-item" onClick={() => navigateTo('/contact')}>
              <div className="account-menu-icon">
                <i className="fas fa-headset"></i>
              </div>
              <span>Help & Support</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
          </div>

          <div className="account-footer">
            <button className="account-logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="account-guest-content">
            <div className="account-avatar account-avatar-guest">
              <i className="fas fa-user-circle"></i>
            </div>
            <h4>Welcome, Guest!</h4>
            <p>Sign in to access your orders and preferences</p>
            <button className="account-login-btn" onClick={() => navigateTo('/login')}>
              <i className="fas fa-sign-in-alt"></i>
              Login / Sign Up
            </button>
          </div>

          <div className="account-menu">
            <button className="account-menu-item" onClick={handleCart}>
              <div className="account-menu-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <span>Cart</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
            <button className="account-menu-item" onClick={handleWishlist}>
              <div className="account-menu-icon">
                <i className="fas fa-heart"></i>
              </div>
              <span>Wishlist</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
            <button className="account-menu-item" onClick={() => navigateTo('/contact')}>
              <div className="account-menu-icon">
                <i className="fas fa-headset"></i>
              </div>
              <span>Help & Support</span>
              <i className="fas fa-chevron-right account-menu-arrow"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function WishlistSidebar({ onClose }: { onClose: () => void }) {
  const { wishlist, removeFromWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (item: any) => {
    addToCart({ ...item, quantity: 1 });
    removeFromWishlist(item.id);
  };

  return (
    <div className="cart-items-container active sidebar-panel" id="wishlist-sidebar">
      {wishlist.length === 0 ? (
        <div className="cart-empty">
          <i className="fas fa-heart" style={{ fontSize: '5rem', color: '#ccc', marginBottom: '1rem' }}></i>
          <p style={{ fontSize: '1.6rem', color: 'var(--light-black)' }}>Your wishlist is empty</p>
          <p style={{ fontSize: '1.3rem', color: '#999', marginTop: '0.5rem' }}>Save items you love here</p>
          <button className="btn" style={{ marginTop: '1.5rem' }} onClick={() => { onClose(); router.push('/products'); }}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
            My Wishlist ({getWishlistCount()})
          </h2>
          <div className="cart-items-list">
            {wishlist.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="content">
                  <h3>{item.name}</h3>
                  <span className="cart-item-price">Rs.{item.price.toLocaleString()}</span>
                </div>
                <div className="wishlist-actions">
                  <button className="qty-btn" onClick={() => handleAddToCart(item)} title="Add to cart">
                    <i className="fas fa-shopping-cart"></i>
                  </button>
                  <button className="cart-remove fas fa-times" onClick={() => removeFromWishlist(item.id)}></button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn checkout-btn" onClick={() => { onClose(); router.push('/wishlist'); }}>
            View Full Wishlist
          </button>
        </>
      )}
    </div>
  );
}
