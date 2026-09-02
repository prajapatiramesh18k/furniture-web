'use client';

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

export default function Footer() {
  return (
    <section className="footer">
      <div className="box-container">
        <div className="box" suppressHydrationWarning>
          <h3>quick links</h3>
          {quickLinks.map((link, index) => (
            <a key={index} href={link.href}>
              <i className="fas fa-angle-right"></i> {link.label}
            </a>
          ))}
        </div>
        <div className="box">
          <h3>contact info</h3>
          {contactInfo.phones.map((phone) => (
            <a
              key={phone.tel}
              href={`tel:${phone.tel}`}
              onClick={() =>
                handleTrackedPhoneClick({
                  branch: phone.branch,
                  cta: 'footer_phone',
                  source: 'footer',
                })
              }
            >
              <i className="fas fa-phone"></i>
              {phone.display}
            </a>
          ))}
          <a href={`mailto:${contactInfo.email}`}>
            <i className="fas fa-envelope"></i>{contactInfo.email}
          </a>
          <a href={contactInfo.addressLink} target="_blank" rel="noopener noreferrer">
            <i className="fas fa-map"></i>{contactInfo.address}
          </a>
        </div>
        <div className="box">
          <h3>share your experience</h3>
          <p className="footer-review-text">We value your feedback! Let us know how we did.</p>
          <a href="/submit-review" className="btn footer-review-btn">
            <i className="fas fa-star"></i> Submit Review
          </a>
        </div>
        <div className="box">
          <h3>follow us</h3>
          <a href="https://www.facebook.com/share/18eDGjuM47/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f"></i>facebook
          </a>
          <a href="#">
            <i className="fab fa-twitter"></i>twitter
          </a>
          <a href="https://www.instagram.com/ananyahouseoffurniture" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>instagram
          </a>
          <a href="#">
            <i className="fab fa-linkedin"></i>linkedin
          </a>
        </div>
      </div>
      <div className="credit">
        created by Ananya House of Furniture Team | all rights reserved
      </div>
    </section>
  );
}

