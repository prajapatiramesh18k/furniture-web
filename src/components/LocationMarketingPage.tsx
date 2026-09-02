import Link from 'next/link';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import type { LocationPageDef } from '@/lib/location-pages';
import { getMarketingService } from '@/lib/marketing-services';
import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
} from '@/lib/json-ld';
import { AHMEDABAD_BRANCH, HEAD_OFFICE, PHONES } from '@/lib/site-config';

export default function LocationMarketingPage({ page }: { page: LocationPageDef }) {
  const service = getMarketingService(page.serviceSlug);
  if (!service) return null;

  const isGujarat = page.locationKey === 'ahmedabad' || page.locationKey === 'bopal';
  const phone = isGujarat ? PHONES.whatsappPrimary : PHONES.mumbaiPrimary;

  const schemas = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: service.name, path: `/${service.slug}` },
      { name: page.locationName, path: `/${page.slug}` },
    ]),
    serviceJsonLd({
      name: `${service.name} in ${page.locationName}`,
      description: page.description,
      path: `/${page.slug}`,
      areaServed: [page.locationName],
    }),
    faqJsonLd([
      {
        question: `Do you provide ${service.shortName.toLowerCase()} in ${page.locationName}?`,
        answer: page.coverageNote,
      },
      {
        question: 'Do you offer a free site visit and 3D design?',
        answer:
          'Yes. For qualifying projects we provide a free site visit and 3D design consultation before manufacturing.',
      },
      ...service.faqs.slice(0, 2),
    ]),
  ];

  return (
    <article className="mkt-page">
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      <header className="mkt-hero mkt-hero-local">
        <div className="mkt-hero-copy">
          <p className="mkt-eyebrow">
            <Link href={`/${service.slug}`}>{service.name}</Link> · {page.locationName}
          </p>
          <h1>{page.h1}</h1>
          <p className="mkt-lead">{page.localIntro}</p>
          <LeadCta
            service={service.slug}
            location={page.locationKey}
            whatsappMessage={`${service.whatsappMessage} My location is ${page.locationName}.`}
            ctaPosition="location_hero"
            phoneTel={phone.tel}
            phoneDisplay={phone.display}
          />
        </div>
      </header>

      <div className="mkt-body">
        <section className="mkt-section">
          <h2>How we serve {page.locationName}</h2>
          <p>{page.coverageNote}</p>
          <ul className="mkt-list">
            {page.localPoints.map((item) => (
              <li key={item}>
                <i className="fas fa-check" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mkt-section">
          <h2>Practical notes for {page.locationName} homes</h2>
          <ul className="mkt-list">
            {page.neighbourhoodHints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mkt-section">
          <h2>About this service</h2>
          <p>{service.intro}</p>
          <p>
            Full details:{' '}
            <Link href={`/${service.slug}`}>{service.name} overview</Link>
          </p>
        </section>

        <section className="mkt-section">
          <h2>Visit or contact</h2>
          {isGujarat ? (
            <p>
              Ahmedabad branch: {AHMEDABAD_BRANCH.fullAddress}. Phone:{' '}
              <a href={`tel:${PHONES.whatsappPrimary.tel}`}>{PHONES.whatsappPrimary.display}</a>
            </p>
          ) : (
            <p>
              Workshop / head office: {HEAD_OFFICE.fullAddress}. Phone:{' '}
              <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>{PHONES.mumbaiPrimary.display}</a>
              {' · '}
              <a href={`tel:${PHONES.whatsappPrimary.tel}`}>{PHONES.whatsappPrimary.display}</a>
            </p>
          )}
        </section>

        <section className="mkt-section mkt-cta-band">
          <h2>Want this in {page.locationName}?</h2>
          <p>Book a free site visit and 3D design consultation.</p>
          <LeadCta
            service={service.slug}
            location={page.locationKey}
            whatsappMessage={`${service.whatsappMessage} My location is ${page.locationName}.`}
            ctaPosition="location_footer"
            phoneTel={phone.tel}
            phoneDisplay={phone.display}
          />
        </section>
      </div>
    </article>
  );
}
