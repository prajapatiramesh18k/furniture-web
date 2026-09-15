import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CloseButton from '@/components/CloseButton';
import { JsonLd } from '@/components/JsonLd';
import { marketingServices } from '@/lib/marketing-services';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Furniture Services in Mumbai, Navi Mumbai & Thane',
  description:
    'Custom furniture, modular kitchens, wardrobes, TV units and interiors for Mumbai, Navi Mumbai & Thane — plus Ahmedabad (Bopal). Free site visit and 3D design consultation.',
  alternates: { canonical: absoluteUrl('/services') },
  openGraph: {
    title: 'Furniture Services | Ananya House of Furniture',
    description:
      'Custom furniture, modular kitchens, wardrobes and interiors for Mumbai, Navi Mumbai & Thane. Free site visit + 3D design consultation.',
    url: absoluteUrl('/services'),
    type: 'website',
  },
};

export const revalidate = 3600;

const CARD_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px';

export default function ServicesPage() {
  const schemas = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Furniture services',
      itemListElement: marketingServices.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.name,
        url: absoluteUrl(`/${s.slug}`),
      })),
    },
  ];

  return (
    <div className="services-page">
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

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
        {marketingServices.map((service, idx) => (
          <Link
            key={service.slug}
            href={`/${service.slug}`}
            className="services-page-card"
            aria-label={`Learn more about ${service.name}`}
          >
            <div className="services-page-card-img">
              <Image
                src={service.image}
                alt={`${service.name} in Mumbai, Navi Mumbai & Thane`}
                width={640}
                height={440}
                sizes={CARD_SIZES}
                loading={idx < 2 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
            </div>
            <div className="services-page-card-body">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <span className="btn" aria-hidden="true">
                Learn more
              </span>
            </div>
          </Link>
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
    </div>
  );
}
