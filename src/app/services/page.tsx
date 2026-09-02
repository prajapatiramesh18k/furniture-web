'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import CloseButton from '@/components/CloseButton';
import { marketingServices } from '@/lib/marketing-services';
import { services as legacyServices } from '@/lib/services-data';

export default function ServicesPage() {
  useEffect(() => {
    document.title = 'Furniture Services in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture';
  }, []);

  return (
    <div className="services-page">
      <div className="services-page-hero">
        <CloseButton href="/" />
        <h1>
          Our <span>Services</span>
        </h1>
        <p>
          Custom furniture, modular kitchens, wardrobes and interiors for Mumbai, Navi Mumbai &amp;
          Thane — plus Ahmedabad (Bopal). Free site visit and 3D design consultation.
        </p>
      </div>

      <div className="services-page-grid">
        {marketingServices.map((service) => (
          <div key={service.slug} className="services-page-card">
            <div className="services-page-card-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={service.image} alt={`${service.name} in Mumbai, Navi Mumbai & Thane`} />
            </div>
            <div className="services-page-card-body">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <Link href={`/${service.slug}`} className="btn">
                Learn more
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <div className="services-cta-text">
          <h2>Need Help Choosing the Right Service?</h2>
          <p>Get a free 3D design consultation and site visit — WhatsApp or call us today.</p>
          <Link href="/contact" className="btn">
            Get Free 3D Design
          </Link>
        </div>
      </div>

      <div className="services-page-hero" style={{ marginTop: '3rem' }}>
        <h2>
          Additional <span>support</span>
        </h2>
        <p>Repair, delivery and consultation services.</p>
      </div>
      <div className="services-page-grid">
        {legacyServices.map((service) => (
          <div key={service.id} className="services-page-card">
            <div className="services-page-card-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </div>
  );
}
