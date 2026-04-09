'use client';

import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function SubmitReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sr-page">
      <NavbarWrapper />
      {children}
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
