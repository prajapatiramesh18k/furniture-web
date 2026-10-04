import Link from 'next/link';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from '@/lib/json-ld';
import { HEAD_OFFICE, PHONES } from '@/lib/site-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Furniture & Interiors in Navi Mumbai | Kharghar, Vashi, Panvel',
  description:
    'Custom furniture, modular kitchens, wardrobes & home interiors in Navi Mumbai — Vashi, Nerul, Seawoods, Belapur, Kharghar, Kamothe, Panvel, Ulwe, Airoli, Ghansoli. Free site visit, 3D design. Call now.',
  alternates: { canonical: absoluteUrl('/navi-mumbai') },
  openGraph: {
    title: 'Custom Furniture & Interiors in Navi Mumbai | Ananya House of Furniture',
    description: 'Free site visit + 3D design for new Navi Mumbai flats — kitchens, wardrobes, full interiors. Call now.',
    url: absoluteUrl('/navi-mumbai'),
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
  { label: 'Custom Furniture in Navi Mumbai', href: '/custom-furniture-navi-mumbai' },
  { label: 'Modular Kitchen in Navi Mumbai', href: '/modular-kitchen-navi-mumbai' },
  { label: 'Wardrobes in Navi Mumbai', href: '/wardrobes-navi-mumbai' },
];

const areas = [
  'Vashi',
  'Sanpada',
  'Juinagar',
  'Nerul',
  'Seawoods',
  'Belapur',
  'Kharghar',
  'Kamothe',
  'Kalamboli',
  'Panvel',
  'Khandeshwar',
  'Taloja',
  'Ulwe',
  'Dronagiri',
  'Uran',
  'Airoli',
  'Ghansoli',
  'Koparkhairane',
  'Turbhe',
  'Digha',
];

const faqs = [
  {
    question: 'Do you provide custom furniture across all Navi Mumbai nodes?',
    answer:
      'Yes. We serve Vashi, Nerul, Seawoods, Belapur, Kharghar, Kamothe, Panvel, Ulwe, Airoli, Ghansoli, Koparkhairane and nearby nodes. Mention your sector on call or WhatsApp for site-visit scheduling.',
  },
  {
    question: 'How do I book a free site visit in Navi Mumbai?',
    answer:
      'Call +91 93218 12823, WhatsApp us, or submit the contact form with your Navi Mumbai location. Ideal for new society flats — we measure builder niches and electrical points, then share a 3D design.',
  },
  {
    question: 'Do you design for new builder flats in Kharghar and Panvel?',
    answer:
      'Yes, that is our specialty. We plan kitchens around builder plumbing points and wardrobes for actual bedroom clearances, rather than catalogue templates.',
  },
  {
    question: 'What is the cost in Navi Mumbai?',
    answer:
      'Cost depends on size, material grade and hardware. After a free site visit we share a clear quotation for your flat layout.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Many single-room projects finish in about 15–30 days after design approval. Full-home interiors take longer — we confirm a schedule during consultation.',
  },
];

export const revalidate = 86400;

export default function NaviMumbaiPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Navi Mumbai', path: '/navi-mumbai' },
          ]),
          serviceJsonLd({
            name: 'Custom Furniture & Interiors in Navi Mumbai',
            description:
              'Custom furniture, modular kitchens, wardrobes and home interiors in Navi Mumbai. Free site visit, 3D design, in-house manufacturing.',
            path: '/navi-mumbai',
            areaServed: ['Navi Mumbai'],
          }),
          faqJsonLd(faqs),
        ]}
      />
      <NavbarWrapper />
      <main className="city-hub">
        <section className="city-hero">
          <p className="city-eyebrow">Navi Mumbai · New-Flat Specialists · Free Site Visit</p>
          <h1>Custom Furniture &amp; Interiors in Navi Mumbai</h1>
          <p className="city-lead">
            New society flat in Kharghar, Panvel or Vashi? We measure on site, design in 3D around
            your builder-provided kitchen niches and electrical points, manufacture in-house, and
            install — modular kitchens, wardrobes and complete home interiors across Navi Mumbai.
          </p>
          <p className="city-call-now">
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>
              <i className="fas fa-phone" aria-hidden="true" /> Call Now: {PHONES.mumbaiPrimary.display}
            </a>
            <span>Mon–Sat 9am–7pm · Free site visit for new flats</span>
          </p>
          <LeadCta
            location="Navi Mumbai"
            whatsappMessage="Hi, I want custom furniture in Navi Mumbai. My location:"
            ctaPosition="navimumbai_hub"
          />
        </section>

        <section className="city-section">
          <h2>Planned around new Navi Mumbai flats</h2>
          <p>
            Navi Mumbai&apos;s newer nodes come with standardised flat layouts — which is exactly
            where custom planning pays off. We work around builder plumbing points, plan wardrobes
            for actual bedroom clearances, and design kitchens that fit your cooking habits rather
            than a catalogue template. Free site visit and 3D design come before any commitment.
          </p>
        </section>

        <section className="city-section">
          <h2>Areas we serve in Navi Mumbai</h2>
          <div className="city-chips">
            {areas.map((a) => (
              <span key={a} className="city-chip">{a}</span>
            ))}
          </div>
          <p className="city-note">
            Covering all major nodes — mention your sector on call or WhatsApp. Also serving{' '}
            <Link href="/mumbai">Mumbai</Link> and <Link href="/thane">Thane</Link>.
          </p>
        </section>

        <section className="city-section">
          <h2>Services in Navi Mumbai</h2>
          <div className="city-links">
            {services.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>Popular in Navi Mumbai</h2>
          <div className="city-links">
            {combos.map((s) => (
              <Link key={s.href} href={s.href}>{s.label}</Link>
            ))}
          </div>
        </section>

        <section className="city-section">
          <h2>FAQs — Navi Mumbai</h2>
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
          <h2>Why Navi Mumbai customers choose Ananya</h2>
          <ul className="city-trust">
            <li>Free site visit + 3D design for new flats before manufacturing</li>
            <li>In-house manufacturing with factory-direct pricing</li>
            <li>5-year warranty on manufacturing defects</li>
            <li>Installation teams working across all Navi Mumbai nodes</li>
          </ul>
          <p className="city-note">
            Workshop: {HEAD_OFFICE.fullAddress} ·{' '}
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>{PHONES.mumbaiPrimary.display}</a> · Mon–Sat 9am–7pm
          </p>
          <LeadCta
            compact
            location="Navi Mumbai"
            whatsappMessage="Hi, I want a free quote in Navi Mumbai. My location:"
            ctaPosition="navimumbai_hub_bottom"
          />
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
