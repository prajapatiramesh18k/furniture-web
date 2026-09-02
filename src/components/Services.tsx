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
        Modular kitchens, wardrobes, TV units &amp; custom furniture for Mumbai, Navi Mumbai &amp; Thane
      </p>
      <div className="box-container">
        {marketingServices.map((service) => (
          <div key={service.slug} className="box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.image} alt={`${service.name} — Ananya House of Furniture`} />
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
