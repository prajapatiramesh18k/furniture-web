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
}

const fallbackReviews: Review[] = [
  {
    _id: '1',
    name: 'Priya Sharma',
    location: 'Thane, Mumbai',
    rating: 5,
    text: 'Absolutely love the custom dining table we ordered! The quality is exceptional and the delivery was on time. Highly recommend Ananya House of Furniture!',
    photo: 'images/team-1.png',
    date: 'Dec 2024',
  },
  {
    _id: '2',
    name: 'Rajesh Patel',
    location: 'Mira Road, Mumbai',
    rating: 5,
    text: 'Got my bedroom set from here and it\'s stunning! The craftsmanship is top-notch. The team was very helpful throughout the process.',
    photo: 'images/team-3.png',
    date: 'Nov 2024',
  },
  {
    _id: '3',
    name: 'Anita Desai',
    location: 'Andheri, Mumbai',
    rating: 5,
    text: 'Best furniture shop in Thane! I ordered a modular kitchen and it\'s perfect. Great quality at reasonable prices.',
    photo: 'images/team-3.png',
    date: 'Oct 2024',
  },
  {
    _id: '4',
    name: 'Meera Singh',
    location: 'Mulund, Mumbai',
    rating: 5,
    text: 'Amazing service and beautiful furniture. The custom sofa we ordered fits perfectly in our living room. Will definitely order again!',
    photo: 'images/team-4.png',
    date: 'Sep 2024',
  },
  {
    _id: '5',
    name: 'Vikram Joshi',
    location: 'Bandra, Mumbai',
    rating: 5,
    text: 'I ordered furniture for my new home and everything exceeded my expectations. Professional service and premium quality products.',
    photo: 'images/team-5.png',
    date: 'Aug 2024',
  },
  {
    _id: '6',
    name: 'Sunil Kumar',
    location: 'Dadar, Mumbai',
    rating: 4.5,
    text: 'Great experience! The team understood our requirements perfectly and delivered exactly what we wanted. Worth every rupee!',
    photo: 'images/team-6.png',
    date: 'Jul 2024',
  },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(fallbackReviews);
        }
        setLoaded(true);
      })
      .catch(() => {
        setReviews(fallbackReviews);
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    let swiperInstance: any = null;

    const initSwiper = async () => {
      const Swiper = (await import('swiper')).default;
      const { Autoplay } = await import('swiper/modules');

      swiperInstance = new Swiper('.testimonials-slider', {
        modules: [Autoplay],
        autoplay: { delay: 5000, disableOnInteraction: false },
        grabCursor: true,
        loop: reviews.length > 1,
        spaceBetween: 20,
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          991: { slidesPerView: 3 },
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

  return (
    <section className="testimonials" id="testimonials">
      <h1 className="heading">What Our <span>Customers Say</span></h1>
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
                  />
                )}
                <h3 className="testimonial-name">{review.name}</h3>
                <p className="testimonial-location">
                  <i className="fas fa-map-marker-alt"></i> {review.location}
                </p>
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
