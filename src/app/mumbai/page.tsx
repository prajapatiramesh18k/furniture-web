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
  title: 'Custom Furniture & Interiors in Mumbai | Modular Kitchen, Wardrobes',
  description:
    'Custom furniture, modular kitchens, wardrobes & home interiors in Mumbai — South Mumbai, Bandra, Andheri, Juhu, Powai, Chembur, Goregaon, Malad, Borivali, Mulund, Mira Road. Free site visit, 3D design, in-house manufacturing. Call now.',
  alternates: { canonical: absoluteUrl('/mumbai') },
  openGraph: {
    title: 'Custom Furniture & Interiors in Mumbai | Ananya House of Furniture',
    description: 'Free site visit + 3D design for modular kitchens, wardrobes & custom furniture across Mumbai. Call now.',
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

const areas = [
  'Colaba',
  'Fort',
  'Marine Lines',
  'Dadar',
  'Matunga',
  'Sion',
  'Chembur',
  'Kurla',
  'Ghatkopar',
  'Vikhroli',
  'Kanjurmarg',
  'Bhandup',
  'Mulund',
  'Powai',
  'Chandivali',
  'Andheri',
  'Versova',
  'Juhu',
  'Vile Parle',
  'Santacruz',
  'Bandra',
  'Khar',
  'Goregaon',
  'Malad',
  'Kandivali',
  'Borivali',
  'Dahisar',
  'Mira Road',
  'Bhayandar',
];

const faqs = [
  {
    question: 'Do you provide custom furniture across all of Mumbai?',
    answer:
      'Yes. We serve South Mumbai, Western Suburbs, Central and Eastern Suburbs including Bandra, Andheri, Juhu, Powai, Chembur, Goregaon, Malad, Borivali, Mulund, Mira Road and nearby areas. Mention your sector on call or WhatsApp and we confirm site-visit scheduling.',
  },
  {
    question: 'How do I book a free site visit in Mumbai?',
    answer:
      'Call +91 93218 12823, WhatsApp us, or submit the contact form with your Mumbai location. We visit your flat, take exact measurements, then share a 3D design before manufacturing.',
  },
  {
    question: 'Do you handle high-rise delivery and installation in Mumbai?',
    answer:
      'Yes. Lift size, parking, floor access and installation constraints are planned upfront during consultation so delivery day is smooth.',
  },
  {
    question: 'What is the cost of a modular kitchen or wardrobe in Mumbai?',
    answer:
      'Cost depends on size, material grade, hardware and accessories. After a free site visit we share a clear quotation — we do not guess a one-size price without measuring.',
  },
  {
    question: 'How long does custom furniture take in Mumbai?',
    answer:
      'Many single-room projects finish in about 15–30 days after design approval. We confirm a schedule during consultation.',
  },
];

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
              'Custom furniture, modular kitchens, wardrobes and home interiors in Mumbai. Free site visit, 3D design, in-house manufacturing.',
            path: '/mumbai',
            areaServed: ['Mumbai'],
          }),
          faqJsonLd(faqs),
        ]}
      />
      <NavbarWrapper />
      <main className="city-hub">
        <section className="city-hero">
          <p className="city-eyebrow">Mumbai · Free Site Visit + 3D Design</p>
          <h1>Custom Furniture &amp; Interiors in Mumbai</h1>
          <p className="city-lead">
            Modular kitchens, wardrobes, TV units and complete home interiors — measured at your
            Mumbai home, manufactured in-house, and installed by our own team. We serve South Mumbai,
            Western, Central &amp; Eastern suburbs from our manufacturing base at Diva-Shil Road, Khardipada.
          </p>
          <p className="city-call-now">
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>
              <i className="fas fa-phone" aria-hidden="true" /> Call Now: {PHONES.mumbaiPrimary.display}
            </a>
            <span>Mon–Sat 9am–7pm · Free site visit for qualifying projects</span>
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
            South Mumbai, Western Suburbs, Central &amp; Eastern Suburbs + Mira-Bhayandar. Also serving nearby neighbourhoods on request — mention your area on call or WhatsApp. Also serving{' '}
            <Link href="/navi-mumbai">Navi Mumbai</Link> and <Link href="/thane">Thane</Link>.
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
          <h2>FAQs — Mumbai</h2>
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
          <h2>Recent Projects in Mumbai</h2>
          <p className="city-note">A few examples of homes we've transformed across Mumbai neighbourhoods.</p>
          <div className="city-gallery">
            <Link href="/gallery?category=living-room" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800" alt="Luxury living room in Bandra" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Bandra · 3BHK Living Room</span>
              </div>
            </Link>
            <Link href="/gallery?category=modular-kitchen" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800" alt="Modular kitchen in Andheri" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Andheri · Modular Kitchen</span>
              </div>
            </Link>
            <Link href="/gallery?category=wardrobes" className="city-gallery-item">
              <img src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800" alt="Custom wardrobes in Powai" loading="lazy" decoding="async" />
              <div className="city-gallery-overlay">
                <span>Powai · Custom Wardrobes</span>
              </div>
            </Link>
          </div>
          <p className="city-note" style={{marginTop: '1rem'}}>
            <Link href="/gallery" style={{fontWeight: 600}}>View all Mumbai projects →</Link>
          </p>
        </section>

        <section className="city-section">
          <h2>Visit Our Showroom & Workshop</h2>
          <p>
            Experience materials, finishes, and craftsmanship in person at our Mumbai headquarters.
            Our design consultants will walk you through samples, show 3D visualizations, and help plan your project.
          </p>
          <div className="city-visit-card">
            <div className="city-visit-info">
              <h3><i className="fas fa-map-marker-alt" style={{marginRight: '0.5rem', color: '#a27341'}} /> Diva-Shil Road, Khardipada, Thane (Mumbai HQ)</h3>
              <p>Mon–Sat · 9:00 AM – 7:00 PM · <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer">Get Directions</a></p>
            </div>
            <LeadCta
              compact
              location="Mumbai"
              whatsappMessage="Hi, I'd like to book a showroom visit at the Mumbai HQ. My preferred date/time:"
              ctaPosition="mumbai_showroom_visit"
            />
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
          <p className="city-note">
            Workshop / head office: {HEAD_OFFICE.fullAddress} ·{' '}
            <a href={`tel:${PHONES.mumbaiPrimary.tel}`}>{PHONES.mumbaiPrimary.display}</a> · Mon–Sat 9am–7pm ·{' '}
            <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer">Get directions</a>
          </p>
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
