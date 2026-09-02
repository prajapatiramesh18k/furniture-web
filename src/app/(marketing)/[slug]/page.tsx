import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ServiceMarketingPage from '@/components/ServiceMarketingPage';
import LocationMarketingPage from '@/components/LocationMarketingPage';
import {
  getAllMarketingServiceSlugs,
  getMarketingService,
} from '@/lib/marketing-services';
import {
  getAllLocationPageSlugs,
  getLocationPage,
} from '@/lib/location-pages';
import { absoluteUrl } from '@/lib/site-config';

type Props = { params: Promise<{ slug: string }> };

const serviceSlugs = new Set(getAllMarketingServiceSlugs());
const locationSlugs = new Set(getAllLocationPageSlugs());

export function generateStaticParams() {
  return [...serviceSlugs, ...locationSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getMarketingService(slug);
  if (service) {
    return {
      title: service.title,
      description: service.description,
      alternates: { canonical: absoluteUrl(`/${service.slug}`) },
      openGraph: {
        title: service.title,
        description: service.description,
        url: absoluteUrl(`/${service.slug}`),
        type: 'website',
      },
    };
  }
  const location = getLocationPage(slug);
  if (location) {
    return {
      title: location.title,
      description: location.description,
      alternates: { canonical: absoluteUrl(`/${location.slug}`) },
      openGraph: {
        title: location.title,
        description: location.description,
        url: absoluteUrl(`/${location.slug}`),
        type: 'website',
      },
    };
  }
  return {};
}

export default async function MarketingSlugPage({ params }: Props) {
  const { slug } = await params;
  const service = getMarketingService(slug);
  const location = getLocationPage(slug);

  if (!service && !location) notFound();

  return (
    <>
      <NavbarWrapper />
      <main>
        {service ? (
          <ServiceMarketingPage service={service} />
        ) : location ? (
          <LocationMarketingPage page={location} />
        ) : null}
      </main>
      <Footer />
      <WhatsAppFloat
        message={
          service?.whatsappMessage ||
          (location
            ? `${getMarketingService(location.serviceSlug)?.whatsappMessage || 'Hi, I would like a free consultation.'} My location is ${location.locationName}.`
            : undefined)
        }
        service={service?.slug || location?.serviceSlug}
        location={location?.locationKey}
      />
    </>
  );
}
