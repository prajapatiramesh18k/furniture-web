import Link from 'next/link';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd, localBusinessJsonLd } from '@/lib/json-ld';
import { HEAD_OFFICE, PHONES } from '@/lib/site-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Furniture & Interiors in Thane | Modular Kitchen, Wardrobes',
  description:
    'Custom furniture, modular kitchens, wardrobes & home interiors in Thane — Thane West/East, Ghodbunder Road, Manpada, Diva, Mumbra, Kalwa, Dombivli, Kalyan. Free site visit, workshop nearby. Call now.',
  alternates: { canonical: absoluteUrl('/thane') },
  openGraph: {
    title: 'Custom Furniture & Interiors in Thane | Ananya House of Furniture',
    description: 'Workshop-nearby custom furniture in Thane with free site visit + 3D design. Call now.',
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

const areas = [
  'Thane West',
  'Thane East',
  'Naupada',
  'Teen Hath Naka',
  'Vartak Nagar',
  'Kapurbawdi',
  'Manpada',
  'Patlipada',
  'Ghodbunder Road',
  'Hiranandani Estate',
  'Waghbil',
  'Mumbra',
  'Diva',
  'Khardipada',
  'Kalwa',
  'Shilphata',
  'Dombivli East',
  'Dombivli West',
  'Kalyan West',
  'Kalyan East',
  'Ulhasnagar',
  'Kasheli',
];

const faqs = [
  {
    question: 'Do you serve all of Thane including Ghodbunder Road and Dombivli?',
    answer:
      'Yes. Our workshop at Diva-Shil Road, Khardipada is minutes from Thane. We serve Thane West/East, Ghodbunder Road, Manpada, Diva, Mumbra, Kalwa, Dombivli, Kalyan and nearby areas with fast site visits.',
  },
  {
    question: 'How do I book a free site visit in Thane?',
    answer:
      'Call +91 93218 12823, WhatsApp us, or submit the contact form with your Thane location. Because the workshop is nearby, scheduling is fast.',
  },
  {
    question: 'Why choose a Thane-local manufacturer?',
    answer:
      'Factory-direct pricing, fewer handoffs, quick revisions, and our own installation team across Thane, Mumbai and Navi Mumbai — plus 5-year warranty on manufacturing defects.',
  },
  {
    question: 'What is the cost in Thane?',
    answer:
      'Cost depends on size, material grade and hardware. After a free site visit we share a clear quotation — no one-size price guessing.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Many single-room projects finish in about 15–30 days after design approval. We confirm a schedule during consultation.',
  },
];

export const revalidate = 86400;

export default function ThanePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Thane', path: '/thane' },
          ]),
          serviceJsonLd({
            name: 'Custom Furniture & Interiors in Thane',
            description:
              'Custom furniture, modular kitchens, wardrobes and home interiors in Thane. Free site visit, workshop nearby, in-house manufacturing.',
            path: '/thane',
            areaServed: ['Thane'],
          }),
          faqJsonLd(faqs),
        ]}
      />
      <NavbarWrapper />
      <main className="city-hub">
        <section className="city-hero">
          <p className="city-eyebrow">Thane · Workshop Nearby · Free Site Visit</p>
          <h1>Custom Furniture &amp; Interiors in Thane</h1>
          <p className="city-lead">
            Our manufacturing base sits at Diva-Shil Road, Khardipada — minutes from Thane — so
            site visits, measurements and installation across Thane, Dombivli and Kalyan are fast and factory-direct.
            Modular kitchens, wardrobes, TV units and full home interiors, all made in-house.
          </p>
          <p className="city-call-now">
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>
              <i className="fas fa-phone" aria-hidden="true" /> Call Now: {PHONES.mumbaiPrimary.display}
            </a>
            <span>Mon–Sat 9am–7pm · Workshop 10 mins away</span>
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
            Including Ghodbunder Road, Dombivli, Kalyan, Ulhasnagar on request — mention your area on call or WhatsApp. Also serving{' '}
            <Link href="/mumbai">Mumbai</Link> and <Link href="/navi-mumbai">Navi Mumbai</Link>.
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
          <h2>FAQs — Thane</h2>
          <div className="mkt-faqs">
            {faqs.map((f) => (
              <details key={f.question} className="mkt-faq">
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Recent Projects in Thane</h2>
          <p className="city-note">A few examples of homes we've transformed across Thane neighbourhoods.</p>
          <div className="city-gallery">
            <Link href="/gallery?category=modular-kitchen" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800" alt="Modular kitchen in Ghodbunder Road" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Ghodbunder Road · Modular Kitchen</span>
              </div>
            </Link>
            <Link href="/gallery?category=wardrobes" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800" alt="Custom wardrobes in Hiranandani Estate" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Hiranandani Estate · Custom Wardrobes</span>
              </div>
            </Link>
            <Link href="/gallery?category=living-room" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800" alt="Living room in Thane West" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Thane West · Living Room</span>
              </div>
            </Link>
          </div>
          <p className="city-note" style={{marginTop: '1rem'}}>
            <Link href="/gallery" style={{fontWeight: 600}}>View all Thane projects →</Link>
          </p>
        </section>

        <section className="city-section">
          <h2>Visit Our Workshop & Showroom</h2>
          <p>
            Our manufacturing base is right here in Thane at Diva-Shil Road, Khardipada — walk through our
            material library, see live production, and consult with our designers in person.
          </p>
          <div className="city-visit-card">
            <div className="city-visit-info">
              <h3><i className="fas fa-map-marker-alt" style={{marginRight: '0.5rem', color: '#a27341'}} /> Diva-Shil Road, Khardipada, Thane (Workshop & HQ)</h3>
              <p>Mon–Sat · 9:00 AM – 7:00 PM · <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer">Get Directions</a></p>
            </div>
            <LeadCta
              compact
              location="Thane"
              whatsappMessage="Hi, I'd like to book a workshop visit at the Thane HQ. My preferred date/time:"
              ctaPosition="thane_workshop_visit"
            />
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
          <p className="city-note">
            Workshop / head office: {HEAD_OFFICE.fullAddress} ·{' '}
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>{PHONES.mumbaiPrimary.display}</a> · Mon–Sat 9am–7pm ·{' '}
            <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer">Get directions</a>
          </p>
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
