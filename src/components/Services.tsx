'use client';
import Link from 'next/link';
import { marketingServices } from '@/lib/marketing-services';

export default function Services() {
  return (
    <section className="services" id="services">
      <h2 className="heading">
        our <span> services</span>
      </h2>
      <p className="services-subtitle" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
        Manufacturing, modular work, repair, polishing, upholstery &amp; more for Mumbai, Thane &amp; Ahmedabad — free site visit &amp; consultation
      </p>
      <div className="box-container">
        {marketingServices.slice(0, 8).map((service) => (
          <div key={service.slug} className="box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.image} alt={`${service.name} — Ananya House of Furniture`} loading="lazy" decoding="async" />
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <Link href={`/${service.slug}`} className="btn">
              Learn more
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
