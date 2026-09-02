'use client';

import { openWhatsAppChat, getServiceWhatsAppMessage } from '@/lib/quote-whatsapp';

type WhatsAppFloatProps = {
  message?: string;
  service?: string;
  location?: string;
};

export default function WhatsAppFloat({
  message,
  service,
  location,
}: WhatsAppFloatProps = {}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const text =
      message ||
      getServiceWhatsAppMessage(service) +
        (location ? ` My location is ${location}.` : '');

    openWhatsAppChat(text, {
      branch:
        location === 'ahmedabad' || location === 'bopal' ? 'ahmedabad' : 'mumbai',
      cta: 'float_button',
      cta_position: 'sitewide_float',
      source: 'sitewide_float',
      service,
      location,
    });
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="whatsapp-float"
      aria-label="Chat on WhatsApp for a free quote"
    >
      <i className="fab fa-whatsapp" aria-hidden="true" />
    </a>
  );
}
