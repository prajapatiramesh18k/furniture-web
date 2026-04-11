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
          <i className="fas fa-shopping-cart"></i>
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
        <h1>Your <span>Cart</span></h1>
        <p>{cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-page-layout">
        {/* Items List */}
        <div className="cart-page-items">
          <div className="cart-page-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="cart-page-item">
              <div className="cpi-product">
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>Rs.{item.price.toLocaleString()} each</p>
                </div>
              </div>
              <div className="cpi-price">Rs.{item.price.toLocaleString()}</div>
              <div className="cpi-qty">
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="cpi-total">Rs.{(item.price * item.quantity).toLocaleString()}</div>
              <div className="cpi-remove">
                <button onClick={() => removeFromCart(item.id)} className="fas fa-trash-alt"></button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-page-summary">
          <h2>Order Summary</h2>
          <div className="cps-row">
            <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>Rs.{subtotal.toLocaleString()}</span>
          </div>
          <div className="cps-row">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? <strong style={{ color: '#2ecc71' }}>FREE</strong> : `Rs.${deliveryCharge.toLocaleString()}`}</span>
          </div>
          {deliveryCharge > 0 && (
            <p className="cps-delivery-note">
              <i className="fas fa-info-circle"></i> Free delivery on orders above Rs.5,000
            </p>
          )}
          <div className="cps-total">
            <span>Total</span>
            <span>Rs.{total.toLocaleString()}</span>
          </div>
          <button className="btn cps-checkout-btn" onClick={() => router.push('/checkout')}>
            <i className="fas fa-lock"></i> Proceed to Checkout
          </button>
          <Link href="/products" className="cps-continue">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
