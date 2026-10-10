'use client';

import Link from 'next/link';
import Image from 'next/image';
import CloseButton from '@/components/CloseButton';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';
import type { MarketingService } from '@/lib/marketing-services';

export default function ServicesPageClient({ services }: { services: MarketingService[] }) {
  const bookConsultation = () => {
    openWhatsAppChat(`Hi! I browsed your Services and want a free design consultation for my space.`, {
      branch: 'mumbai',
      cta: 'services_consult',
      source: 'services_page',
    });
  };

  return (
    <div className="gallery-redesign services-redesign" suppressHydrationWarning>
      <CloseButton href="/" />

      <div className="gal-body gal-body-top">
        {/* Full-width grid — no left sidebar on services */}
        <div className="gal-main gal-main-full">
          <div className="gallery-page-grid services-grid">
            {services.map((service, idx) => (
              <article key={service.slug} className="gal-card svc-card">
                <div className="gal-card-media">
                  <Link href={`/${service.slug}`} aria-label={`Learn more about ${service.name}`}>
                    <Image
                      src={service.image}
                      alt={`${service.name} in Mumbai, Navi Mumbai & Thane`}
                      width={640}
                      height={450}
                      sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <span className="gal-badge">{service.shortName || service.name}</span>
                  <div className="gal-card-shade" />
                </div>
                <div className="gal-card-foot svc-foot">
                  <div>
                    <Link href={`/${service.slug}`}>
                      <h3>{service.name}</h3>
                    </Link>
                    <p className="svc-desc">{service.description}</p>
                  </div>
                  <Link
                    href={`/${service.slug}`}
                    className="gal-enquire prod-enquire"
                    aria-label={`Learn more about ${service.name}`}
                  >
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ===== FOOTER BAR ===== */}
        <div className="gal-footer-bar">
          <button type="button" className="gal-btn gal-btn-gold gal-footer-cta" onClick={bookConsultation}>
            <i className="fab fa-whatsapp" /> Book Free Consultation
          </button>
          <Link href="/visit-us" className="gal-btn gal-btn-dark gal-footer-cta">
            <i className="fas fa-store" /> Visit Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
