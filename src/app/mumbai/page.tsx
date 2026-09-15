import Link from 'next/link';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Furniture & Interiors in Mumbai | Modular Kitchen, Wardrobes',
  description:
    'Custom furniture, modular kitchens, wardrobes & home interiors in Mumbai — Bandra, Andheri, Goregaon, Malad, Borivali, Mulund, Ghatkopar. Free site visit, 3D design, in-house manufacturing.',
  alternates: { canonical: absoluteUrl('/mumbai') },
  openGraph: {
    title: 'Custom Furniture & Interiors in Mumbai | Ananya House of Furniture',
    description: 'Free site visit + 3D design for modular kitchens, wardrobes & custom furniture across Mumbai.',
    url: absoluteUrl('/mumbai'),
  },
};

const services = [
  { label: 'Custom Furniture', href: '/custom-furniture' },
  { label: 'Modular Kitchen', href: '/modular-kitchen' },
  { label: 'Wardrobes', href: '/wardrobes' },
  { label: 'PVC Furniture', href: '/pvc-furniture' },
  { label: 'TV Units', href: '/tv-units' },
  { label: 'Bedroom Furniture', href: '/bedroom-furniture' },
  { label: 'Office Furniture', href: '/office-furniture' },
  { label: 'Home Interiors', href: '/home-interiors' },
];

const combos = [
  { label: 'Custom Furniture in Mumbai', href: '/custom-furniture-mumbai' },
  { label: 'Modular Kitchen in Mumbai', href: '/modular-kitchen-mumbai' },
  { label: 'Wardrobes in Mumbai', href: '/wardrobes-mumbai' },
];

const areas = ['Bandra', 'Andheri', 'Goregaon', 'Malad', 'Borivali', 'Mulund', 'Ghatkopar'];

export const revalidate = 86400;

export default function MumbaiPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Mumbai', path: '/mumbai' },
          ]),
          serviceJsonLd({
            name: 'Custom Furniture & Interiors in Mumbai',
            description:
              'Custom furniture, modular kitchens, wardrobes and home interiors in Mumbai.',
            path: '/mumbai',
            areaServed: ['Mumbai'],
          }),
        ]}
      />
      <NavbarWrapper />
      <main className="city-hub">
        <section className="city-hero">
          <p className="city-eyebrow">Mumbai · Free Site Visit + 3D Design</p>
          <h1>Custom Furniture &amp; Interiors in Mumbai</h1>
          <p className="city-lead">
            Modular kitchens, wardrobes, TV units and complete home interiors — measured at your
            Mumbai home, manufactured in-house, and installed by our own team. We serve Mumbai homes
            from our manufacturing base at Diva-Shil Road, Khardipada.
          </p>
          <LeadCta
            location="Mumbai"
            whatsappMessage="Hi, I want custom furniture in Mumbai. My location:"
            ctaPosition="mumbai_hub"
          />
        </section>

        <section className="city-section">
          <h2>What Mumbai homes usually need</h2>
          <p>
            Mumbai apartments reward careful planning: sliding wardrobes for compact bedrooms,
            kitchens mapped around existing plumbing points, and TV units sized for real wall
            measurements. We visit your flat, take exact measurements, show you a 3D design, and
            only then manufacture — so high-rise delivery, lift sizes and installation constraints
            are planned upfront, not discovered later.
          </p>
        </section>

        <section className="city-section">
          <h2>Areas we serve in Mumbai</h2>
          <div className="city-chips">
            {areas.map((a) => (
              <span key={a} className="city-chip">{a}</span>
            ))}
          </div>
          <p className="city-note">
            Also serving nearby neighbourhoods on request — mention your area on call or WhatsApp.
          </p>
        </section>

        <section className="city-section">
          <h2>Services in Mumbai</h2>
          <div className="city-links">
            {services.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Popular in Mumbai</h2>
          <div className="city-links">
            {combos.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Why Mumbai customers choose Ananya</h2>
          <ul className="city-trust">
            <li>Free site visit + 3D design consultation before you pay anything</li>
            <li>In-house manufacturing — no middlemen, factory-direct pricing</li>
            <li>5-year warranty on manufacturing defects</li>
            <li>Professional installation across Mumbai, Navi Mumbai &amp; Thane</li>
          </ul>
          <LeadCta
            compact
            location="Mumbai"
            whatsappMessage="Hi, I want a free quote in Mumbai. My location:"
            ctaPosition="mumbai_hub_bottom"
          />
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
