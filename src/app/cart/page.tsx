'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CloseButton from '@/components/CloseButton';
import NavbarWrapper from '@/components/NavbarWrapper';

const categoryLabels: Record<string, string> = {
  'bedroom': 'Bedroom',
  'living-room': 'Living Room',
  'dining-room': 'Dining Room',
  'office': 'Office',
  'entryway': 'Entryway',
  'kids-room': 'Kids Room',
  'pooja-unit': 'Pooja Unit',
  'kitchen': 'Kitchen',
  'sofa': 'Sofa',
  'chair': 'Chair',
  'table': 'Table',
  'bed': 'Bed',
  'storage': 'Storage',
  'decor': 'Decor',
};

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  useEffect(() => {
    document.title = 'Ananya House of Furniture | Cart';
  }, []);

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 5000 ? 0 : 500;
  const gst = Math.round(subtotal * 0.12);
  const total = subtotal + deliveryCharge + gst;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <NavbarWrapper />
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

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="cart-page">
      <NavbarWrapper />
      {/* Hero Banner */}
      <div className="cart-hero-banner">
        <div className="cart-hero-content">
          <h1>Your Cart <span>({totalItems} item{totalItems !== 1 ? 's' : ''})</span></h1>
          <p>Review your selected furniture before checkout</p>
        </div>
      </div>

      <div className="cart-page-container">
        {/* Items Section */}
        <div className="cart-page-items-section">
          {/* Table Header */}
          <div className="cart-table-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {/* Cart Items */}
          {cart.map((item) => (
            <div key={item.id} className="cart-row-item">
              <div className="cri-product">
                <div className="cri-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cri-info">
                  <p className="cri-category">{categoryLabels[item.id] || 'Furniture'}</p>
                  <h3>{item.name}</h3>
                  <p className="cri-unit">Rs.{item.price.toLocaleString()} / unit</p>
                </div>
              </div>
              <div className="cri-price">Rs.{item.price.toLocaleString()}</div>
              <div className="cri-qty">
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
              <div className="cri-total">Rs.{(item.price * item.quantity).toLocaleString()}</div>
              <button className="cri-remove" onClick={() => removeFromCart(item.id)} title="Remove">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}

          {/* Footer */}
          <div className="cart-table-footer">
            <Link href="/products" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-page-summary-section">
          <div className="order-summary-card">
            <h2>Order Summary</h2>

            <div className="osc-row">
              <span>Subtotal ({totalItems} items)</span>
              <span>Rs.{subtotal.toLocaleString()}</span>
            </div>
            <div className="osc-row">
              <span>GST (12%)</span>
              <span>Rs.{gst.toLocaleString()}</span>
            </div>
            <div className="osc-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? (
                  <span className="osc-free">FREE</span>
                ) : (
                  `Rs.${deliveryCharge.toLocaleString()}`
                )}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <div className="osc-delivery-note">
                <i className="fas fa-info-circle"></i>
                <span>Add Rs.{(5000 - subtotal).toLocaleString()} more for FREE delivery</span>
              </div>
            )}

            {/* Coupon */}
            <div className="osc-coupon-row">
              <input className="osc-coupon-input" type="text" placeholder="Enter coupon code" />
              <button className="osc-apply-btn">Apply</button>
            </div>

            <div className="osc-divider"></div>

            <div className="osc-total">
              <span>Total</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>

            <button
              className="btn osc-checkout-btn"
              onClick={() => router.push('/checkout')}
            >
              <i className="fas fa-lock"></i> Proceed to Checkout
            </button>

            <div className="osc-secure">
              <i className="fas fa-shield-alt"></i>
              <span>Secure &amp; Encrypted</span>
            </div>
          </div>

          {/* Delivery Promise */}
          <div className="delivery-promise">
            <div className="dp-item">
              <i className="fas fa-truck"></i>
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above Rs.5,000</p>
              </div>
            </div>
            <div className="dp-item">
              <i className="fas fa-undo"></i>
              <div>
                <strong>Easy Returns</strong>
                <p>7-day return policy</p>
              </div>
            </div>
            <div className="dp-item">
              <i className="fas fa-headset"></i>
              <div>
                <strong>24/7 Support</strong>
                <p>Call us anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
