import NavbarWrapper from '@/components/NavbarWrapper';
import AnnouncementBar from '@/components/AnnouncementBar';
import ProjectTypes from '@/components/ProjectTypes';
import HowItWorks from '@/components/HowItWorks';
import ProjectPricing from '@/components/ProjectPricing';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const metadata = {
  title: 'Custom Furniture Projects | Ananya House of Furniture',
  description: 'Explore our custom furniture project types, how we work, and transparent pricing for 1BHK, 2BHK, 3BHK, 4BHK, office, shop, restaurant, and showroom interiors.',
};

export default function ProjectsPage() {
  return (
    <>
      <AnnouncementBar />
      <NavbarWrapper />
      <ProjectTypes />
      <HowItWorks />
      <ProjectPricing />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
