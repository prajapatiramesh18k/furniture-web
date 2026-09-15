import type { Metadata } from 'next';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'About Ananya House of Furniture',
  description:
    'Ananya House of Furniture — custom furniture, modular kitchens and interiors for Mumbai, Navi Mumbai & Thane since 2012. In-house manufacturing, free site visit and 3D design consultation.',
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    title: 'About Ananya House of Furniture',
    description:
      'Custom furniture makers for Mumbai, Navi Mumbai & Thane since 2012. In-house manufacturing and free 3D design consultation.',
    url: absoluteUrl('/about'),
    type: 'website',
  },
};

export const revalidate = 86400;

export default function AboutPage() {
  return (
    <div className="about-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      <AboutSection standalone />
      <TeamSection standalone />
    </div>
  );
}
