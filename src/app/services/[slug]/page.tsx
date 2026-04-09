import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services } from '@/lib/services-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.name} | Ananya House of Furniture`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const otherServices = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <div className="service-detail-page">
      <Link href="/services" className="sr-back service-detail-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </Link>

      <div className="service-detail-hero">
        <div className="service-detail-img">
          <img src={service.image} alt={service.name} />
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
                  <i className="fas fa-check"></i>
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
              <i className="fas fa-phone"></i> Call Now
            </a>
            <Link href="/contact" className="btn btn-outline">
              <i className="fas fa-envelope"></i> Contact Us
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
                <img src={s.image} alt={s.name} />
                <h4>{s.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
