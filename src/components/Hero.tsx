'use client';
import { useEffect } from 'react';

const sliders = [
  {
    id: 1,
    image: 'images/home-slide1.jpg',
    heading: 'we just make a perfect furniture for home',
    tagline: 'with you since 2012',
  },
  {
    id: 2,
    image: 'images/home-slide2.jpg',
    heading: 'Creating flawless furniture for your home, where beauty meets utility',
    tagline: 'with you since 2012',
  },
  {
    id: 3,
    image: 'images/home-slide3.jpg',
    heading: 'Our expertise lies in crafting impeccable home furnishings',
    tagline: 'with you since 2012',
  },
  {
    id: 4,
    image: 'images/home-slide4.jpg',
    heading: 'Designing and building impeccable furniture to enhance your living space',
    tagline: 'with you since 2012',
  },
  {
    id: 5,
    image: 'images/home-slide5.jpg',
    heading: 'Bringing perfection to home furniture, where every piece is a masterpiece',
    tagline: 'with you since 2012',
  },
];

export default function Hero() {
  useEffect(() => {
    let swiper: any = null;
    let destroyed = false;

    const initSwiper = async () => {
      if (typeof window === 'undefined') return;

      const Swiper = (await import('swiper')).default;
      const { Autoplay, Navigation } = await import('swiper/modules');

      if (destroyed) return;

      swiper = new Swiper('.home-slider', {
        modules: [Autoplay, Navigation],
        autoplay: { delay: 7500, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        navigation: {
          nextEl: '#hero-next',
          prevEl: '#hero-prev',
        },
      });
    };

    initSwiper();

    return () => {
      destroyed = true;
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
          {sliders.map((slide) => (
            <div
              key={slide.id}
              className="swiper-slide slide"
              style={{ background: `url(${slide.image}) no-repeat` }}
            >
              <div className="content">
                <h3>{slide.heading}</h3>
                <span style={{ color: 'yellow' }}>{slide.tagline}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-slider-controls">
          <button className="hero-slider-btn prev-btn" id="hero-prev" aria-label="Previous slide">
            <i className="fas fa-arrow-left"></i>
          </button>
          <button className="hero-slider-btn next-btn" id="hero-next" aria-label="Next slide">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
