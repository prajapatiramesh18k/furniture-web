'use client';
import Link from 'next/link';
import { services } from '@/lib/services-data';

export default function ServicesPage() {
  return (
    <div className="services-page">
      <button className="sr-back services-page-back" onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <div className="services-page-hero">
        <h1>Our <span>Services</span></h1>
        <p>From custom furniture design to restoration, we offer everything you need to furnish and care for your home beautifully.</p>
      </div>

      <div className="services-page-grid">
        {services.map((service) => (
          <div key={service.id} className="services-page-card">
            <div className="services-page-card-img">
              <img src={service.image} alt={service.name} />
            </div>
            <div className="services-page-card-body">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <Link href={`/services/${service.slug}`} className="btn">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <h2>Need Help Choosing the Right Service?</h2>
        <p>Our team is ready to assist you with custom designs, free consultations, and expert advice.</p>
        <Link href="/contact" className="btn">Contact Us</Link>
      </div>
    </div>
  );
}
