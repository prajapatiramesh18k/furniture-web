import NavbarWrapper from '@/components/NavbarWrapper';
import AnnouncementBar from '@/components/AnnouncementBar';
import Hero from '@/components/Hero';
import Branches from '@/components/Branches';
import AboutSection from '@/components/AboutSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturedGallery from '@/components/FeaturedGallery';
import Services from '@/components/Services';
import Blog from '@/components/Blog';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <NavbarWrapper />
      <Hero />
      <FeaturedProducts />
      <FeaturedGallery />
      <Services />
      <Blog />
      <AboutSection />
      <Testimonials />
      <FAQ />
      <Branches />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
