'use client';
import Link from 'next/link';
import CloseButton from '@/components/CloseButton';
import { services } from '@/lib/services-data';

export default function ServicesPage() {
  return (
    <div className="services-page">
      <div className="services-page-hero">
        <CloseButton href="/" />
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
