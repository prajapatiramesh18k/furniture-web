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

    const initSwiper = async () => {
      if (typeof window === 'undefined') return;

      const Swiper = (await import('swiper')).default;
      const { Navigation, Autoplay } = await import('swiper/modules');

      swiper = new Swiper('.home-slider', {
        modules: [Navigation, Autoplay],
        autoplay: { delay: 7500, disableOnInteraction: false },
        grabCursor: true,
        loop: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    };

    initSwiper();

    return () => {
      if (swiper) {
        swiper.destroy(true, true);
        swiper = null;
      }
    };
  }, []);

  return (
    <section className="home" id="home">
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>

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
      </div>
    </section>
  );
}
