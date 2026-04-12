'use client';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';

export default function AboutPage() {
  return (
    <div className="about-page">
      <AboutSection standalone />
      <TeamSection standalone />
    </div>
  );
}
