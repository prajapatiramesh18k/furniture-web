'use client';

import { openWhatsAppChat } from '@/lib/quote-whatsapp';

export default function WhatsAppFloat() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openWhatsAppChat(
      'Hi, I am interested in custom furniture / modular kitchen. Please share a free quote. My location:',
      {
        branch: 'mumbai',
        cta: 'float_button',
        source: 'sitewide_float',
      }
    );
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="whatsapp-float"
      aria-label="Chat on WhatsApp for a free quote"
    >
      <i className="fab fa-whatsapp"></i>
    </a>
  );
}
