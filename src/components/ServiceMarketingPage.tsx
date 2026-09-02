import Link from 'next/link';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import type { MarketingService } from '@/lib/marketing-services';
import { getMarketingService } from '@/lib/marketing-services';
import { getLocationPagesForService } from '@/lib/location-pages';
import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
} from '@/lib/json-ld';
import { PHONES, WARRANTY } from '@/lib/site-config';

export default function ServiceMarketingPage({ service }: { service: MarketingService }) {
  const related = service.relatedSlugs
    .map((slug) => getMarketingService(slug))
    .filter(Boolean);
  const locations = getLocationPagesForService(service.slug);

  const schemas = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: service.name, path: `/${service.slug}` },
    ]),
    serviceJsonLd({
      name: service.name,
      description: service.description,
      path: `/${service.slug}`,
    }),
    faqJsonLd(service.faqs),
  ];

  return (
    <article className="mkt-page">
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      <header className="mkt-hero">
        <div className="mkt-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={`${service.name} by Ananya House of Furniture for Mumbai, Navi Mumbai and Thane homes`}
            width={1200}
            height={800}
          />
        </div>
        <div className="mkt-hero-copy">
          <p className="mkt-eyebrow">Ananya House of Furniture</p>
          <h1>{service.h1}</h1>
          <p className="mkt-lead">{service.intro}</p>
          <LeadCta
            service={service.slug}
            whatsappMessage={service.whatsappMessage}
            ctaPosition="service_hero"
            phoneTel={PHONES.mumbaiPrimary.tel}
            phoneDisplay={PHONES.mumbaiPrimary.display}
          />
        </div>
      </header>

      <div className="mkt-body">
        <section className="mkt-section">
          <h2>Why choose us for {service.shortName.toLowerCase()}</h2>
          <ul className="mkt-list">
            {service.benefits.map((item) => (
              <li key={item}>
                <i className="fas fa-check" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mkt-section">
          <h2>Materials</h2>
          <ul className="mkt-list">
            {service.materials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mkt-section mkt-grid-2">
          <div>
            <h2>Design process</h2>
            <ol className="mkt-steps">
              {service.designProcess.map((step, i) => (
                <li key={step}>
                  <span>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2>Manufacturing</h2>
            <ol className="mkt-steps">
              {service.manufacturingProcess.map((step, i) => (
                <li key={step}>
                  <span>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mkt-section">
          <h2>Installation</h2>
          <p>{service.installation}</p>
        </section>

        <section className="mkt-section">
          <h2>Warranty</h2>
          <p>{service.warranty || WARRANTY}</p>
        </section>

        <section className="mkt-section">
          <h2>Project examples</h2>
          <p>
            Browse real installations in our{' '}
            <Link href="/gallery">design gallery</Link>. Want a similar look? Book a free site visit
            and we will design around your space.
          </p>
          <div className="mkt-gallery-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.image} alt={`${service.shortName} project example`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/home-slide3.jpg" alt="Custom furniture installation example" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/home-slide1.jpg" alt="Home interior carpentry example" />
          </div>
        </section>

        {locations.length > 0 && (
          <section className="mkt-section">
            <h2>Service areas</h2>
            <p>Local pages with practical coverage notes:</p>
            <ul className="mkt-chip-list">
              {locations.map((loc) => (
                <li key={loc.slug}>
                  <Link href={`/${loc.slug}`}>{loc.locationName}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mkt-section">
          <h2>FAQs</h2>
          <div className="mkt-faqs">
            {service.faqs.map((faq) => (
              <details key={faq.question} className="mkt-faq">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mkt-section mkt-cta-band">
          <h2>Ready to start?</h2>
          <p>Get a free 3D design consultation and site visit — no obligation.</p>
          <LeadCta
            service={service.slug}
            whatsappMessage={service.whatsappMessage}
            ctaPosition="service_footer"
          />
        </section>

        {related.length > 0 && (
          <section className="mkt-section">
            <h2>Related services</h2>
            <ul className="mkt-chip-list">
              {related.map((r) =>
                r ? (
                  <li key={r.slug}>
                    <Link href={`/${r.slug}`}>{r.name}</Link>
                  </li>
                ) : null
              )}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
