'use client';

import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="about-page-root">
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
