import type { Metadata } from 'next';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import LeadCta from '@/components/LeadCta';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/json-ld';
import { HEAD_OFFICE, AHMEDABAD_BRANCH, PHONES } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Visit Our Showroom & Workshop | Book a Free Design Consultation',
  description:
    'Visit Ananya House of Furniture showroom at Diva-Shil Road, Khardipada (Mumbai HQ) or TRP Mall, Bopal (Ahmedabad). Book a free design consultation, see material samples, and experience our craftsmanship.',
  alternates: { canonical: absoluteUrl('/visit-us') },
  openGraph: {
    title: 'Visit Our Showroom & Workshop | Ananya House of Furniture',
    description: 'Book a free design consultation at our Mumbai or Ahmedabad showroom. See materials, finishes, and 3D designs in person.',
    url: absoluteUrl('/visit-us'),
    type: 'website',
  },
};

const branches = [
  {
    id: 'mumbai',
    name: 'Mumbai Headquarters & Workshop',
    address: 'Diva-Shil Road, Khardipada',
    city: 'Thane, Maharashtra - 400612',
    phone: PHONES.mumbaiPrimary.display,
    phoneTel: PHONES.mumbaiPrimary.tel,
    email: 'ananyahouseoffurniture@gmail.com',
    mapLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
    hours: 'Mon–Sat · 9:00 AM – 7:00 PM',
    features: [
      'Full material library (laminates, veneers, acrylics, hardware)',
      'Live 3D design station with consultant',
      'Workshop tour available on request',
      'Parking available',
    ],
    whatToBring: [
      'Floor plan or rough measurements',
      'Inspiration photos (Pinterest, magazines)',
      'List of rooms to furnish',
      'Budget range in mind',
    ],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad Branch (Bopal)',
    address: 'West Court, 2nd Floor, TRP Mall',
    city: 'Bopal, Ahmedabad, Gujarat - 380059',
    phone: '+91 93218 12823',
    phoneTel: '+919321812823',
    email: 'ananyahouseoffurniture@gmail.com',
    mapLink: 'https://maps.google.com/?q=TRP+Mall+Bopal+Ahmedabad',
    hours: 'Mon–Sat · 10:00 AM – 7:00 PM',
    features: [
      'PVC & wooden furniture samples',
      'Modular kitchen & wardrobe displays',
      'Design consultation by appointment',
      'Mall parking available',
    ],
    whatToBring: [
      'Floor plan or rough measurements',
      'Inspiration photos',
      'List of requirements',
      'Preferred material ideas',
    ],
  },
];

