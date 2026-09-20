'use client';

import Link from 'next/link';
import { handleTrackedPhoneClick } from '@/lib/analytics';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Modular Kitchen', href: '/modular-kitchen' },
  { label: 'Wardrobes', href: '/wardrobes' },
  { label: 'Custom Furniture', href: '/custom-furniture' },
  { label: 'Products', href: '/products' },
  { label: 'Design Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
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
  { label: 'Twitter', href: '#', icon: 'fab fa-twitter' },
  { label: 'LinkedIn', href: '#', icon: 'fab fa-linkedin' },
];

export default function Footer() {
  return (
    <footer className="ahf-footer">
      <style>{`
        .ahf-footer {
          background: linear-gradient(180deg, #141210 0%, #0c0b0a 100%);
          color: #e8e2d8;
          margin-top: 0;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
        }
        .ahf-footer-top {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3.5rem 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1.2fr 1fr;
          gap: 2.5rem;
        }
        .ahf-brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1rem;
        }
        .ahf-brand-name {
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: 3px;
          color: #d9a441;
          line-height: 1;
        }
        .ahf-brand-sub {
          font-size: 0.95rem;
          letter-spacing: 2px;
          color: #a89f91;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .ahf-desc {
          font-size: 1.25rem;
          line-height: 1.65;
          color: #b8b0a2;
          margin: 0 0 1.4rem;
          max-width: 32rem;
        }
        .ahf-social-row {
          display: flex;
          gap: 0.7rem;
        }
        .ahf-social-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(217, 164, 65, 0.12);
          border: 1px solid rgba(217, 164, 65, 0.35);
          color: #d9a441;
          font-size: 1.4rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .ahf-social-btn:hover {
          background: #d9a441;
          color: #141210;
          transform: translateY(-2px);
        }
        .ahf-col h4 {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #f5efe4;
          margin: 0 0 1.1rem;
          padding-bottom: 0.6rem;
          border-bottom: 2px solid rgba(217, 164, 65, 0.4);
          display: inline-block;
        }
        .ahf-link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.15rem;
        }
        .ahf-link-list a {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          color: #c9c1b2;
          text-decoration: none;
          font-size: 1.3rem;
          padding: 0.32rem 0;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .ahf-link-list a i {
          font-size: 1rem;
          color: #d9a441;
        }
        .ahf-link-list a:hover {
          color: #f5efe4;
          transform: translateX(3px);
        }
        .ahf-contact-item {
          display: flex;
          gap: 0.8rem;
          align-items: flex-start;
          padding: 0.45rem 0;
          font-size: 1.3rem;
          color: #c9c1b2;
          text-decoration: none;
          line-height: 1.5;
        }
        a.ahf-contact-item:hover {
          color: #f5efe4;
        }
        .ahf-contact-item i {
          color: #d9a441;
          margin-top: 3px;
          width: 16px;
          text-align: center;
        }
        .ahf-review-card {
          background: rgba(217, 164, 65, 0.08);
          border: 1px solid rgba(217, 164, 65, 0.25);
          border-radius: 12px;
          padding: 1.3rem 1.2rem;
        }
        .ahf-review-card p {
          font-size: 1.25rem;
          color: #d8d0bf;
          line-height: 1.55;
          margin: 0 0 1rem;
        }
        .ahf-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #d9a441;
          color: #141210;
          font-weight: 800;
          font-size: 1.3rem;
          padding: 0.75rem 1.4rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .ahf-review-btn:hover {
          background: #e8b95a;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(217, 164, 65, 0.35);
        }
        .ahf-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ahf-bottom-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 1.2rem;
          color: #8d8677;
        }
        .ahf-bottom-inner strong {
          color: #d9a441;
        }
        @media (max-width: 900px) {
          .ahf-footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 2.5rem 1.2rem 1.5rem;
          }
        }
        @media (max-width: 560px) {
          .ahf-footer-top {
            grid-template-columns: 1fr;
            gap: 1.8rem;
          }
          .ahf-bottom-inner {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <div className="ahf-footer-top">
        <div className="ahf-col">
          <div className="ahf-brand">
            <svg width="42" height="42" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
            Custom furniture, modular kitchens and interiors crafted in-house for Mumbai, Navi Mumbai and Thane homes.
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
          <span>
            © {new Date().getFullYear()} <strong>Ananya House of Furniture</strong> | All rights reserved
          </span>
          <span>Crafted with care in Mumbai & Thane</span>
        </div>
      </div>
    </footer>
  );
}
