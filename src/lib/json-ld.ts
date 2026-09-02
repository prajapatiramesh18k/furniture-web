import {
  AHMEDABAD_BRANCH,
  EMAIL,
  EMAIL_CONTACT,
  ESTABLISHED_YEAR,
  HEAD_OFFICE,
  PHONES,
  PRIMARY_MARKETS,
  SECONDARY_MARKETS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/site-config';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/companylogo-with-bg.png'),
    email: EMAIL,
    telephone: PHONES.mumbaiPrimary.tel,
    sameAs: [
      'https://www.instagram.com/ananyahouseoffurniture',
      'https://www.facebook.com/share/18eDGjuM47/',
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** FurnitureStore / LocalBusiness — only verified address & phones. No fake ratings. */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: SITE_NAME,
    description:
      'Custom furniture, modular kitchens and wardrobes for Mumbai, Navi Mumbai & Thane, with an Ahmedabad (Bopal) branch.',
    url: SITE_URL,
    telephone: PHONES.mumbaiPrimary.tel,
    email: EMAIL_CONTACT,
    foundingDate: String(ESTABLISHED_YEAR),
    image: absoluteUrl('/og-image.jpg'),
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: HEAD_OFFICE.streetAddress,
      addressLocality: HEAD_OFFICE.addressLocality,
      addressRegion: HEAD_OFFICE.addressRegion,
      postalCode: HEAD_OFFICE.postalCode,
      addressCountry: HEAD_OFFICE.addressCountry,
    },
    openingHours: 'Mo-Sa 09:00-19:00',
    areaServed: [...PRIMARY_MARKETS, ...SECONDARY_MARKETS].map((name) => ({
      '@type': 'City',
      name,
    })),
    department: [
      {
        '@type': 'FurnitureStore',
        name: `${SITE_NAME} — Ahmedabad (Bopal)`,
        telephone: PHONES.mumbaiPrimary.tel,
        address: {
          '@type': 'PostalAddress',
          streetAddress: AHMEDABAD_BRANCH.streetAddress,
          addressLocality: AHMEDABAD_BRANCH.addressLocality,
          addressRegion: AHMEDABAD_BRANCH.addressRegion,
          postalCode: AHMEDABAD_BRANCH.postalCode,
          addressCountry: AHMEDABAD_BRANCH.addressCountry,
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  areaServed?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: {
      '@type': 'FurnitureStore',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: (opts.areaServed || [...PRIMARY_MARKETS]).map((name) => ({
      '@type': 'City',
      name,
    })),
    offers: {
      '@type': 'Offer',
      description: 'Free site visit and 3D design consultation',
      url: absoluteUrl('/contact'),
    },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
