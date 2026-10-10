'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';
import { handleTrackedPhoneClick, trackEvent } from '@/lib/analytics';
import { PHONES } from '@/lib/site-config';

const sliders = [
  {
    id: 1,
    image: '/images/home-slide5.jpg',
    heading: 'Free Site Visit & 3D Design Consultation',
    tagline: 'See Your Home Before We Build It',
    subtext: 'Book a free consultation • No commitment required',
  },
  {
    id: 2,
    image: '/images/home-slide1.jpg',
    heading: 'Complete Home Interior Solutions — 1BHK to 4BHK',
    tagline: 'Custom Furniture for Your Dream Home',
    subtext: 'Modular Kitchens • Wardrobes • TV Units • Beds • Pooja Units & More',
  },
  {
    id: 3,
    image: '/images/home-slide3.jpg',
    heading: 'In-House Manufacturing Since 2012',
    tagline: 'Factory-Direct Custom Furniture',
    subtext: 'In-house Manufacturing • Free Design • 5-Year Warranty',
  },
  {
    id: 4,
    image: '/images/home-slide2.jpg',
    heading: 'Office, Shop & Commercial Interiors',
    tagline: 'Custom Furniture for Every Business',
    subtext: 'Workstations • Counters • Display Units • Storage • Complete Fit-outs',
  },
  {
    id: 5,
    image: '/images/home-slide4.jpg',
    heading: 'Your Dream Home, Designed & Built by Us',
    tagline: 'Bespoke Furniture • Trusted Since 2012',
    subtext: 'Living Room • Bedroom • Kitchen • Office • Pooja Room',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setReady(true);
    // Warm the LCP image cache early (CSS backgrounds can't use priority).
    const img = new Image();
    img.src = sliders[0].image;
  }, []);

  useEffect(() => {
    if (!ready) return;

    let swiper: { destroy?: (deleteInstance?: boolean, cleanStyles?: boolean) => void } | null =
      null;
    let cancelled = false;

    const initSwiper = async () => {
      const Swiper = (await import('swiper')).default;
      const { Autoplay } = await import('swiper/modules');
      if (cancelled) return;

      swiper = new Swiper('.home-slider', {
        modules: [Autoplay],
        autoplay: { delay: 6000, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        on: {
          slideChange: (s: { realIndex: number }) => {
            setCurrentSlide(s.realIndex);
          },
        },
      });
    };

    initSwiper();

    return () => {
      cancelled = true;
      if (swiper && typeof swiper.destroy === 'function') {
        swiper.destroy(true, true);
        swiper = null;
      }
    };
  }, [ready]);

  const onWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    openWhatsAppChat(
      'Hi, I am interested in custom furniture / modular kitchen. I would like a free 3D design and site visit. My location:',
      {
        branch: 'mumbai',
        cta: 'hero_whatsapp',
        cta_position: 'homepage_hero',
        source: 'homepage_hero',
      }
    );
  };

  return (
    <section className="home" id="home">
      <div className="swiper home-slider">
        <div className="swiper-wrapper">
          {sliders.map((slide, index) => (
            <div
              key={slide.id}
              className={`swiper-slide slide${currentSlide === index ? ' active' : ''}`}
              style={{
                backgroundImage: `url("${slide.image}")`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="hero-overlay" />
<div className="hero-content-wrapper">
                  <div className="hero-badge">
                    <span className="hero-badge-icon">🏆</span>
                    <span>Handcrafted Furniture Experts • Since 2012</span>
                  </div>
                  {index === 0 ? (
                    <h1 className="hero-heading">{slide.heading}</h1>
                  ) : (
                    <h3 className="hero-heading">{slide.heading}</h3>
                  )}
                  <div className="hero-tagline">
                    <span className="hero-tagline-text">{slide.tagline}</span>
                  </div>
                  <p className="hero-subtext">{slide.subtext}</p>
                  
                  <div className="hero-trust-row" aria-label="Trust indicators">
                    <span>Since 2012</span>
                    <span>14+ Years Experience</span>
                    <span>25+ Skilled Craftsmen</span>
                    <span>5-Year Warranty</span>
                    <span>Free Site Visit</span>
                  </div>
                  
                  <div className="hero-cta-group">
                    <Link
                      href="/contact?type=Custom%20Furniture"
                      className="hero-cta-primary"
                      onClick={() =>
                        trackEvent('3d_design_request', {
                          cta_position: 'homepage_hero',
                          source: 'homepage_hero',
                        })
                      }
                    >
                      <span>Get Free 3D Design & Site Visit</span>
                      <i className="fas fa-cube" />
                    </Link>
                    <button
                      type="button"
                      className="hero-cta-secondary hero-cta-wa"
                      onClick={onWhatsApp}
                    >
                      <span>WhatsApp Us</span>
                      <i className="fab fa-whatsapp" />
                    </button>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
