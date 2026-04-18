'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const sliders = [
  {
    id: 1,
    image: 'images/home-slide1.jpg',
    heading: 'Complete 2BHK & 3BHK Interior Solutions',
    tagline: 'Custom Furniture for Your Dream Home',
    subtext: 'Modular Kitchens • Wardrobes • TV Units • Beds & More',
  },
  {
    id: 2,
    image: 'images/home-slide2.jpg',
    heading: 'Transform Your Space with Custom Furniture',
    tagline: 'Free Design Consultation • Since 2012',
    subtext: 'Pooja Units, TV Units, Wardrobes & More',
  },
  {
    id: 3,
    image: 'images/home-slide3.jpg',
    heading: 'Expert Furniture Solutions for Your Home',
    tagline: 'Trusted by 500+ Happy Clients',
    subtext: 'Custom Designs • Premium Quality • On-Time Delivery',
  },
  {
    id: 4,
    image: 'images/home-slide4.jpg',
    heading: 'Your Dream Home Starts Here',
    tagline: 'Bespoke Furniture • 14+ Years of Trust',
    subtext: 'Living Room, Bedroom, Kitchen & Office',
  },
  {
    id: 5,
    image: 'images/home-slide5.jpg',
    heading: 'Ready-Made Furniture Collection',
    tagline: '14+ Years of Excellence • Since 2012',
    subtext: 'Premium Furniture • Shop Now',
  },
];

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let swiper: any = null;

    const initSwiper = async () => {
      const Swiper = (await import('swiper')).default;
      const { Autoplay, Navigation } = await import('swiper/modules');

      swiper = new Swiper('.home-slider', {
        modules: [Autoplay, Navigation],
        autoplay: { delay: 6000, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        navigation: {
          nextEl: '#hero-next',
          prevEl: '#hero-prev',
        },
        on: {
          slideChange: (swiper: any) => {
            setCurrentSlide(swiper.realIndex);
          },
        },
      });
    };

    initSwiper();

    return () => {
      if (swiper && typeof swiper.destroy === 'function') {
        swiper.destroy(true, true);
        swiper = null;
      }
    };
  }, []);

  return (
    <section className="home" id="home">
      <div className="swiper home-slider">
        <div className="swiper-wrapper">
          {sliders.map((slide, index) => (
            <div
              key={slide.id}
              className={`swiper-slide slide ${currentSlide === index ? 'active' : ''}`}
              style={{
                backgroundImage: `url("${slide.image}")`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content-wrapper">
                <div className="hero-badge">
                  <span className="hero-badge-icon">🏆</span>
                  <span>Handcrafted Furniture Experts • Since 2012</span>
                </div>
                <h3 className="hero-heading">{slide.heading}</h3>
                <div className="hero-tagline">
                  <span className="hero-tagline-text">{slide.tagline}</span>
                </div>
                <p className="hero-subtext">{slide.subtext}</p>
                <div className="hero-cta-group">
                  <a href="/contact" className="hero-cta-primary">
                    <span>Get Free Consultation</span>
                    <i className="fas fa-phone"></i>
                  </a>
                  <a href="/products" className="hero-cta-secondary">
                    <span>Shop Products</span>
                    <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default dynamic(() => Promise.resolve(HeroSlider), { ssr: false });
