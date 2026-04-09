'use client';
import { useEffect } from 'react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

const teamData: TeamMember[] = [
  {
    id: 1,
    name: 'Ramesh',
    role: 'Software Engineer',
    image: 'images/team-2.jpg',
    social: {
      facebook: 'https://www.facebook.com/profile.php?id=100009901991682&mibextid=ZbWKwL',
      twitter: 'https://x.com/RAMESHK41243561?t=FbeG012Bhdo--6srXgVeuQ&s=09',
      instagram: 'https://www.instagram.com/prajapati_ramesh_18b?igsh=YzljYTk1ODg3Zg==',
      linkedin: 'https://www.linkedin.com/in/ramesh-kumar-7ba5311a5',
    },
  },
  {
    id: 2,
    name: 'Pirtesh Koli',
    role: 'Architect / Interior Designer',
    image: 'images/team-5.png',
    social: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
  },
  {
    id: 3,
    name: 'Latien',
    role: 'Designer',
    image: 'images/team-6.png',
    social: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
  },
];

interface TeamSectionProps {
  standalone?: boolean;
}

export default function TeamSection({ standalone = false }: TeamSectionProps) {
  useEffect(() => {
    if (standalone) return;

    let swiper: any = null;
    const initSwiper = async () => {
      const Swiper = (await import('swiper')).default;
      const { Autoplay } = await import('swiper/modules');
      swiper = new Swiper('.team-slider', {
        modules: [Autoplay],
        autoplay: { delay: 7500, disableOnInteraction: false },
        grabCursor: true,
        loop: false,
        spaceBetween: 20,
        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 991: { slidesPerView: 3 } },
      });
    };
    initSwiper();
    return () => { if (swiper) swiper.destroy(true, true); };
  }, [standalone]);

  if (standalone) {
    return (
      <div className="team-section-full">
        <div className="about-full-section-header">
          <h2>Meet Our <span>Team</span></h2>
        </div>
        <div className="team-full-grid">
          {teamData.map((member) => (
            <div key={member.id} className="team-full-card">
              <div className="team-full-image">
                <img src={member.image} alt={member.name} />
                <div className="team-full-social">
                  <a href={member.social.facebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                  <a href={member.social.instagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>
              <div className="team-full-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="team" id="team">
      <h1 className="heading">our <span>team</span></h1>
      <div className="swiper team-slider">
        <div className="swiper-wrapper">
          {teamData.map((member) => (
            <div key={member.id} className="swiper-slide slide">
              <div className="image">
                <img src={member.image} alt={member.name} className="border-size" />
                <div className="share">
                  <a href={member.social.facebook} className="fab fa-facebook-f"></a>
                  <a href={member.social.twitter} className="fab fa-twitter"></a>
                  <a href={member.social.instagram} className="fab fa-instagram"></a>
                  <a href={member.social.linkedin} className="fab fa-linkedin"></a>
                </div>
              </div>
              <div className="content">
                <h3>{member.name}</h3>
                <span>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
