import {
  trackGenerateLead,
  trackWhatsAppClick,
  type AnalyticsEventParams,
  type MarketingBranch,
} from '@/lib/analytics';
import { DEFAULT_WHATSAPP_NUMBER, PHONES } from '@/lib/site-config';

export const BRANCH_WHATSAPP_NUMBERS: Record<string, string> = {
  mumbai: PHONES.whatsappPrimary.e164,
  navi_mumbai: PHONES.whatsappPrimary.e164,
  thane: PHONES.whatsappPrimary.e164,
  ahmedabad: PHONES.whatsappPrimary.e164,
  bopal: PHONES.whatsappPrimary.e164,
};

export { DEFAULT_WHATSAPP_NUMBER };

export type QuoteWhatsAppData = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  branch?: string;
  location?: string;
  projectType?: string;
  message: string;
};

export type WhatsAppOpenOptions = AnalyticsEventParams & {
  branch?: MarketingBranch | string;
  trackAsLead?: boolean;
  projectType?: string;
};

const branchLabels: Record<string, string> = {
  mumbai: 'Mumbai / Navi Mumbai / Thane',
  navi_mumbai: 'Navi Mumbai',
  thane: 'Thane',
  ahmedabad: 'Ahmedabad',
  bopal: 'Bopal (Ahmedabad)',
};

export function formatBranchLabel(branch?: string) {
  if (!branch) return '';
  return branchLabels[branch] || branch;
}

export function getWhatsAppNumberForBranch(branch?: string) {
  if (branch && BRANCH_WHATSAPP_NUMBERS[branch]) {
    return BRANCH_WHATSAPP_NUMBERS[branch];
  }
  return (
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    DEFAULT_WHATSAPP_NUMBER
  );
}

export function buildQuoteWhatsAppMessage(data: QuoteWhatsAppData) {
  const lines = [
    'Hello Ananya House of Furniture,',
    'I just submitted a Get Quote request on your website. Here are my details:',
    '',
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
  ];

  if (data.address?.trim()) {
    lines.push(`Address: ${data.address.trim()}`);
  }

  if (data.location?.trim()) {
    lines.push(`Location: ${data.location.trim()}`);
  }

  const branchLabel = formatBranchLabel(data.branch);
  if (branchLabel) {
    lines.push(`Preferred Branch: ${branchLabel}`);
  }

  if (data.projectType?.trim()) {
    lines.push(`Project Type: ${data.projectType.trim()}`);
  }

  lines.push('', `Message: ${data.message}`, '', 'Please share a quotation. Thank you!');

  return lines.join('\n');
}

/** Contextual WhatsApp messages by service slug */
export const SERVICE_WHATSAPP_MESSAGES: Record<string, string> = {
  'custom-furniture-manufacturing':
    'Hi, I am interested in custom furniture manufacturing. Please contact me for a free consultation.',
  'modular-furniture-interior-work':
    'Hi, I am interested in modular furniture and interior work. I would like a free 3D design and site visit.',
  'furniture-repair-restoration':
    'Hi, I need furniture repair / restoration. Please contact me for a free assessment.',
  'finishing-polishing':
    'Hi, I am interested in furniture finishing and polishing. Please contact me for a free consultation.',
  'upholstery-work':
    'Hi, I am interested in upholstery work for my sofa / chairs. Please contact me for a free consultation.',
  'delivery-installation':
    'Hi, I need furniture delivery and installation. Please contact me with a quotation.',
  'furniture-design-consultation':
    'Hi, I would like a free design consultation and site visit for my space.',
  'furniture-sales-collection':
    'Hi, I want to know about your ready furniture collection. Please share details.',
  'product-customization':
    'Hi, I like one of your products and want it customized. Please contact me.',
  'commercial-furniture':
    'Hi, I need commercial furniture for my office / shop. Please contact me with a quotation.',
};

export function getServiceWhatsAppMessage(service?: string) {
  if (service && SERVICE_WHATSAPP_MESSAGES[service]) {
    return SERVICE_WHATSAPP_MESSAGES[service];
  }
  return 'Hi, I am interested in custom furniture / modular kitchen. I would like a free 3D design and site visit. My location:';
}

function openWhatsAppUrl(
  phone: string,
  message: string,
  options: WhatsAppOpenOptions = {}
) {
  const text = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${text}`;

  trackWhatsAppClick({
    branch: (options.branch as MarketingBranch) || 'unknown',
    cta: options.cta || 'whatsapp',
    cta_position: options.cta_position,
    source: options.source,
    project_type: options.projectType || options.project_type,
    service: options.service,
    location: options.location,
    page: options.page,
  });

  if (options.trackAsLead) {
    trackGenerateLead({
      branch: options.branch,
      cta: options.cta || 'quote_form',
      source: options.source,
      project_type: options.projectType || options.project_type,
      service: options.service,
      location: options.location,
    });
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openQuoteWhatsApp(data: QuoteWhatsAppData, options: WhatsAppOpenOptions = {}) {
  const branch = data.branch || options.branch;
  const phone = getWhatsAppNumberForBranch(branch);
  const message = buildQuoteWhatsAppMessage(data);

  openWhatsAppUrl(phone, message, {
    ...options,
    branch: branch || 'mumbai',
    projectType: data.projectType || options.projectType,
    trackAsLead: true,
    cta: options.cta || 'quote_form_whatsapp',
    source: options.source || 'contact_form',
  });
}

export function openWhatsAppChat(
  message: string,
  options: WhatsAppOpenOptions = {}
) {
  const branch = options.branch || 'mumbai';
  const phone = getWhatsAppNumberForBranch(branch);
  openWhatsAppUrl(phone, message, {
    ...options,
    branch,
    cta: options.cta || 'whatsapp_chat',
  });
}
