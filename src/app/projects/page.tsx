import type { Metadata } from 'next';
import Link from 'next/link';
import NavbarWrapper from '@/components/NavbarWrapper';
import AnnouncementBar from '@/components/AnnouncementBar';
import ProjectTypes from '@/components/ProjectTypes';
import HowItWorks from '@/components/HowItWorks';
import ProjectPricing from '@/components/ProjectPricing';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CloseButton from '@/components/CloseButton';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Custom Furniture Projects | Ananya House of Furniture',
  description: 'Explore our custom furniture project types, how we work, and transparent pricing for 1BHK, 2BHK, 3BHK, 4BHK, office, shop, restaurant, and showroom interiors.',
  alternates: { canonical: absoluteUrl('/projects') },
  openGraph: {
    title: 'Custom Furniture Projects | Ananya House of Furniture',
    description: 'Transparent project pricing for 1BHK to villas, offices and commercial spaces.',
    url: absoluteUrl('/projects'),
    type: 'website',
  },
};

export const revalidate = 60;

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Packages', path: '/projects' },
        ])}
      />
      <NavbarWrapper />
      <div className="gallery-redesign packages-redesign" suppressHydrationWarning>
        <div className="projects-page-hero">
          <CloseButton href="/" />
          <h1>Our <span>Packages</span></h1>
          <p>Transparent pricing for every space — from compact 1BHKs to luxury villas and full office fit-outs.</p>
        </div>
        <div className="pkg-body">
          <ProjectTypes />
          <HowItWorks />
          <ProjectPricing />
          {/* ===== FOOTER BAR ===== */}
          <div className="gal-footer-bar">
            <Link href="/contact" className="gal-btn gal-btn-gold gal-footer-cta">
              <i className="fab fa-whatsapp" /> Book Free Consultation
            </Link>
            <Link href="/visit-us" className="gal-btn gal-btn-dark gal-footer-cta">
              <i className="fas fa-store" /> Visit Showroom
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
