'use client';
import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo?: string;
  date: string;
  propertyType?: string;
  services?: string[];
}

const fallbackReviews: Review[] = [
  {
    _id: '1',
    name: 'Priya Sharma',
    location: 'Thane, Mumbai',
    rating: 5,
    text: 'Got our complete 2BHK done with modular kitchen, wardrobes, and TV unit. The quality is exceptional and the delivery was on time. Highly recommend!',
    photo: '/images/team-1.png',
    date: 'Dec 2024',
    propertyType: '2bhk',
    services: ['Modular Kitchen', 'Wardrobes', 'TV Units'],
  },
  {
    _id: '2',
    name: 'Rajesh Patel',
    location: 'Mira Road, Mumbai',
    rating: 5,
    text: 'Transformed our 3BHK bedroom with custom wardrobes and bed panelling. The craftsmanship is top-notch. The team was very helpful throughout!',
    photo: '/images/team-3.png',
    date: 'Nov 2024',
    propertyType: '3bhk',
    services: ['Wardrobes', 'Bed Panelling', 'Modular Bed'],
  },
  {
    _id: '3',
    name: 'Anita Desai',
    location: 'Andheri, Mumbai',
    rating: 5,
    text: 'Ordered a modular kitchen and it\'s perfect! Best decision for our home. Great quality at reasonable prices. The pooja unit they made is beautiful too.',
    photo: '/images/team-3.png',
    date: 'Oct 2024',
    propertyType: '1bhk',
    services: ['Modular Kitchen', 'Pooja Unit'],
  },
  {
    _id: '4',
    name: 'Meera Singh',
    location: 'Mulund, Mumbai',
    rating: 5,
    text: 'Amazing service! Got a complete kids room setup with wardrobe and study table. Beautiful furniture that fits perfectly. Will definitely order again!',
    photo: '/images/team-4.png',
    date: 'Sep 2024',
    propertyType: '2bhk',
    services: ['Wardrobes', 'Kids Furniture', 'Bookshelf'],
  },
  {
    _id: '5',
    name: 'Vikram Joshi',
    location: 'Bandra, Mumbai',
    rating: 5,
    text: 'Got our new office space furnished with workstations and meeting room furniture. Everything exceeded expectations. Professional service!',
    photo: '/images/team-5.png',
    date: 'Aug 2024',
    propertyType: 'office',
    services: ['Office Furniture', 'Complete Interior'],
  },
  {
    _id: '6',
    name: 'Sunil Kumar',
    location: 'Dadar, Mumbai',
    rating: 4.5,
    text: 'Great experience! Complete living room makeover with TV unit, crockery unit, and shoe rack. The team understood our requirements perfectly!',
    photo: '/images/team-6.png',
    date: 'Jul 2024',
    propertyType: '4bhk',
    services: ['TV Units', 'Crockery Unit', 'Shoe Rack'],
  },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Live wall: if the database has approved reviews, show only those.
    // Dummy fallback shows only when the DB list is empty (or fetch fails),
    // so e.g. a single approved review (Rajan) shows alone without defaults.
    // no-store: never serve a stale cached empty list from the browser cache.
    fetch('/api/reviews?limit=50', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`reviews fetch failed: ${res.status}`);
        return res.json() as Promise<Review[]>;
      })
      .then((data) => {
        if (cancelled) return;
        const real = Array.isArray(data) ? data : [];
        setReviews(real.length > 0 ? real : [...fallbackReviews]);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReviews(fallbackReviews);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded || reviews.length <= 1) return;

    let swiperInstance: any = null;

    const initSwiper = async () => {
      const Swiper = (await import('swiper')).default;
      const { Autoplay } = await import('swiper/modules');

      swiperInstance = new Swiper('.testimonials-slider', {
        modules: [Autoplay],
        autoplay: { delay: 5000, disableOnInteraction: false },
        grabCursor: true,
        loop: reviews.length > 3,
        centeredSlides: reviews.length < 3,
        spaceBetween: 20,
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: Math.min(2, reviews.length) },
          991: { slidesPerView: Math.min(3, reviews.length) },
        },
      });
    };

    initSwiper();

    return () => {
      if (swiperInstance) {
        swiperInstance.destroy(true, true);
      }
    };
  }, [loaded, reviews.length]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }
    if (rating % 1 >= 0.5) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    return stars;
  };

  if (!loaded) return null;

  // Single review: skip the slider and render one centered card (a 1-slide
  // swiper sticks to the left because slidesPerView is 2-3 on desktop).
  if (reviews.length === 1) {
    const review = reviews[0];
    return (
      <section className="testimonials" id="testimonials">
        <h2 className="heading">What Our <span>Clients Say</span></h2>
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '50px' }}>
          <div className="testimonial-card">
            {review.photo && (
              <img
                src={review.photo}
                alt={review.name}
                className="testimonial-image"
              loading="lazy" decoding="async" />
            )}
            <h3 className="testimonial-name">{review.name}</h3>
            <p className="testimonial-location">
              <i className="fas fa-map-marker-alt"></i> {review.location}
            </p>
            {review.propertyType && (
              <div className="testimonial-project-info">
                <span className="testimonial-property">{review.propertyType?.toUpperCase()}</span>
                {review.services && review.services.length > 0 && (
                  <span className="testimonial-services">
                    {review.services.slice(0, 2).join(' • ')}
                    {review.services.length > 2 && ` +${review.services.length - 2}`}
                  </span>
                )}
              </div>
            )}
            <div className="testimonial-stars" style={{ color: '#ffc107' }}>
              {renderStars(review.rating)}
            </div>
            <p className="testimonial-text">&ldquo;{review.text}&rdquo;</p>
            {review.date && (
              <p className="testimonial-date">{review.date}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials" id="testimonials">
      <h2 className="heading">What Our <span>Clients Say</span></h2>
      <div className="testimonials-slider swiper">
        <div className="swiper-wrapper">
          {reviews.map(review => (
            <div key={review._id} className="swiper-slide">
              <div className="testimonial-card">
                {review.photo && (
                  <img
                    src={review.photo}
                    alt={review.name}
                    className="testimonial-image"
                  loading="lazy" decoding="async" />
                )}
                <h3 className="testimonial-name">{review.name}</h3>
                <p className="testimonial-location">
                  <i className="fas fa-map-marker-alt"></i> {review.location}
                </p>
                {review.propertyType && (
                  <div className="testimonial-project-info">
                    <span className="testimonial-property">{review.propertyType?.toUpperCase()}</span>
                    {review.services && review.services.length > 0 && (
                      <span className="testimonial-services">
                        {review.services.slice(0, 2).join(' • ')}
                        {review.services.length > 2 && ` +${review.services.length - 2}`}
                      </span>
                    )}
                  </div>
                )}
                <div className="testimonial-stars" style={{ color: '#ffc107' }}>
                  {renderStars(review.rating)}
                </div>
                <p className="testimonial-text">&ldquo;{review.text}&rdquo;</p>
                {review.date && (
                  <p className="testimonial-date">{review.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
