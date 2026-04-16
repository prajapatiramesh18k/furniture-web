'use client';
import { useEffect } from 'react';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | About';
  }, []);

  return (
    <div className="about-page">
      <AboutSection standalone />
      <TeamSection standalone />
    </div>
  );
}