export default function VisitUsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Visit Showroom', path: '/visit-us' },
          ]),
          localBusinessJsonLd(),
        ]}
      />
      <NavbarWrapper />
      <main className="visit-us-page">
        <section className="visit-hero">
          <div className="visit-hero-content">
            <p className="visit-eyebrow">Experience Craftsmanship In Person</p>
            <h1>Visit Our Showroom & Workshop</h1>
            <p className="visit-lead">
              See, touch, and experience materials before you commit. Book a free design consultation
              at our Mumbai headquarters or Ahmedabad branch — walk through our material library,
              review 3D visualizations, and plan your dream space with our experts.
            </p>
            <div className="visit-hero-stats">
              <div className="visit-stat">
                <span className="visit-stat-num">2</span>
                <span className="visit-stat-label">Locations</span>
              </div>
              <div className="visit-stat">
                <span className="visit-stat-num">500+</span>
                <span className="visit-stat-label">Materials</span>
              </div>
              <div className="visit-stat">
                <span className="visit-stat-num">Free</span>
                <span className="visit-stat-label">Consultation</span>
              </div>
            </div>
          </div>
        </section>

        <section className="visit-section">
          <div className="visit-branches">
            {branches.map((branch) => (
              <article key={branch.id} className="visit-branch-card">
                <div className="visit-branch-header">
                  <div className="visit-branch-icon">
                    <i className="fas fa-building" />
                  </div>
                  <div>
                    <h2>{branch.name}</h2>
                    <p className="visit-branch-location">
                      <i className="fas fa-map-marker-alt" /> {branch.address}, {branch.city}
                    </p>
                  </div>
                </div>

                <div className="visit-branch-details">
                  <div className="visit-detail-row">
                    <i className="fas fa-clock" />
                    <span>{branch.hours}</span>
                  </div>
                  <div className="visit-detail-row">
                    <i className="fas fa-phone" />
                    <a href={`tel:${branch.phoneTel}`}>{branch.phone}</a>
                  </div>
                  <div className="visit-detail-row">
                    <i className="fas fa-envelope" />
                    <a href={`mailto:${branch.email}`}>{branch.email}</a>
                  </div>
                  <div className="visit-detail-row">
                    <i className="fas fa-map-marked-alt" />
                    <a href={branch.mapLink} target="_blank" rel="noopener noreferrer">Get Directions on Google Maps</a>
                  </div>
                </div>

                <div className="visit-branch-features">
                  <h3><i className="fas fa-check-circle" style={{marginRight: '0.5rem', color: '#2e7d4f'}} /> What you'll find here</h3>
                  <ul>
                    {branch.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="visit-bring-section">
                  <h3><i className="fas fa-suitcase" style={{marginRight: '0.5rem', color: '#a27341'}} /> What to bring for a productive visit</h3>
                  <ul>
                    {branch.whatToBring.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="visit-branch-cta">
                  <LeadCta
                    compact
                    location={branch.id === 'mumbai' ? 'Mumbai' : 'Ahmedabad'}
                    whatsappMessage={`Hi, I'd like to book a showroom visit at the ${branch.name}. My preferred date/time:`}
                    ctaPosition={`${branch.id}_showroom_visit`}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="visit-section">
          <h2>What Happens During Your Visit</h2>
          <div className="visit-process">
            <div className="visit-step">
              <span className="visit-step-num">1</span>
              <div>
                <h3>Welcome & Discovery</h3>
                <p>We discuss your lifestyle, needs, and the spaces you want to furnish.</p>
              </div>
            </div>
            <div className="visit-step">
              <span className="visit-step-num">2</span>
              <div>
                <h3>Material Exploration</h3>
                <p>Browse 500+ laminates, veneers, acrylics, hardware, and finishes hands-on.</p>
              </div>
            </div>
            <div className="visit-step">
              <span className="visit-step-num">3</span>
              <div>
                <h3>3D Design Preview</h3>
                <p>See your space come to life with a real-time 3D walkthrough on our design station.</p>
              </div>
            </div>
            <div className="visit-step">
              <span className="visit-step-num">4</span>
              <div>
                <h3>Quotation & Next Steps</h3>
                <p>Receive a clear, itemized quote. Schedule a free site visit if you're ready to proceed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="visit-section visit-faq-section">
          <h2>Common Questions</h2>
          <div className="visit-faqs">
            <details>
              <summary>Do I need an appointment to visit?</summary>
              <p>Walk-ins are welcome during business hours, but we recommend booking via WhatsApp so a design consultant is reserved for you.</p>
            </details>
            <details>
              <summary>Is there a consultation fee?</summary>
              <p>No. The initial design consultation at our showroom is completely free.</p>
            </details>
            <details>
              <summary>Can I see the workshop/factory?</summary>
              <p>Yes! Our Mumbai HQ includes the manufacturing workshop. Ask our team for a guided tour (safety gear provided).</p>
            </details>
            <details>
              <summary>What if I can't visit in person?</summary>
              <p>We offer video consultations via WhatsApp. Share your floor plan and we'll walk you through options remotely.</p>
            </details>
            <details>
              <summary>Is parking available?</summary>
              <p>Yes, both locations have parking — Mumbai HQ has dedicated visitor parking; Ahmedabad branch is inside TRP Mall with ample mall parking.</p>
            </details>
          </div>
        </section>

        <section className="visit-section visit-final-cta">
          <h2>Ready to Start Your Project?</h2>
          <p>Book a showroom visit, request a free site visit, or just WhatsApp us your questions.</p>
          <div className="visit-final-actions">
            <LeadCta
              location="Mumbai"
              whatsappMessage="Hi, I'd like to book a free design consultation. My preferred location:"
              ctaPosition="visit_us_final"
            />
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}