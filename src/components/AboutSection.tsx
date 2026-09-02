'use client';
import Link from 'next/link';
import CloseButton from '@/components/CloseButton';

const aboutData = {
  tagline: 'Welcome to Ananya House of Furniture',
  heading: 'We Enhance the Beauty of Your Home',
  description:
    'Founded in 2012, we have been passionate about making furniture that transforms spaces. Each piece is painstakingly crafted by our skilled artisans to ensure durability and timeless beauty. We back eco-friendly practices and neighborhood communities. Let Us Redefine Your Home by Choosing From Our Collections Today.',
  image: 'images/about.jpg',
  fullContent:
    'Founded in 2012, we have grown from a small workshop to a trusted name in custom furniture across Thane and Maharashtra. Our journey began with a simple vision: to create furniture that doesn\'t just fill a space but transforms it into a home.\n\nWhat sets us apart is our unwavering commitment to quality. Every piece that leaves our workshop undergoes rigorous quality checks. We source our wood from sustainable forests and use eco-friendly finishes that are safe for your family and the environment.\n\nOur team of 25+ skilled artisans brings decades of combined experience in woodworking, upholstery, and interior design. From traditional joinery techniques passed down through generations to modern CNC precision, we blend the best of both worlds.\n\nWe believe in transparent pricing with no hidden costs. Our in-house manufacturing means you get factory-direct prices without compromising on quality. Every purchase comes with our comprehensive 5-year warranty.',
  stats: [
    { number: '2012', label: 'Established' },
    { number: '14+', label: 'Years Experience' },
    { number: '25+', label: 'Skilled Craftsmen' },
    { number: '5yr', label: 'Warranty' },
  ],
  whyChooseUs: [
    {
      title: 'Premium Quality Materials',
      description: 'We use only solid hardwoods and premium materials sourced from certified suppliers.',
      icon: 'fa-gem',
    },
    {
      title: 'Custom Design Solutions',
      description: 'Bring your vision to life with our expert designers and craftsmen.',
      icon: 'fa-palette',
    },
    {
      title: '5-Year Warranty',
      description: 'Every piece comes with our comprehensive warranty for peace of mind.',
      icon: 'fa-shield-alt',
    },
    {
      title: 'Free Delivery & Installation',
      description: 'Pan-India delivery with professional installation at no extra cost.',
      icon: 'fa-truck',
    },
  ],
};

interface AboutSectionProps {
  standalone?: boolean;
}

export default function AboutSection({ standalone = false }: AboutSectionProps) {
  const paragraphs = aboutData.fullContent.split('\n').map((p, i) => <p key={i}>{p}</p>);

  if (standalone) {
    return (
      <div className="about-section-full">
        <div className="about-full-hero">
          <CloseButton href="/" />
          <div className="about-full-image">
            <img src="images/about.jpg" alt="About Ananya House of Furniture" />
            <div className="about-full-image-overlay" />
          </div>
          <div className="about-full-intro">
            <p className="about-full-tagline">{aboutData.tagline}</p>
            <h1>{aboutData.heading}</h1>
            <p className="about-full-desc">{aboutData.description}</p>
          </div>
        </div>

        <div className="about-full-story">
          <div className="about-full-story-label">
            <span className="about-label-line" />
            <span>Our Story</span>
          </div>
          <div className="about-full-story-content">{paragraphs}</div>
        </div>

        <div className="about-full-stats">
          {aboutData.stats.map((stat, i) => (
            <div key={i} className="about-full-stat">
              <span className="about-full-stat-number">{stat.number}</span>
              <span className="about-full-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="about-full-why">
          <div className="about-full-section-header">
            <h2>Why Choose <span>Us</span></h2>
          </div>
          <div className="about-full-why-grid">
            {aboutData.whyChooseUs.map((item, i) => (
              <div key={i} className="about-full-why-item">
                <div className="about-full-why-icon">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="about" id="about">
      <h1 className="heading"> <span>about</span> us</h1>
      <div className="row">
        <div className="image">
          <img src="images/about.jpg" alt="About Ananya" />
        </div>
        <div className="content">
          <span>{aboutData.tagline}</span>
          <h3>{aboutData.heading}</h3>
          <p>{aboutData.description}</p>
          <Link href="/about" className="btn">read more</Link>
        </div>
      </div>
    </section>
  );
}
