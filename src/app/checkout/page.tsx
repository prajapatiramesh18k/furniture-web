'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CloseButton from '@/components/CloseButton';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', phone: '', email: '', address: '', city: '', pincode: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + deliveryCharge;

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && cart.length === 0) {
      router.replace('/cart');
    }
  }, [mounted, cart.length, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) return 'Please enter your name.';
    if (!customerInfo.phone.trim() || !/^\d{10}$/.test(customerInfo.phone)) return 'Please enter a valid 10-digit phone number.';
    if (!customerInfo.address.trim()) return 'Please enter your address.';
    if (!customerInfo.city.trim()) return 'Please enter your city.';
    if (!customerInfo.pincode.trim() || !/^\d{6}$/.test(customerInfo.pincode)) return 'Please enter a valid 6-digit pincode.';
    return '';
  };

  const handlePayNow = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Step 1: Create Razorpay order on server
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100, // convert to paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const { orderId } = await res.json();

      // Step 2: Open Razorpay Checkout
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXX';

      const options = {
        key: razorpayKey,
        amount: total * 100,
        currency: 'INR',
        name: 'Ananya House of Furniture',
        description: `Order for ${cart.length} item(s)`,
        order_id: orderId,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email || undefined,
          contact: customerInfo.phone,
        },
        handler: async (response: any) => {
          // Step 3: Save order to database
          try {
            const saveRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerInfo,
                items: cart,
                total,
                paymentMethod: 'Razorpay',
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              }),
            });

            if (!saveRes.ok) throw new Error('Failed to save order');
            const savedOrder = await saveRes.json();

            // Clear cart and redirect
            clearCart();
            const params = new URLSearchParams({
              orderId: savedOrder.id || savedOrder._id || orderId,
              name: customerInfo.name,
              total: String(total),
            });
            router.push(`/order-confirmation?${params}`);
          } catch {
            setError('Payment was successful but order save failed. Please contact us with your payment ID: ' + response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted || cart.length === 0) {
    return (
      <div className="checkout-page">
        <CloseButton href="/cart" />
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <p style={{ color: '#999', fontSize: '1.6rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <CloseButton href="/cart" />

      <div className="checkout-page-hero">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        {/* Left: Customer Form */}
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>

          {error && (
            <div className="checkout-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="checkout-form-grid">
            <div className="cf-field full">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="cf-field">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={customerInfo.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="cf-field">
              <label htmlFor="email">Email (optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={customerInfo.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="cf-field full">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                placeholder="House no., street, area"
                rows={3}
                value={customerInfo.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="cf-field">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="e.g. Mumbai"
                value={customerInfo.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="cf-field">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                value={customerInfo.pincode}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary + Payment */}
        <div className="checkout-summary-section">
          <h2>Order Summary</h2>

          <div className="cos-items">
            {cart.map((item) => (
              <div key={item.id} className="cos-item">
                <img src={item.image} alt={item.name} />
                <div className="cos-item-info">
                  <span className="cos-item-name">{item.name}</span>
                  <span className="cos-item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="cos-item-price">Rs.{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="cos-divider"></div>

          <div className="cos-row">
            <span>Subtotal</span>
            <span>Rs.{subtotal.toLocaleString()}</span>
          </div>
          <div className="cos-row">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? <strong style={{ color: '#2ecc71' }}>FREE</strong> : `Rs.${deliveryCharge.toLocaleString()}`}</span>
          </div>
          <div className="cos-total">
            <span>Total to Pay</span>
            <span>Rs.{total.toLocaleString()}</span>
          </div>

          <button
            className="btn cos-pay-btn"
            onClick={handlePayNow}
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Processing...</>
            ) : (
              <><i className="fas fa-lock"></i> Pay Now</>
            )}
          </button>

          <div className="cos-payment-icons">
            <span>Secure payment via</span>
            <div className="cos-payment-methods">
              <span><i className="fas fa-mobile-alt"></i> UPI</span>
              <span><i className="fas fa-credit-card"></i> Cards</span>
              <span><i className="fas fa-wallet"></i> Wallets</span>
              <span><i className="fas fa-university"></i> Net Banking</span>
            </div>
          </div>

          <p className="cos-note">
            <i className="fas fa-shield-alt"></i> Your payment is secured by Razorpay
          </p>

          <Link href="/cart" className="cos-back-link">
            <i className="fas fa-arrow-left"></i> Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
