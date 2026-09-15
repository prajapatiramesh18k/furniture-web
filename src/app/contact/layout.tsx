import type { Metadata } from 'next';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Contact Us — Get Free 3D Design & Site Visit',
  description:
    'Contact Ananya House of Furniture for custom furniture, modular kitchens and interiors in Mumbai, Navi Mumbai & Thane. Free 3D design consultation and site visit.',
  alternates: { canonical: absoluteUrl('/contact') },
  openGraph: {
    title: 'Contact Ananya House of Furniture',
    description:
      'Get a free 3D design consultation and site visit for Mumbai, Navi Mumbai & Thane.',
    url: absoluteUrl('/contact'),
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
