'use client';

import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavbarWrapper />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
