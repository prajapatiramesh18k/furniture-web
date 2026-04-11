'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import NavbarWrapper from '@/components/NavbarWrapper';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'N/A';
  const name = searchParams.get('name') || 'Customer';
  const total = searchParams.get('total') || '0';

  return (
    <div className="order-confirmation-page">
      <div className="oc-success-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <h1>Order Placed Successfully!</h1>
      <p className="oc-thank-you">Thank you, {decodeURIComponent(name)}!</p>

      <div className="oc-details">
        <div className="oc-detail-row">
          <span>Order ID</span>
          <strong>{orderId}</strong>
        </div>
        <div className="oc-detail-row">
          <span>Total Paid</span>
          <strong>Rs.{Number(total).toLocaleString()}</strong>
        </div>
        <div className="oc-detail-row">
          <span>Status</span>
          <span className="oc-status-badge">Payment Confirmed</span>
        </div>
      </div>

      <p className="oc-message">
        We've received your order and will contact you shortly to confirm delivery details.
      </p>

      <div className="oc-actions">
        <Link href="/" className="btn">Continue Shopping</Link>
        <a href={`https://wa.me/919321812823?text=Hi%2C%20I%20just%20placed%20order%20${orderId}`} target="_blank" rel="noopener noreferrer" className="btn oc-whatsapp-btn">
          <i className="fab fa-whatsapp"></i> Chat with Us
        </a>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="order-confirmation-wrapper">
      <NavbarWrapper />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem' }}>Loading...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  );
}
