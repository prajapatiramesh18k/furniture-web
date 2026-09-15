import type { Metadata } from 'next';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { absoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Furniture Blog — Guides for Mumbai Homes',
  description:
    'Practical furniture guides for Mumbai, Navi Mumbai & Thane homes — buying, care, and small-space ideas from Ananya House of Furniture.',
  alternates: { canonical: absoluteUrl('/blog') },
  openGraph: {
    title: 'Furniture Blog | Ananya House of Furniture',
    description: 'Buying guides, care tips and small-space ideas for Mumbai homes.',
    url: absoluteUrl('/blog'),
    type: 'website',
  },
};

export const revalidate = 3600;

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
