'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleTrackedPhoneClick, trackEvent } from '@/lib/analytics';
import { openWhatsAppChat } from '@/lib/quote-whatsapp';
import { PHONES } from '@/lib/site-config';

const HIDDEN_PREFIXES = ['/admin', '/login', '/account', '/customer', '/punch', '/employee-management', '/quotation-maker'];

/** Sticky mobile bottom bar: CALL | WHATSAPP | GET QUOTE. Public pages only. */
export default function MobileCallBar() {
  const pathname = usePathname() || '/';
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  const onCall = () =>
    handleTrackedPhoneClick({
      branch: 'mumbai',
      cta: 'sticky_bar_call',
      cta_position: 'sticky_bottom_bar',
      source: 'sticky_bottom_bar',
    });

  const onWhatsApp = () =>
    openWhatsAppChat(
      'Hi, I am interested in custom furniture. I would like a free quote. My location:',
      { branch: 'mumbai', cta: 'sticky_bar_whatsapp', cta_position: 'sticky_bottom_bar', source: 'sticky_bottom_bar' }
    );

  return (
    <div className="mobile-call-bar" role="navigation" aria-label="Quick contact">
      <a href={`tel:${PHONES.mumbaiPrimary.tel}`} className="mcb-btn mcb-call" onClick={onCall}>
        <i className="fas fa-phone" /> <span>Call</span>
        <small>{PHONES.mumbaiPrimary.display}</small>
      </a>
      <button type="button" className="mcb-btn mcb-wa" onClick={onWhatsApp}>
        <i className="fab fa-whatsapp" /> <span>WhatsApp</span>
      </button>
      <Link
        href="/contact?type=Free%20Quote"
        className="mcb-btn mcb-quote"
        onClick={() =>
          trackEvent('quote_request', { cta: 'sticky_bar_quote', cta_position: 'sticky_bottom_bar', source: 'sticky_bottom_bar' })
        }
      >
        <i className="fas fa-file-invoice" /> <span>Get Quote</span>
      </Link>
    </div>
  );
}
