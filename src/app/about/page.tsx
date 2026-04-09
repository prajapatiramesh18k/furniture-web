'use client';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';

export default function AboutPage() {
  return (
    <div className="about-page">
      <button className="sr-back about-page-back" onClick={() => window.history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <AboutSection standalone />
      <TeamSection />
    </div>
  );
}
