import Link from 'next/link';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import LeadCta from '@/components/LeadCta';
import { absoluteUrl } from '@/lib/site-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Furniture & Interiors in Thane | Modular Kitchen, Wardrobes',
  description:
    'Custom furniture, modular kitchens, wardrobes & home interiors in Thane — Thane West/East, Mumbra, Diva, Kalwa, Shilphata. Free site visit, 3D design, in-house manufacturing nearby.',
  alternates: { canonical: absoluteUrl('/thane') },
  openGraph: {
    title: 'Custom Furniture & Interiors in Thane | Ananya House of Furniture',
    description: 'Workshop-nearby custom furniture in Thane with free site visit + 3D design.',
    url: absoluteUrl('/thane'),
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
  { label: 'Custom Furniture in Thane', href: '/custom-furniture-thane' },
  { label: 'Modular Kitchen in Thane', href: '/modular-kitchen-thane' },
  { label: 'Wardrobes in Thane', href: '/wardrobes-thane' },
];

const areas = ['Thane West', 'Thane East', 'Mumbra', 'Diva', 'Kalwa', 'Shilphata'];

export default function ThanePage() {
  return (
    <>
      <NavbarWrapper />
      <main className="city-hub">
        <section className="city-hero">
          <p className="city-eyebrow">Thane · Workshop Nearby · Free Site Visit</p>
          <h1>Custom Furniture &amp; Interiors in Thane</h1>
          <p className="city-lead">
            Our manufacturing base sits at Diva-Shil Road, Khardipada — minutes from Thane — so
            site visits, measurements and installation across Thane are fast and factory-direct.
            Modular kitchens, wardrobes, TV units and full home interiors, all made in-house.
          </p>
          <LeadCta
            location="Thane"
            whatsappMessage="Hi, I want custom furniture in Thane. My location:"
            ctaPosition="thane_hub"
          />
        </section>

        <section className="city-section">
          <h2>Built for Thane family homes</h2>
          <p>
            From Ghodbunder Road townships to older Thane neighbourhoods, we plan storage around how
            your family actually lives: lofts above wardrobes, pooja units sized for your idols,
            kitchens with tall units for bulk storage. Because the workshop is nearby, revisions and
            site coordination stay quick through manufacturing and installation.
          </p>
        </section>

        <section className="city-section">
          <h2>Areas we serve in &amp; around Thane</h2>
          <div className="city-chips">
            {areas.map((a) => (
              <span key={a} className="city-chip">{a}</span>
            ))}
          </div>
          <p className="city-note">
            Also serving Dombivli and Kalyan on request — mention your area on call or WhatsApp.
          </p>
        </section>

        <section className="city-section">
          <h2>Services in Thane</h2>
          <div className="city-links">
            {services.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Popular in Thane</h2>
          <div className="city-links">
            {combos.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Why Thane customers choose Ananya</h2>
          <ul className="city-trust">
            <li>Manufacturing base at Diva-Shil Road — genuinely local to Thane</li>
            <li>Free site visit + 3D design consultation before manufacturing</li>
            <li>5-year warranty on manufacturing defects</li>
            <li>Own installation team across Thane, Mumbai &amp; Navi Mumbai</li>
          </ul>
          <LeadCta
            compact
            location="Thane"
            whatsappMessage="Hi, I want a free quote in Thane. My location:"
            ctaPosition="thane_hub_bottom"
          />
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
