import type { MarketingServiceSlug } from '@/lib/marketing-services';
import { getMarketingService } from '@/lib/marketing-services';

export type LocationKey =
  | 'mumbai'
  | 'navi-mumbai'
  | 'thane'
  | 'ahmedabad'
  | 'bopal';

export type LocationPageDef = {
  slug: string;
  serviceSlug: MarketingServiceSlug;
  locationKey: LocationKey;
  locationName: string;
  title: string;
  description: string;
  h1: string;
  localIntro: string;
  localPoints: string[];
  coverageNote: string;
  neighbourhoodHints: string[];
};

const locationMeta: Record<
  LocationKey,
  {
    name: string;
    coverageNote: string;
    neighbourhoodHints: string[];
  }
> = {
  mumbai: {
    name: 'Mumbai',
    coverageNote:
      'We serve Mumbai homes from our manufacturing base at Diva-Shil Road, Khardipada (Thane district). Free site visits are available for qualifying projects across Mumbai.',
    neighbourhoodHints: [
      'Apartment layouts often need sliding wardrobes and compact kitchen planning',
      'High-rise delivery and floor access are planned during consultation',
      'Site visit helps confirm lift size, parking and installation constraints',
    ],
  },
  'navi-mumbai': {
    name: 'Navi Mumbai',
    coverageNote:
      'Navi Mumbai is part of our primary service area. We measure on site and manufacture at our workshop, then install at your flat or bungalow.',
    neighbourhoodHints: [
      'Newer society flats often suit modular kitchens with planned plumbing points',
      'We account for builder-provided kitchen niches and electrical points',
      'Free site visit + 3D design for serious modular and wardrobe projects',
    ],
  },
  thane: {
    name: 'Thane',
    coverageNote:
      'Our workshop and head office are at Diva-Shil Road, Khardipada, Thane — convenient for Thane city and nearby Mumbai projects.',
    neighbourhoodHints: [
      'Factory-direct manufacturing means fewer handoffs for Thane clients',
      'Site visits across Thane are routinely scheduled for kitchens and wardrobes',
      'You can discuss material samples during consultation',
    ],
  },
  ahmedabad: {
    name: 'Ahmedabad',
    coverageNote:
      'We operate an Ahmedabad branch at West Court, TRP Mall, Bopal — with a focus on wooden and PVC furniture suited to local needs.',
    neighbourhoodHints: [
      'Visit the Bopal showroom/branch for material discussion',
      'PVC options are commonly requested for Gujarat climate considerations',
      'Call or WhatsApp to confirm site visit availability for your area',
    ],
  },
  bopal: {
    name: 'Bopal',
    coverageNote:
      'Our Ahmedabad presence is at TRP Mall, Bopal (West Court, 2nd Floor). Bopal clients can visit for PVC and custom furniture discussions.',
    neighbourhoodHints: [
      'Branch address: West Court 2nd Floor, TRP Mall, Bopal',
      'Ask about PVC wardrobes, kitchens and storage',
      'Book a consultation before assuming same-day site visit slots',
    ],
  },
};

/** Primary + secondary location × service combinations (no doorway spam). */
const combos: { service: MarketingServiceSlug; location: LocationKey }[] = [
  { service: 'custom-furniture', location: 'mumbai' },
  { service: 'custom-furniture', location: 'navi-mumbai' },
  { service: 'custom-furniture', location: 'thane' },
  { service: 'custom-furniture', location: 'ahmedabad' },
  { service: 'modular-kitchen', location: 'mumbai' },
  { service: 'modular-kitchen', location: 'navi-mumbai' },
  { service: 'modular-kitchen', location: 'thane' },
  { service: 'modular-kitchen', location: 'ahmedabad' },
  { service: 'wardrobes', location: 'mumbai' },
  { service: 'wardrobes', location: 'navi-mumbai' },
  { service: 'wardrobes', location: 'thane' },
  { service: 'wardrobes', location: 'ahmedabad' },
  { service: 'modular-kitchen', location: 'bopal' },
  { service: 'custom-furniture', location: 'bopal' },
];

function buildLocalIntro(serviceName: string, locationName: string, locationKey: LocationKey) {
  if (locationKey === 'thane') {
    return `Looking for ${serviceName.toLowerCase()} in ${locationName}? Ananya House of Furniture manufactures in-house at Khardipada and installs across Thane. You get a free site visit and 3D design consultation so you can approve the plan before production.`;
  }
  if (locationKey === 'ahmedabad' || locationKey === 'bopal') {
    return `Looking for ${serviceName.toLowerCase()} in ${locationName}? Visit or contact our Ahmedabad branch at TRP Mall, Bopal. We help with custom furniture, modular kitchens and wardrobes — including PVC options where they suit the project.`;
  }
  return `Looking for ${serviceName.toLowerCase()} in ${locationName}? Ananya House of Furniture offers free site visits and 3D design consultations for ${locationName} projects, with manufacturing at our Thane workshop and professional installation at your home.`;
}

function buildLocalPoints(serviceSlug: MarketingServiceSlug, locationName: string): string[] {
  const base = [
    `Free site visit for ${locationName} projects (subject to scheduling)`,
    'Free 3D design consultation before manufacturing',
    'In-house manufacturing with installation support',
    'Clear quotation after measure — no one-size price guessing',
  ];
  if (serviceSlug === 'modular-kitchen') {
    return [
      ...base,
      `Kitchen layouts planned for typical ${locationName} apartment footprints`,
    ];
  }
  if (serviceSlug === 'wardrobes') {
    return [
      ...base,
      `Sliding or hinged wardrobes chosen based on your ${locationName} bedroom clearances`,
    ];
  }
  return base;
}

export const locationPages: LocationPageDef[] = combos.map(({ service, location }) => {
  const svc = getMarketingService(service)!;
  const loc = locationMeta[location];
  const slug = `${service}-${location}`;
  return {
    slug,
    serviceSlug: service,
    locationKey: location,
    locationName: loc.name,
    title: `${svc.shortName} in ${loc.name} | Ananya House of Furniture`,
    description: `${svc.shortName} in ${loc.name}. Free site visit, 3D design consultation, in-house manufacturing. Serving ${loc.name} with professional installation.`,
    h1: `${svc.shortName} in ${loc.name}`,
    localIntro: buildLocalIntro(svc.shortName, loc.name, location),
    localPoints: buildLocalPoints(service, loc.name),
    coverageNote: loc.coverageNote,
    neighbourhoodHints: loc.neighbourhoodHints,
  };
});

export function getLocationPage(slug: string) {
  return locationPages.find((p) => p.slug === slug);
}

export function getAllLocationPageSlugs() {
  return locationPages.map((p) => p.slug);
}

export function getLocationPagesForService(serviceSlug: MarketingServiceSlug) {
  return locationPages.filter((p) => p.serviceSlug === serviceSlug);
}
