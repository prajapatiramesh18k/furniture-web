import NavbarWrapper from '@/components/NavbarWrapper';
import AnnouncementBar from '@/components/AnnouncementBar';
import Hero from '@/components/Hero';
import Branches from '@/components/Branches';
import AboutSection from '@/components/AboutSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturedGallery from '@/components/FeaturedGallery';
import Services from '@/components/Services';
import Blog from '@/components/Blog';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title:
    'Custom Furniture & Interiors in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
  description:
    'Custom furniture, modular kitchens & wardrobes in Mumbai, Navi Mumbai & Thane. Free site visit, 3D design consultation, in-house manufacturing and installation.',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title:
      'Custom Furniture & Interiors in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Free site visit + 3D design for modular kitchens, wardrobes, TV units and custom furniture.',
    url: absoluteUrl('/'),
  },
};

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <NavbarWrapper />
      <Hero />
      <FeaturedProducts />
      <FeaturedGallery />
      <Services />
      <Blog />
      <AboutSection />
      <Testimonials />
      <FAQ />
      <Branches />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
