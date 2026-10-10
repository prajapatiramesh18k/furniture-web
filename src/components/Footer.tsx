'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { handleTrackedPhoneClick } from '@/lib/analytics';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Custom Furniture', href: '/custom-furniture-manufacturing' },
  { label: 'Modular Furniture & Interiors', href: '/modular-furniture-interior-work' },
  { label: 'Repair & Restoration', href: '/furniture-repair-restoration' },
  { label: 'Products', href: '/products' },
  { label: 'Design Gallery', href: '/gallery' },
  { label: 'Visit Showroom', href: '/visit-us' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers (We Are Hiring)', href: '/careers' },
];

const contactInfo = {
  phones: [
    { display: '+91 93218 12823', tel: '+919321812823', branch: 'mumbai' as const },
    { display: '+91 83187 27813', tel: '+918318727813', branch: 'mumbai' as const },
  ],
  email: 'ananyahouseoffurniture@gmail.com',
  address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612',
  addressLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
};

const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/18eDGjuM47/', icon: 'fab fa-facebook-f' },
  { label: 'Instagram', href: 'https://www.instagram.com/ananyahouseoffurniture', icon: 'fab fa-instagram' },
  { label: 'WhatsApp', href: 'https://wa.me/919321812823?text=Hi%2C%20I%20am%20interested%20in%20custom%20furniture.', icon: 'fab fa-whatsapp' },
];

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  // Client-only year — avoids server/client date mismatch during hydration.
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="ahf-footer">
      <div className="ahf-footer-top">
        <div className="ahf-col">
          <div className="ahf-brand">
            <svg width="42" height="42" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#d9a441" />
              <path d="M7 21V11.5L14 8.5L21 11.5V21" stroke="#141210" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <path d="M10 21V15.5H18V21" stroke="#141210" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <path d="M7 11.5H21" stroke="#141210" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="ahf-brand-name">ANANYA</div>
              <div className="ahf-brand-sub">House of Furniture</div>
            </div>
          </div>
          <p className="ahf-desc">
            Custom furniture, modular kitchens and interiors crafted in-house for Mumbai, Thane &amp; Ahmedabad homes — free site visit &amp; 3D design.
          </p>
          <div className="ahf-social-row">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="ahf-social-btn"
                aria-label={s.label}
                title={s.label}
              >
                <i className={s.icon}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="ahf-col">
          <h4>Quick Links</h4>
          <ul className="ahf-link-list">
            {quickLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href}>
                  <i className="fas fa-angle-right"></i> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ahf-col">
          <h4>Contact Info</h4>
          {contactInfo.phones.map((phone) => (
            <a
              key={phone.tel}
              href={`tel:${phone.tel}`}
              className="ahf-contact-item"
              onClick={() =>
                handleTrackedPhoneClick({
                  branch: phone.branch,
                  cta: 'footer_phone',
                  source: 'footer',
                })
              }
            >
              <i className="fas fa-phone"></i>
              <span>{phone.display}</span>
            </a>
          ))}
          <a href={`mailto:${contactInfo.email}`} className="ahf-contact-item">
            <i className="fas fa-envelope"></i>
            <span style={{ textTransform: 'lowercase' }}>{contactInfo.email}</span>
          </a>
          <a href={contactInfo.addressLink} target="_blank" rel="noopener noreferrer" className="ahf-contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{contactInfo.address}</span>
          </a>
        </div>

        <div className="ahf-col">
          <h4>Share Experience</h4>
          <div className="ahf-review-card">
            <p>We value your feedback! Let us know how we did.</p>
            <Link href="/submit-review" className="ahf-review-btn">
              <i className="fas fa-star"></i> Submit Review
            </Link>
          </div>
        </div>
      </div>

      <div className="ahf-bottom">
        <div className="ahf-bottom-inner">
          <span suppressHydrationWarning>
            © {year ?? ''} <strong>Ananya House of Furniture</strong> | All rights reserved
          </span>
          <span>Crafted with care in Mumbai & Thane</span>
        </div>
      </div>
    </footer>
  );
}
