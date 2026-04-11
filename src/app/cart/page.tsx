'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CloseButton from '@/components/CloseButton';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <CloseButton href="/" />
        <div className="cart-empty-page">
          <div className="cart-empty-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <CloseButton href="/" />

      <div className="cart-page-hero">
        <h1>Shopping <span>Cart</span></h1>
        <p>{cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-page-container">
        {/* Items Section */}
        <div className="cart-page-items-section">
          <div className="cart-page-items-header">
            <span>Product Details</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cic-left">
                <div className="cic-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cic-info">
                  <h3>{item.name}</h3>
                  <p className="cic-unit-price">Rs.{item.price.toLocaleString()} / unit</p>
                </div>
              </div>
              <div className="cic-price">Rs.{item.price.toLocaleString()}</div>
              <div className="cic-qty">
                <div className="qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="cic-total">Rs.{(item.price * item.quantity).toLocaleString()}</div>
              <button className="cic-remove" onClick={() => removeFromCart(item.id)} title="Remove item">
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}

          <div className="cart-page-items-footer">
            <Link href="/products" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="cart-page-summary-section">
          <div className="cart-summary-card">
            <h2>Order Summary</h2>

            <div className="csc-row">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>Rs.{subtotal.toLocaleString()}</span>
            </div>
            <div className="csc-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? (
                  <span className="csc-free">FREE</span>
                ) : (
                  `Rs.${deliveryCharge.toLocaleString()}`
                )}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <div className="csc-delivery-note">
                <i className="fas fa-truck"></i>
                <span>Add Rs.{(5000 - subtotal).toLocaleString()} more for FREE delivery</span>
              </div>
            )}

            <div className="csc-divider"></div>

            <div className="csc-total-row">
              <span>Total</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>

            <button
              className="btn csc-checkout-btn"
              onClick={() => router.push('/checkout')}
            >
              <i className="fas fa-lock"></i> Proceed to Checkout
            </button>

            <div className="csc-secure-note">
              <i className="fas fa-shield-alt"></i>
              <span>Secure 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Promo banner */}
          <div className="csc-promo-card">
            <div className="csc-promo-icon">
              <i className="fas fa-gift"></i>
            </div>
            <div>
              <strong>Free Delivery</strong>
              <p>On all orders above Rs.5,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
