'use client';
import Link from 'next/link';
import { services } from '@/lib/services-data';

export default function Services() {
  return (
    <section className="services" id="services">
      <h1 className="heading">our <span> services</span></h1>
      <div className="box-container">
        {services.map((service) => (
          <div key={service.id} className="box">
            <img src={service.image} alt={service.name} />
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <Link href={`/services/${service.slug}`} className="btn">
              read more
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
