import { trackGenerateLead, trackWhatsAppClick, type MarketingBranch } from '@/lib/analytics';

export const BRANCH_WHATSAPP_NUMBERS: Record<string, string> = {
  mumbai: '919321812823',
  ahmedabad: '919321812823',
};

export const DEFAULT_WHATSAPP_NUMBER = BRANCH_WHATSAPP_NUMBERS.mumbai;

export type QuoteWhatsAppData = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  branch?: string;
  projectType?: string;
  message: string;
};

export type WhatsAppOpenOptions = {
  branch?: MarketingBranch | string;
  cta?: string;
  source?: string;
  projectType?: string;
  trackAsLead?: boolean;
};

const branchLabels: Record<string, string> = {
  mumbai: 'Mumbai (Head Office)',
  ahmedabad: 'Ahmedabad',
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
    source: options.source,
    project_type: options.projectType,
  });

  if (options.trackAsLead) {
    trackGenerateLead({
      branch: options.branch,
      cta: options.cta || 'quote_form',
      source: options.source,
      project_type: options.projectType,
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
