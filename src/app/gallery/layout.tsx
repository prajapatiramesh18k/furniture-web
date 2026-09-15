import type { Metadata } from 'next';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { absoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Design Gallery — Custom Furniture & Interiors',
  description:
    'Browse real custom furniture and interior installations by Ananya House of Furniture across Mumbai, Navi Mumbai & Thane.',
  alternates: { canonical: absoluteUrl('/gallery') },
  openGraph: {
    title: 'Design Gallery | Ananya House of Furniture',
    description:
      'Real installations — modular kitchens, wardrobes, TV units and full interiors across Mumbai, Navi Mumbai & Thane.',
    url: absoluteUrl('/gallery'),
    type: 'website',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
