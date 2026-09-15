import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services } from '@/lib/services-data';
import CloseButton from '@/components/CloseButton';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/json-ld';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  const path = `/services/${service.slug}`;
  return {
    title: `${service.name} | Ananya House of Furniture`,
    description: service.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${service.name} | Ananya House of Furniture`,
      description: service.description,
      url: absoluteUrl(path),
      type: 'website',
      images: [{ url: service.image, alt: service.name }],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const otherServices = services.filter((s) => s.slug !== slug).slice(0, 3);
  const path = `/services/${service.slug}`;

  const schemas = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: service.name, path },
    ]),
    serviceJsonLd({
      name: service.name,
      description: service.description,
      path,
    }),
  ];

  return (
    <div className="service-detail-page">
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <div className="service-detail-hero">
        <CloseButton href="/services" />
        <div className="service-detail-img">
          <Image
            src={service.image}
            alt={service.name}
            width={900}
            height={620}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="service-detail-intro">
          <h1>{service.name}</h1>
          <p>{service.description}</p>
        </div>
      </div>

      <div className="service-detail-body">
        <div className="service-detail-main">
          <h2>About This Service</h2>
          <p className="service-detail-full-desc">{service.fullDescription}</p>

          <div className="service-detail-features">
            <h3>What We Offer</h3>
            <ul>
              {service.features.map((feature, i) => (
                <li key={i}>
                  <i className="fas fa-check" aria-hidden="true"></i>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="service-detail-sidebar">
          <div className="service-detail-cta">
            <h3>Get a Free Quote</h3>
            <p>Ready to start? Contact us for a free consultation.</p>
            <a href="tel:+919321812823" className="btn">
              <i className="fas fa-phone" aria-hidden="true"></i> Call Now
            </a>
            <Link href="/contact" className="btn btn-outline">
              <i className="fas fa-envelope" aria-hidden="true"></i> Contact Us
            </Link>
          </div>
        </div>
      </div>

      {otherServices.length > 0 && (
        <div className="service-detail-related">
          <h2>Other Services</h2>
          <div className="service-detail-related-grid">
            {otherServices.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="service-related-card">
                <Image
                  src={s.image}
                  alt={s.name}
                  width={480}
                  height={320}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  decoding="async"
                />
                <h4>{s.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
