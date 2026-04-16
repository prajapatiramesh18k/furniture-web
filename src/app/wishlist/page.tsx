'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import CloseButton from '@/components/CloseButton';

export default function WishlistPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | Wishlist';
  }, []);

  const { wishlist, removeFromWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const count = getWishlistCount();

  const handleAddToCart = (item: any) => {
    addToCart({ ...item, quantity: 1 });
    removeFromWishlist(item.id);
  };

  return (
    <div className="wishlist-page">
      <CloseButton href="/" />

      <div className="wishlist-page-hero">
        <h1>My <span>Wishlist</span></h1>
        <p>{count} {count === 1 ? 'item' : 'items'} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <i className="far fa-heart"></i>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon on any product.</p>
          <Link href="/products" className="btn">Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-card">
              <div className="wishlist-card-img">
                <img src={item.image} alt={item.name} />
                <button
                  className="wishlist-remove"
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label="Remove from wishlist"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="wishlist-card-body">
                <h3>{item.name}</h3>
                <p className="wishlist-price">Rs.{Number(item.price).toLocaleString()}</p>
                <div className="wishlist-actions">
                  <button className="btn" onClick={() => handleAddToCart(item)}>
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                  <Link href={`/products/${item.slug || item.id}`} className="btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
