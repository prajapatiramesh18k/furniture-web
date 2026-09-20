'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const SubmitReview = dynamic(() => import('@/components/SubmitReview'), { ssr: false });

// Stable auth state restored from sessionStorage on first load
function getSessionAuth(): { name: string; email: string; isAdmin: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('auth-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSessionAuth(user: { name: string; email: string; isAdmin: boolean } | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem('auth-user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('auth-user');
    }
  } catch {}
}

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Packages', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'Get Quotation', href: '/quotation-maker' },
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
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(() => getSessionAuth() !== null);
  const [authUser, setAuthUser] = useState<{ name: string; email: string; isAdmin: boolean; role?: string } | null>(() => getSessionAuth());
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
  }, [getCartCount, getWishlistCount]);

  // Listen for auth changes (login/logout) — auth state is already initialized from sessionStorage
  useEffect(() => {
    const handleAuthChange = () => {
      const sessionUser = getSessionAuth();
      if (sessionUser) {
        setUserLoggedIn(true);
        setAuthUser(sessionUser);
      } else {
        setUserLoggedIn(false);
        setAuthUser(null);
      }
    };
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

  // Debounced search with request cancellation
  useEffect(() => {
    if (searchTimeoutRef.current !== null) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const controller = new AbortController();
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSearchResults((data.products || []).slice(0, 6));
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') setSearchResults([]);
      }
      setSearchLoading(false);
    }, 300);
    return () => {
      controller.abort();
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

  const handleAccountClick = () => {
    if (!userLoggedIn || !authUser) {
      router.push('/login');
      return;
    }
    const role = String((authUser as { role?: string }).role || (authUser.isAdmin ? 'admin' : 'customer')).toLowerCase();
    router.push(role === 'customer' ? '/account' : '/admin/dashboard');
  };

  return (
    <>
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
            <span className="logo-sub">House of Furniture Pvt Ltd.</span>
          </span>
        </Link>
        <nav className={`navbar ${menuOpen ? 'active' : ''}`} id="navbar" aria-label="Primary">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                suppressHydrationWarning
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'active' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="icons">
          {/* Inline Search Box */}
          <div className="nav-search-wrapper" ref={searchRef}>
            <form onSubmit={handleSearch} className="nav-search-form" role="search">
              <i aria-hidden="true" className="fas fa-search nav-search-icon"></i>
              <label className="sr-only" htmlFor="nav-search">Search furniture</label>
              <input
                id="nav-search"
                type="search"
                autoComplete="off"
                className="nav-search-input"
                placeholder="Search furniture..."
                aria-label="Search furniture"
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
                        <img src={product.image} alt="" width={48} height={48} loading="lazy" decoding="async" />
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

          <button
            type="button"
            id="cart-btn"
            className="fas fa-shopping-cart"
            aria-label={`Open cart, ${cartCount} items`}
            aria-expanded={cartOpen}
            onClick={() => { setCartOpen(!cartOpen); setWishlistOpen(false); }}
          >
            <span id="cart-count" suppressHydrationWarning style={{ display: mounted && cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
          </button>
          <button
            id="account-btn"
            className="fas fa-user"
            onClick={handleAccountClick}
            aria-label="Account"
          />
          <button
            type="button"
            id="menu-btn"
            className="fas fa-bars"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="navbar"
            onClick={() => setMenuOpen(!menuOpen)}
          ></button>
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
                <img src={item.image} alt={item.name} width={80} height={80} loading="lazy" decoding="async" />
                <div className="content">
                  <h3>{item.name}</h3>
                  <div className="price-cart-row">
                    <span className="cart-item-price">Rs.{item.price.toLocaleString()}</span>
                    <div className="qty-controls">
                      <button type="button" className="qty-btn" aria-label={`Decrease quantity of ${item.name}`} onClick={() => updateQuantity(item.id, -1)}><i aria-hidden="true" className="fas fa-minus"></i></button>
                      <span className="qty-value">{item.quantity}</span>
                      <button type="button" className="qty-btn" aria-label={`Increase quantity of ${item.name}`} onClick={() => updateQuantity(item.id, 1)}><i aria-hidden="true" className="fas fa-plus"></i></button>
                    </div>
                  </div>
                  <span className="cart-item-total">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <button type="button" className="cart-remove fas fa-times" aria-label={`Remove ${item.name} from cart`} onClick={() => removeFromCart(item.id)}></button>
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
                <img src={item.image} alt={item.name} width={80} height={80} loading="lazy" decoding="async" />
                <div className="content">
                  <h3>{item.name}</h3>
                  <span className="cart-item-price">Rs.{item.price.toLocaleString()}</span>
                </div>
                <div className="wishlist-actions">
                  <button type="button" className="qty-btn" onClick={() => handleAddToCart(item)} title="Add to cart" aria-label={`Move ${item.name} to cart`}>
                    <i aria-hidden="true" className="fas fa-shopping-cart"></i>
                  </button>
                  <button type="button" className="cart-remove fas fa-times" aria-label={`Remove ${item.name} from wishlist`} onClick={() => removeFromWishlist(item.id)}></button>
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
