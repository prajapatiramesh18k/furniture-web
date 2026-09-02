'use client';

import Link from 'next/link';
import { handleTrackedPhoneClick, trackEvent } from '@/lib/analytics';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';
import { PHONES } from '@/lib/site-config';

type LeadCtaProps = {
  service?: string;
  location?: string;
  whatsappMessage: string;
  ctaPosition?: string;
  phoneTel?: string;
  phoneDisplay?: string;
  compact?: boolean;
};

export default function LeadCta({
  service,
  location,
  whatsappMessage,
  ctaPosition = 'page_cta',
  phoneTel = PHONES.mumbaiPrimary.tel,
  phoneDisplay = PHONES.mumbaiPrimary.display,
  compact = false,
}: LeadCtaProps) {
  const trackCtx = {
    service,
    location,
    cta_position: ctaPosition,
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
  };

  const onWhatsApp = () => {
    openWhatsAppChat(whatsappMessage, {
      branch: location?.includes('ahmedabad') || location === 'bopal' ? 'ahmedabad' : 'mumbai',
      cta: ctaPosition,
      source: 'lead_cta',
      projectType: service,
      service,
      location,
    });
  };

  const onDesign = () => {
    trackEvent('3d_design_request', trackCtx);
    trackEvent('site_visit_request', { ...trackCtx, cta: 'free_3d_design' });
  };

  const onQuote = () => {
    trackEvent('quote_request', trackCtx);
  };

  return (
    <div className={`lead-cta ${compact ? 'lead-cta-compact' : ''}`}>
      {!compact && (
        <p className="lead-cta-offer">
          <i className="fas fa-gift" aria-hidden="true" /> Free Site Visit + 3D Design Consultation
        </p>
      )}
      <div className="lead-cta-actions">
        <Link
          href={`/contact?type=${encodeURIComponent(service || 'Custom Furniture')}${location ? `&location=${encodeURIComponent(location)}` : ''}`}
          className="lead-cta-primary"
          onClick={onDesign}
        >
          Get Free 3D Design
        </Link>
        <button type="button" className="lead-cta-whatsapp" onClick={onWhatsApp}>
          <i className="fab fa-whatsapp" aria-hidden="true" /> WhatsApp Us
        </button>
        <a
          href={`tel:${phoneTel}`}
          className="lead-cta-phone"
          onClick={() =>
            handleTrackedPhoneClick({
              branch: location?.includes('ahmedabad') || location === 'bopal' ? 'ahmedabad' : 'mumbai',
              cta: ctaPosition,
              source: 'lead_cta',
              service,
              location,
            })
          }
        >
          <i className="fas fa-phone" aria-hidden="true" /> Call Now
          <span className="lead-cta-phone-num">{phoneDisplay}</span>
        </a>
        <Link href="/contact" className="lead-cta-secondary" onClick={onQuote}>
          Request Quotation
        </Link>
      </div>
    </div>
  );
}
