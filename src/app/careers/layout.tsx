import type { Metadata } from 'next';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'We Are Hiring — Senior Carpenter, Carpenter, Junior Carpenter, Helper | Join Our Team',
  description:
    'Ananya House of Furniture is hiring Senior Carpenter, Carpenter, Junior Carpenter and Carpenter Helper in Thane / Mumbai. Regular work, on-time payment, overtime. Call or WhatsApp to apply today.',
  alternates: { canonical: absoluteUrl('/careers') },
  openGraph: {
    title: 'We Are Hiring — Senior Carpenter, Carpenter, Junior Carpenter, Helper',
    description:
      'Senior Carpenter, Carpenter, Junior Carpenter and Carpenter Helper jobs in Thane / Mumbai. Regular work, on-time salary, overtime. Apply on call or WhatsApp.',
    url: absoluteUrl('/careers'),
    type: 'website',
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
        ])}
      />
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
