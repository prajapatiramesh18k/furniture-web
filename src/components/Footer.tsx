'use client';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '#services' },
  { label: 'Products', href: '#' },
  { label: 'Design Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

const contactInfo = {
  phone: '+91-9321812823 , +91-8318727813',
  email: 'contact@ananyahouseoffurniture.com',
  address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra, India -[400612]',
  addressLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
};

const socialLinks = {
  facebook: '#',
  twitter: '#',
  instagram: '#',
  linkedin: '#',
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
          <a href={`tel:${contactInfo.phone}`}>
            <i className="fas fa-phone"></i>{contactInfo.phone}
          </a>
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
          <a href={socialLinks.facebook}>
            <i className="fab fa-facebook-f"></i>facebook
          </a>
          <a href={socialLinks.twitter}>
            <i className="fab fa-twitter"></i>twitter
          </a>
          <a href={socialLinks.instagram}>
            <i className="fab fa-instagram"></i>instagram
          </a>
          <a href={socialLinks.linkedin}>
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

