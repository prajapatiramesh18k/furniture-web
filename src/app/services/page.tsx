import type { Metadata } from 'next';
import { Suspense } from 'react';
import ServicesPageClient from '@/components/ServicesPageClient';
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

export const revalidate = 60;

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
    <>
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <Suspense
        fallback={
          <div className="gallery-redesign services-redesign">
            <div className="gal-body gal-body-top">
              <div className="gallery-page-grid">
                {marketingServices.slice(0, 4).map((service) => (
                  <div key={service.slug} className="gal-card">
                    <div className="gal-card-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={service.image} alt={service.name} loading="lazy" width={640} height={440} />
                    </div>
                    <div className="gal-card-foot">
                      <div>
                        <h3>{service.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ServicesPageClient services={marketingServices} />
      </Suspense>
    </>
  );
}
